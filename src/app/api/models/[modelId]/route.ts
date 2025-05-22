import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  { params }: { params: Promise<{ modelId: string }> }
) {
  const { modelId } = await params;
  
  try {
    const model = await prisma.model.findUnique({
      where: { id: modelId },
      include: {
        script: true, // Include the related ModelScript
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ model });
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  const { modelId } = await params;
  
  try {
    const { scriptId } = await request.json();

    if (!scriptId) {
      return NextResponse.json(
        { error: 'Script ID is required' },
        { status: 400 }
      );
    }

    // Update the model with the new script reference
    const model = await prisma.model.update({
      where: { id: modelId },
      data: {
        script: {
          connect: { id: scriptId }
        }
      },
      include: {
        script: true,
      },
    });

    return NextResponse.json({ success: true, model });
  } catch (error) {
    console.error('Error updating model:', error);
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    );
  }
} 