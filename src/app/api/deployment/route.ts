import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate API key utility
function generateApiKey(modelUniqueName: string): string {
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${modelUniqueName}-${randomPart}`;
}

export async function POST(req: Request) {
  try {
    const { modelId, status, deploymentUrl, apiKey, modelUniqueName } = await req.json();
    let finalApiKey = apiKey;
    if (!finalApiKey && modelUniqueName) {
      finalApiKey = generateApiKey(modelUniqueName);
    }
    const deployment = await prisma.deployment.create({
      data: {
        modelId,
        status,
        deploymentUrl,
        apiKey: finalApiKey,
      },
    });
    return NextResponse.json({ success: true, deployment });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() });
  }
}

export async function GET() {
  try {
    const deployments = await prisma.deployment.findMany({
      include: { model: true },
      orderBy: { createdAt: 'desc' },
    });
    console.log(deployments)
    return NextResponse.json({ deployments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 });
  }
} 