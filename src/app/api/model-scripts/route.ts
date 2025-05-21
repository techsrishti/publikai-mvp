import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { content, modelType } = await req.json();

    if (!content || !modelType) {
      return NextResponse.json(
        { error: 'Content and model type are required' },
        { status: 400 }
      );
    }

    // Create new ModelScript entry
    const script = await prisma.modelScript.create({
      data: {
        content: content as string,
        modelType: modelType as string,
        model: undefined, // The model relation is optional
      },
    });

    return NextResponse.json({ success: true, script });
  } catch (error) {
    console.error('Error creating model script:', error);
    return NextResponse.json(
      { error: 'Failed to create model script' },
      { status: 500 }
    );
  }
} 