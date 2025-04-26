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

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        role: true,
        creator: {
          select: { id: true }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { role: 'USER', isCreator: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      role: user.role,
      isCreator: user.role === 'CREATOR'
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}