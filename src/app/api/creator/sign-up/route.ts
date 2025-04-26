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

    if (!experienceLevel || !developmentGoals || !projectDescription || 
        specialization.length === 0 || aiFrameworks.length === 0 || modelTypes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure CAPTCHA validation
    const captchaToken = formData.get('captchaToken');
    if (!captchaToken) {
      return NextResponse.json({ error: 'CAPTCHA validation failed' }, { status: 400 });
    }

    // Verify CAPTCHA token with Clerk's CAPTCHA service
    const captchaValidationResponse = await fetch('https://clerk.com/api/captcha/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: captchaToken }),
    });

    const captchaValidationResult = await captchaValidationResponse.json();
    if (!captchaValidationResult.success) {
      return NextResponse.json({ error: 'CAPTCHA validation failed' }, { status: 400 });
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