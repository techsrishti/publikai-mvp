import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, SourceType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    // Extract form fields
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const modelType = formData.get('modelType') as string | null;
    const license = formData.get('license') as string | null;
    const sourceType = formData.get('sourceType') as string | null;
    const url = formData.get('url') as string | null;
    const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean) || [];
    const file = formData.get('file') as File | null;
    const modelName = formData.get('modelName') as string | null;
    const urlModelType = formData.get('urlModelType') as string | null;

    if (!sourceType) {
      return NextResponse.json({ error: 'Missing source type' }, { status: 400 });
    }
    const normalizedSourceType = sourceType.toUpperCase() as SourceType;
    if (!Object.values(SourceType).includes(normalizedSourceType)) {
      return NextResponse.json({ error: 'Invalid source type' }, { status: 400 });
    }

    if (normalizedSourceType === SourceType.UPLOAD) {
      if (!name || !description || !modelType || !license) {
        return NextResponse.json({ error: 'Missing required fields for upload' }, { status: 400 });
      }
      // File is optional for now
    } else if (normalizedSourceType === SourceType.URL) {
      if (!url || !description) {
        return NextResponse.json({ error: 'Missing required fields for URL' }, { status: 400 });
      }
    }

    // Create model with tags in a transaction
    const model = await prisma.$transaction(async (tx) => {
      const newModel = await tx.model.create({
        data: {
          name: normalizedSourceType === SourceType.UPLOAD ? name! : (modelName || null),
          description: description!,
          modelType: normalizedSourceType === SourceType.UPLOAD ? modelType! : (urlModelType || null),
          license: normalizedSourceType === SourceType.UPLOAD ? license! : null,
          sourceType: normalizedSourceType,
          url: normalizedSourceType === SourceType.URL ? url! : null,
        },
      });
      if (tags.length > 0) {
        await tx.tag.createMany({
          data: tags.map(tag => ({ tag, modelId: newModel.id })),
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