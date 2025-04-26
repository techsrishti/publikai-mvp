import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { creator: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { hasCompleted: false },
        { status: 200 }
      );
    }

    // Check if user has creator profile
    const hasCompletedQuestionnaire = !!user.creator;

    return NextResponse.json(
      { hasCompleted: hasCompletedQuestionnaire },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking questionnaire status:', error);
    return NextResponse.json(
      { message: 'Failed to check questionnaire status', error: (error as Error).message },
      { status: 500 }
    );
  }
}