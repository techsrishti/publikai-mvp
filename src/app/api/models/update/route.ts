import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, SourceType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const modelType = formData.get('modelType') as string;
    const license = formData.get('license') as string;
    const sourceType = formData.get('sourceType') as string;
    const url = formData.get('url') as string | null;
    const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || [];
    const file = formData.get('file') as File | null;

    // Validate required fields
    if (!name || !description || !modelType || !license || !sourceType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate source type
    if (!Object.values(SourceType).includes(sourceType.toUpperCase() as SourceType)) {
      return NextResponse.json(
        { error: 'Invalid source type' },
        { status: 400 }
      );
    }

    // Validate source type specific fields
    if (sourceType === SourceType.URL && !url) {
      return NextResponse.json(
        { error: 'URL is required for URL-based models' },
        { status: 400 }
      );
    }

    if (sourceType === SourceType.UPLOAD && !file) {
      return NextResponse.json(
        { error: 'File is required for uploaded models' },
        { status: 400 }
      );
    }

    // TODO: Implement file handling logic here
    // For now, we'll just store the metadata

    // Create model with tags in a transaction
    const model = await prisma.$transaction(async (tx) => {
      const newModel = await tx.model.create({
        data: {
          name,
          description,
          modelType,
          license,
          sourceType: sourceType.toUpperCase() as SourceType,
          url: sourceType === SourceType.URL ? url : null,
        },
      });

      // Create tags if provided
      if (tags.length > 0) {
        await tx.tag.createMany({
          data: tags.map(tag => ({
            tag,
            modelId: newModel.id,
          })),
        });
      }

      return newModel;
    });

    return NextResponse.json({ success: true, model });
  } catch (error) {
    console.error('Error creating model:', error);
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
} 