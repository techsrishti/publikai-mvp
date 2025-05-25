import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  const resolvedParams = await params;
  const startTime = Date.now();
  
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    const apiKey = authHeader.split(' ')[1];

    // Get deployment info with optimized query
    const deployment = await prisma.deployment.findFirst({
      where: {
        modelId: resolvedParams.modelId,
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
    const body = await request.json();

    try {
      // Make request to deployment URL with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(deployment.deploymentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      const responseData = await response.json();

      // Async logging of API call - fire and forget
      prisma.modelApiCall
        .create({
          data: {
            modelId: deployment.modelId,
            latency: responseTime,
            statusCode: response.status,
            errorMessage: response.ok ? null : (responseData.error ?? 'Unknown error'),
          },
        })
        .catch(console.error);

      return NextResponse.json({
        response: responseData,
        response_time_ms: responseTime,
        status_code: response.status,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Async logging of failed API call - fire and forget
      prisma.modelApiCall
        .create({
          data: {
            modelId: deployment.modelId,
            latency: responseTime,
            statusCode: 500,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        })
        .catch(console.error);

      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json({
          error: 'Request timeout',
          response_time_ms: responseTime,
          status_code: 504,
        });
      }

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