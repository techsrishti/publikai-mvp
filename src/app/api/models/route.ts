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
            // @ts-ignore - customScript field exists in database but not in types
            customScript: true,
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
            // @ts-ignore - customScript field exists in database but not in types
            customScript: true,
          },
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const modelType = formData.get("modelType") as string
    const license = formData.get("license") as string
    const sourceType = formData.get("sourceType") as "URL" | "UPLOAD"
    const url = formData.get("url") as string | null
    const tags = (formData.get("tags") as string).split(",")
    const revision = formData.get("revision") as string | null
    const parameters = parseFloat(formData.get("parameters") as string)
    const customScript = formData.get("customScript") as string | null

    const model = await prisma.model.create({
      data: {
        name,
        description,
        modelType,
        license,
        sourceType,
        url,
        tags,
        revision,
        parameters,
        // @ts-ignore - customScript field exists in database but not in types
        customScript,
      },
    })

    return NextResponse.json({ success: true, model })
  } catch (error) {
    console.error("Error creating model:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create model" },
      { status: 500 }
    )
  }
}