import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Getting the user's email from the clerk session. TODO: Clean up of rearchitect. 
    const user = await currentUser();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json(
        { message: 'User email not found' },
        { status: 400 }
      );
    }
    
    const primaryEmail = user.emailAddresses[0].emailAddress;
    const formData = await request.formData();
    
    // First check if a user with this email already exists but with a different clerkId
    const existingUserWithEmail = await prisma.user.findUnique({
      where: { email: primaryEmail }
    });
    
    if (existingUserWithEmail && existingUserWithEmail.clerkId !== clerkId) {
      return NextResponse.json(
        { message: 'This email is already associated with another account' },
        { status: 409 }
      );
    }
    
    // Now safely perform the upsert
    const dbUser = await prisma.user.upsert({
      where: { clerkId },
      update: { role: 'CREATOR' },
      create: {
        clerkId,
        email: primaryEmail,
        role: 'CREATOR'
      }
    });

    // Then create or update the creator profile
    const creator = await prisma.creator.upsert({
      where: { userId: dbUser.id },
      create: {
        userId: dbUser.id,
        experienceLevel: formData.get('experienceLevel') as string,
        specialization: formData.getAll('specialization') as string[],
        aiFrameworks: formData.getAll('aiFrameworks') as string[],
        modelTypes: formData.getAll('modelTypes') as string[],
        developmentGoals: formData.get('developmentGoals') as string,
        projectDescription: formData.get('projectDescription') as string,
        portfolioUrl: formData.get('portfolioUrl') as string || null,
        githubUrl: formData.get('githubUrl') as string || null,
      },
      update: {
        experienceLevel: formData.get('experienceLevel') as string,
        specialization: formData.getAll('specialization') as string[],
        aiFrameworks: formData.getAll('aiFrameworks') as string[],
        modelTypes: formData.getAll('modelTypes') as string[],
        developmentGoals: formData.get('developmentGoals') as string,
        projectDescription: formData.get('projectDescription') as string,
        portfolioUrl: formData.get('portfolioUrl') as string || null,
        githubUrl: formData.get('githubUrl') as string || null,
      }
    });

    return NextResponse.json(
      { message: 'Creator profile updated successfully', data: creator },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in creator sign-up:', error);
    return NextResponse.json(
      { message: 'Failed to update creator profile', error: (error as Error).message },
      { status: 500 }
    );
  }
}