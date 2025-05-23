'use server'

import { prisma } from '@/lib/prisma'

// Generate API key utility
function generateApiKey(modelUniqueName: string): string {
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${modelUniqueName}-${randomPart}`
}

export async function getDeployments() {
  try {
    // Return only the latest deployment per model
    const deployments = await prisma.deployment.findMany({
      include: {
        model: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { deployments }
  } catch (e) {
    console.error('Error getting deployment:', e)
    throw new Error('Failed to get deployment')
  }
}

export async function createOrUpdateDeployment(
  modelId: string,
  status: string,
  deploymentUrl: string | null,
  apiKey: string | null,
  modelUniqueName: string | null,
  gpuType: string
) {
  try {
    let finalApiKey = apiKey
    if (!finalApiKey && modelUniqueName) {
      finalApiKey = generateApiKey(modelUniqueName)
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
      // Update existing deployment without changing the API key
      deployment = await prisma.deployment.update({
        where: { id: existingDeployment.id },
        data: {
          status,
          deploymentUrl,
          gpuType,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new deployment with API key
      deployment = await prisma.deployment.create({
        data: {
          modelId,
          status,
          deploymentUrl,
          apiKey: finalApiKey,
          gpuType,
        },
      })
    }

    // Return both the deployment and the script content
    return { 
      success: true, 
      deployment,
      script: model.script?.content || null,
    }
  } catch (e) {
    console.error('Error creating deployment:', e)
    throw new Error(e instanceof Error ? e.message : 'Failed to create deployment')
  }
}

export async function deleteDeployment(id: string) {
  try {
    if (!id) {
      throw new Error('Deployment ID is required')
    }

    // First check if the deployment exists
    const existingDeployment = await prisma.deployment.findUnique({
      where: { id },
    })

    if (!existingDeployment) {
      throw new Error('Deployment not found')
    }

    // Delete the deployment
    const deployment = await prisma.deployment.delete({
      where: { id },
    })

    return { success: true, deployment }
  } catch (error) {
    console.error('Delete deployment error:', error)
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      throw new Error('Deployment not found')
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to delete deployment')
  }
} 