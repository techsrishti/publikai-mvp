import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { DeploymentStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { modelId, status, modelUniqueName, gpuType } = await req.json();

    // Fetch the model to get its script ID
    const model = await prisma.model.findUnique({
      where: { id: modelId },
      include: {
        script: true, // Include the related ModelScript
      },
    });

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // First, find if a deployment exists for this model
    const existingDeployment = await prisma.deployment.findFirst({
      where: { modelId }
    });

    let deployment;
    if (existingDeployment) {
      // Update existing deployment but keep the same API key
      deployment = await prisma.deployment.update({
        where: { id: existingDeployment.id },
        data: {
          status: DeploymentStatus.NOTDEPLOYED,
          gpuType,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new deployment with a new API key
      const apiKey = generateApiKey();
      deployment = await prisma.deployment.create({
        data: {
          modelId,
          status: DeploymentStatus.NOTDEPLOYED,
          gpuType,
          apiKey, // Set the API key when creating new deployment
        },
      });
    }

    // Start the deployment process
    const deploymentApiUrl = process.env.DEPLOYMENT_API_URL || "http://localhost:8000";

    if (!deploymentApiUrl) {
      // Update deployment status to failed if API URL is missing
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: DeploymentStatus.FAILED },
      });
      return NextResponse.json({ error: 'Deployment API configuration missing' }, { status: 500 });
    }

    const response = await fetch(`${deploymentApiUrl}/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        org_name: model.url?.split('/')[3] || 'default',
        model_name: model.url?.split('/')[4] || model.name,
        model_revision: model.revision || 'main',
        model_unique_name: model.name,
        param_count: model.parameters,
        custom_script: model.script?.content || null,
        user_id: clerkId,
        api_key: deployment.apiKey, // Send the API key to the deployment API
      }),
    });

    console.log('Deployment API Response Status:', response.status);
    console.log('Deployment API Response Headers:', Object.fromEntries(response.headers.entries()));

    // Try to parse response
    let responseData;
    try {
      responseData = await response.json();
      console.log('Deployment API response:', responseData);
    } catch (e) {
      console.error('Failed to parse deployment API response:', e);
      responseData = { error: 'Failed to parse deployment API response' };
    }

    if (!response.ok) {
      // Update deployment status to failed
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { 
          status: DeploymentStatus.FAILED,
          updatedAt: new Date()
        },
      });
      
      return NextResponse.json({ 
        error: 'Deployment API error',
        details: responseData,
        status: response.status,
        message: responseData.error || responseData.detail || 'Unknown deployment error'
      }, { status: 500 });
    }

    // Update deployment with success data but keep the same API key
    deployment = await prisma.deployment.update({
      where: { id: deployment.id },
      data: { 
        status: DeploymentStatus.RUNNING,
        deploymentUrl: responseData.deployment_url || null,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ 
      success: true, 
      deployment,
      script: model.script?.content || null,
      response: responseData
    });
  } catch (e) {
    console.error('Error creating deployment:', e);
    return NextResponse.json({ 
      error: 'Failed to create deployment',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to generate a random API key
function generateApiKey(): string {
  const prefix = 'pk_';
  const length = 32;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 