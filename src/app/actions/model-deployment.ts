'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { DeploymentStatus } from '@prisma/client'

// Helper function to generate a random API key
function generateApiKey(): string {
  const prefix = 'pk_'
  const length = 32
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = prefix
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function deployModel(modelId: string, gpuType: string = 'default') {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      throw new Error('Unauthorized')
    }

    // Fetch the model to get its script ID
    const model = await prisma.model.findUnique({
      where: { id: modelId },
      include: {
        script: true, // Include the related ModelScript
      },
    })

    if (!model) {
      throw new Error('Model not found')
    }

    // First, find if a deployment exists for this model
    const existingDeployment = await prisma.deployment.findFirst({
      where: { modelId }
    })

    let deployment
    if (existingDeployment) {
      // Update existing deployment but keep the same API key
      deployment = await prisma.deployment.update({
        where: { id: existingDeployment.id },
        data: {
          status: DeploymentStatus.NOTDEPLOYED,
          gpuType,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new deployment with a new API key
      const apiKey = generateApiKey()
      deployment = await prisma.deployment.create({
        data: {
          modelId,
          status: DeploymentStatus.NOTDEPLOYED,
          gpuType,
          apiKey, // Set the API key when creating new deployment
        },
      })
    }

    // Start the deployment process
    const deploymentApiUrl = process.env.DEPLOYMENT_API_URL || "http://localhost:8000"

    if (!deploymentApiUrl) {
      // Update deployment status to failed if API URL is missing
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: DeploymentStatus.FAILED },
      })
      throw new Error('Deployment API configuration missing')
    }

    let response
    try {
      response = await fetch(`${deploymentApiUrl}/deploy`, {
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
      })
    } catch (fetchError) {
      // Update deployment status to failed
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { 
          status: DeploymentStatus.FAILED,
          updatedAt: new Date()
        },
      })
      throw new Error('Failed to connect to deployment API. Please check if the deployment service is running.' + fetchError)
    }

    console.log('Deployment API Response Status:', response.status)
    console.log('Deployment API Response Headers:', Object.fromEntries(response.headers.entries()))

    // Try to parse response
    let responseData
    try {
      const text = await response.text()
      // Check if the response is HTML (error page)
      if (text.trim().toLowerCase().startsWith('<!doctype html>')) {
        throw new Error('Deployment API returned an HTML error page. The service might be down.')
      }
      responseData = text ? JSON.parse(text) : {}
      console.log('Deployment API response:', responseData)
    } catch (e) {
      console.error('Failed to parse deployment API response:', e)
      // Update deployment status to failed
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { 
          status: DeploymentStatus.FAILED,
          updatedAt: new Date()
        },
      })
      throw new Error(e instanceof Error ? e.message : 'Failed to parse deployment API response')
    }

    if (!response.ok) {
      // Update deployment status to failed
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { 
          status: DeploymentStatus.FAILED,
          updatedAt: new Date()
        },
      })
      
      const errorMessage = responseData.error || responseData.detail || responseData.message || `Deployment failed with status ${response.status}`
      throw new Error(errorMessage)
    }

    // Update deployment with success data but keep the same API key
    deployment = await prisma.deployment.update({
      where: { id: deployment.id },
      data: { 
        status: DeploymentStatus.RUNNING,
        deploymentUrl: responseData.deployment_url || null,
        updatedAt: new Date()
      },
    })

    return { 
      success: true, 
      deployment,
      script: model.script?.content || null,
      response: responseData
    }
  } catch (e) {
    console.error('Error creating deployment:', e)
    throw new Error(e instanceof Error ? e.message : 'Failed to create deployment')
  }
} 