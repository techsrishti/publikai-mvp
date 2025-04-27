import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
 
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();

    // Validate required fields
    const experienceLevel = formData.get('experienceLevel');
    const developmentGoals = formData.get('developmentGoals');
    const projectDescription = formData.get('projectDescription');
    const specialization = formData.getAll('specialization');
    const aiFrameworks = formData.getAll('aiFrameworks');
    const modelTypes = formData.getAll('modelTypes');


    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }




    // Create creator profile and update user role in a transaction

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in creator sign-up:', error);
    return NextResponse.json(
      { error: 'Failed to create creator profile', details: (error as Error).message },
      { status: 500 }
    );
  }
}