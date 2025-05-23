'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function getModels() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return { success: false, error: 'Unauthorized' }
    }

    const models = await prisma.model.findMany({
      include: {
        script: true,
      },
    })

    return { success: true, models }
  } catch (error) {
    console.error('Error fetching models:', error)
    return { success: false, error: 'Failed to fetch models' }
  }
}

export async function getModelById(modelId: string) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return { success: false, error: 'Unauthorized' }
    }

    const model = await prisma.model.findUnique({
      where: { id: modelId },
      include: {
        script: true,
      },
    })

    if (!model) {
      return { success: false, error: 'Model not found' }
    }

    return { success: true, model }
  } catch (error) {
    console.error('Error fetching model:', error)
    return { success: false, error: 'Failed to fetch model' }
  }
}

export async function updateModelWithScript(modelId: string, scriptId: string) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return { success: false, error: 'Unauthorized' }
    }

    const updatedModel = await prisma.model.update({
      where: { id: modelId },
      data: {
        scriptId,
        modelType: "user-defined",
      },
      include: {
        script: true,
      },
    })

    return { success: true, model: updatedModel }
  } catch (error) {
    console.error('Error updating model:', error)
    return { success: false, error: 'Failed to update model' }
  }
}

export async function deleteModel(modelId: string) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if model has any deployments
    const deployment = await prisma.deployment.findFirst({
      where: { modelId },
    })

    if (deployment) {
      return { success: false, error: 'Cannot delete a model that has deployments' }
    }

    // Delete the model
    await prisma.model.delete({
      where: { id: modelId },
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting model:', error)
    return { success: false, error: 'Failed to delete model' }
  }
} 