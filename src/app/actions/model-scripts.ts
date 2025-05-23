'use server'

import { prisma } from '@/lib/prisma'

export async function createModelScript(content: string, modelType: string) {
  try {
    if (!content || !modelType) {
      throw new Error('Content and model type are required')
    }

    // Create new ModelScript entry
    const script = await prisma.modelScript.create({
      data: {
        content,
        modelType,
      },
    })

    return { success: true, script }
  } catch (error) {
    console.error('Error creating model script:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to create model script')
  }
} 