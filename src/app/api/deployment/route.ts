import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate API key utility
function generateApiKey(modelUniqueName: string): string {
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${modelUniqueName}-${randomPart}`;
}

export async function POST(req: Request) {
  try {
    const { modelId, status, deploymentUrl, apiKey, modelUniqueName, gpuType } = await req.json();
    let finalApiKey = apiKey;
    if (!finalApiKey && modelUniqueName) {
      finalApiKey = generateApiKey(modelUniqueName);
    }

    // First, find if a deployment exists for this model
    const existingDeployment = await prisma.deployment.findFirst({
      where: { modelId }
    });

    let deployment;
    if (existingDeployment) {
      // Update existing deployment
      deployment = await prisma.deployment.update({
        where: { id: existingDeployment.id },
        data: {
          status,
          deploymentUrl,
          apiKey: finalApiKey,
          gpuType,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new deployment
      deployment = await prisma.deployment.create({
        data: {
          modelId,
          status,
          deploymentUrl,
          apiKey: finalApiKey,
          gpuType,
        },
      });
    }

    return NextResponse.json({ success: true, deployment });
  } catch (e) {
    console.error('Error creating deployment:', e);
    return NextResponse.json({ error: 'Failed to create deployment' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return only the latest deployment per model
    const deployments = await prisma.deployment.findMany({
      distinct: ['modelId'],
      orderBy: { updatedAt: 'desc' },
      include: { model: true },
    });
    console.log(deployments)
    return NextResponse.json({ deployments });
  } catch (e: unknown) {
    console.error('Error getting deployment:', e);
    return NextResponse.json({ error: 'Failed to get deployment' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Deployment ID is required' }, { status: 400 });
    }

    // First check if the deployment exists
    const existingDeployment = await prisma.deployment.findUnique({
      where: { id },
    });

    if (!existingDeployment) {
      return NextResponse.json(
        { success: false, message: 'Deployment not found' },
        { status: 404 }
      );
    }

    const deployment = await prisma.deployment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deployment });
  } catch (error: unknown) {
    console.error('Delete deployment error:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Deployment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to delete deployment' },
      { status: 500 }
    );
  }
} 