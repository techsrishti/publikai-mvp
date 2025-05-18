import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { Model, Deployment } from '@prisma/client';

interface ModelWithDeployments extends Model {
  Deployment: Deployment[];
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user from the database using clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the creator profile for the user
    const creator = await prisma.creator.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!creator) {
      return NextResponse.json({
        totalModels: 0,
        activeModels: 0,
        pendingModels: 0,
        modelEarnings: [],
        modelPerformance: []
      });
    }

    // Get all models with their deployment status
    const models = await prisma.model.findMany({
      include: {
        Deployment: true
      }
    }) as ModelWithDeployments[];

    // Calculate total, active, and pending models
    const totalModels = models.length;
    const activeModels = models.filter(model => 
      model.Deployment.some(deployment => deployment.status === 'success')
    ).length;
    const pendingModels = totalModels - activeModels;

    // Prepare model earnings data
    const modelEarnings = models.map(model => ({
      name: model.name,
      earnings: "₹0",
      percentage: 0,
      trend: "0%"
    }));

    // Prepare model performance data
    const modelPerformance = models.map(model => ({
      name: model.name,
      type: model.modelType || 'Unknown',
      requests: "0 requests",
      status: model.Deployment.some(d => d.status === 'success') ? 'Deployed' : 'Pending',
      performance: 0,
      earnings: "₹0"
    }));

    return NextResponse.json({
      totalModels,
      activeModels,
      pendingModels,
      modelEarnings,
      modelPerformance
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 