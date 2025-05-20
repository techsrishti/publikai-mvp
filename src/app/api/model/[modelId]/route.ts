import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    // Get API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    const apiKey = authHeader.split(' ')[1];

    // Get deployment info
    const deployment = await prisma.deployment.findFirst({
      where: {
        modelId: params.modelId,
        apiKey: apiKey,
      },
      select: {
        id: true,
        modelId: true,
        deploymentUrl: true,
      },
    });

    if (!deployment) {
      return NextResponse.json(
        { error: 'Invalid model ID or API key' },
        { status: 403 }
      );
    }

    if (!deployment.deploymentUrl) {
      return NextResponse.json(
        { error: 'Deployment URL not found' },
        { status: 404 }
      );
    }

    // Get request body
    const body = await req.json();

    // Start timing
    const startTime = Date.now();

    try {
      
      // Make request to deployment URL
      const response = await fetch(deployment.deploymentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseTime = Date.now() - startTime;
      const responseData = await response.json();

      // Log API call
      await prisma.$executeRaw`
        INSERT INTO "ModelApiCall" ("id", "deploymentId", "latency", "statusCode", "errorMessage", "timestamp")
        VALUES (gen_random_uuid(), ${deployment.id}, ${responseTime}, ${response.status}, ${response.ok ? null : responseData.error || 'Unknown error'}, NOW())
      `;

      return NextResponse.json({
        response: responseData,
        response_time_ms: responseTime,
        status_code: response.status,
      });
    } catch (error) {
      console.error('Error making request:', error);
      const responseTime = Date.now() - startTime;
      
      // Log failed API call
      await prisma.$executeRaw`
        INSERT INTO "ModelApiCall" ("id", "deploymentId", "latency", "statusCode", "errorMessage", "timestamp")
        VALUES (gen_random_uuid(), ${deployment.id}, ${responseTime}, 500, ${error instanceof Error ? error.message : 'Unknown error'}, NOW())
      `;

      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Unknown error',
        response_time_ms: responseTime,
        status_code: 500,
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 