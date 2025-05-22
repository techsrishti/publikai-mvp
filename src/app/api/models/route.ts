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
            subscriptionPrice: true,
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
            subscriptionPrice: true,
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
    const subscriptionPrice = parseFloat(formData.get("subscriptionPrice") as string)

    // Find the corresponding ModelScript for this model type, but only if it's not "other"
    let modelScript = null;
    if (modelType !== "other") {
      modelScript = await prisma.modelScript.findFirst({
        where: { modelType }
      });
    }

    // Create the model with the script reference
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
        subscriptionPrice,
        script: modelScript ? { connect: { id: modelScript.id } } : undefined,
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

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Model ID is required' }, { status: 400 });
    }

    // First check if the model exists
    const existingModel = await prisma.model.findUnique({
      where: { id },
    });

    if (!existingModel) {
      return NextResponse.json(
        { success: false, message: 'Model not found' },
        { status: 404 }
      );
    }

    // Delete associated metrics first
    await prisma.modelApiCall.deleteMany({
      where: { modelId: id }
    });

    // Delete associated deployments
    await prisma.deployment.deleteMany({
      where: { modelId: id }
    });

    // Delete the model
    const model = await prisma.model.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, model });
  } catch (error: unknown) {
    console.error('Delete model error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete model' },
      { status: 500 }
    );
  }
}