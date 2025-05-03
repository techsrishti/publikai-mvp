"use server"

import { prisma } from '@/lib/prisma';
import { SourceType } from '@prisma/client';

export async function uploadModelAction(formData: FormData) {
  try {
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const modelType = formData.get('modelType') as string | null;
    const license = formData.get('license') as string | null;
    const sourceType = formData.get('sourceType') as string | null;
    const url = formData.get('url') as string | null;

    // Always ensure tags is an array
    const tagsRaw = formData.get('tags');
    const tags = typeof tagsRaw === 'string'
      ? tagsRaw.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const modelName = formData.get('modelName') as string | null;
    const urlModelType = formData.get('urlModelType') as string | null;

    // Debug log: print all received values
    console.log('uploadModelAction received:', {
      name, description, modelType, license, sourceType, url, tags, modelName, urlModelType
    });

    if (!name || !description || !modelType || !license || !sourceType || tags.length === 0) {
      return { success: false, error: 'All fields except file/url are required.' };
    }
    const normalizedSourceType = sourceType.toUpperCase() as SourceType;
    if (!Object.values(SourceType).includes(normalizedSourceType)) {
      return { success: false, error: 'Invalid source type' };
    }

    // For URL, url must be present
    if (normalizedSourceType === SourceType.URL && !url) {
      return { success: false, error: 'URL is required for URL source type.' };
    }

    // Check if a model with the same name already exists
    const existing = await prisma.model.findUnique({ where: { name } });
    if (existing) {
      return { success: false, error: 'A model with this name already exists.' };
    }

    // Model name must be unique (Prisma will throw if not)
    const model = await prisma.model.create({
      data: {
        name: name ?? '',
        description: description ?? '',
        modelType: modelType ?? '',
        license: license ?? '',
        sourceType: normalizedSourceType,
        url: url ?? undefined,
        tags: tags.length > 0 ? tags : undefined,
      },
    });
    return { success: true, model };
  } catch (error: unknown) {
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('name')) {
      return { success: false, error: 'Model name must be unique.' };
    }
    console.error('Error creating model:', error);
    return { success: false, error: 'Failed to create model' };
  }
}
