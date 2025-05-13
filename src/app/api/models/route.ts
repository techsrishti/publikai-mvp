import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// An optional `summary` query parameter lets the client request a smaller payload (id, name, url, revision, parameters)
// This is useful in the creator-dashboard deployment tab where only these fields are needed and we want the
// response to be as small & fast as possible.

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const summary = searchParams.get('summary') !== null

    const models = await prisma.model.findMany({
      select: summary
        ? {
            id: true,
            name: true,
            url: true,
            revision: true,
            parameters: true,
          }
        : {
            id: true,
            name: true,
            description: true,
            modelType: true,
            license: true,
            sourceType: true,
            url: true,
            tags: true,
            createdAt: true,
            parameters: true,
            revision: true,
          },
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}