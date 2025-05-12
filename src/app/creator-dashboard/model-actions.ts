"use server"

import { prisma } from '@/lib/prisma';
import { SourceType } from '@prisma/client';

// Define error interface for Prisma errors
interface PrismaError {
  code?: string;
  meta?: {
    target?: string[];
  };
}

export async function uploadModelAction(formData: FormData) {
  try {
    // Extract all possible form fields
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const modelType = formData.get('modelType') as string | null;
    const license = formData.get('license') as string | null;
    const sourceType = formData.get('sourceType') as string | null;
    const url = formData.get('url') as string | null;
    const file = formData.get('file') as File | null;
    const modelName = formData.get('modelName') as string | null; // Used in creator-dashboard
    const urlModelType = formData.get('urlModelType') as string | null; // Used in creator-dashboard
    const parametersRaw = formData.get('parameters');
    const revision = formData.get('revision') as string | null;

    // Always ensure tags is an array
    const tagsRaw = formData.get('tags');
    const tags = typeof tagsRaw === 'string'
      ? tagsRaw.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    // Debug log for creator-dashboard version
    console.log('Creator Dashboard uploadModelAction received:', {
      name, description, modelType, license, sourceType, url, tags, modelName, urlModelType,
      parametersRaw, revision
    });

    // Validate required fields
    if (!name || !description || !modelType || !license || !sourceType || parametersRaw === null || parametersRaw === undefined || parametersRaw === '') {
      return { success: false, error: 'All required fields must be provided, including parameters.' };
    }
    const parameters = parseFloat(parametersRaw as string);
    if (isNaN(parameters)) {
      return { success: false, error: 'Parameters must be a valid number.' };
    }
    
    // Optional validation for tags (specific to creator-dashboard)
    if (tags.length === 0) {
      return { success: false, error: 'At least one tag is required.' };
    }
    
    // Validate source type
    const normalizedSourceType = sourceType.toUpperCase() as SourceType;
    if (!Object.values(SourceType).includes(normalizedSourceType)) {
      return { success: false, error: 'Invalid source type' };
    }

    // For URL source type, url must be present
    if (normalizedSourceType === SourceType.URL && !url) {
      return { success: false, error: 'URL is required for URL source type.' };
    }

    // File validation removed - files are now optional
    
    // Check if a model with the same name already exists
    const existing = await prisma.model.findUnique({ where: { name } });
    if (existing) {
      return { success: false, error: 'A model with this name already exists.' };
    }

    // Process file upload (if applicable)
    let fileUrl = url;
    if (normalizedSourceType === SourceType.UPLOAD && file) {
      // In a production environment, you would:
      // 1. Upload the file to a storage service
      // 2. Get the URL to the uploaded file
      // For this example, we'll use a placeholder
      fileUrl = 'file-upload-placeholder';
    } else if (normalizedSourceType === SourceType.UPLOAD) {
      // If no file is provided for UPLOAD type, use a placeholder
      fileUrl = 'pending-upload-placeholder';
    }

    // Create model in database - creator dashboard specific version
    const model = await prisma.model.create({
      data: {
        name,
        description,
        modelType,
        license,
        sourceType: normalizedSourceType,
        url: fileUrl,
        tags,
        parameters,
        revision,
      },
    });
    
    return { success: true, model };
  } catch (error: unknown) {
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
      return { success: false, error: 'Model name must be unique.' };
    }
    console.error('Error creating model in creator dashboard:', error);
    return { success: false, error: 'Failed to create model' };
  }
}