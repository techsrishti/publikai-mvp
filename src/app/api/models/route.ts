import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const models = await prisma.model.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        modelType: true,
        license: true,
        sourceType: true,
        url: true,
        tags: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}