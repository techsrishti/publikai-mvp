import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Get and validate headers
    const rawHeaders = Object.fromEntries(Array.from(req.headers.entries()));
    const { 'svix-id': svixId, 'svix-timestamp': svixTimestamp, 'svix-signature': svixSignature } = rawHeaders;

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
    }

    // Verify webhook
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!webhookSecret) {
      throw new Error('Missing CLERK_WEBHOOK_SIGNING_SECRET');
    }

    let evt: WebhookEvent;
    try {
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    // Handle user creation or update
    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const { id: clerkId, email_addresses } = evt.data;
      const primaryEmail = email_addresses[0]?.email_address;

      if (!primaryEmail) {
        return NextResponse.json({ error: 'No email address found' }, { status: 400 });
      }

      try {
        // First try to find the user by email
        const existingUser = await prisma.user.findUnique({
          where: { email: primaryEmail },
          select: {
            id: true,
            email: true,
            clerkId: true,
            role: true
          }
        });

        let user;
        if (existingUser) {
          console.log('Updating existing user:', existingUser.id);
          // Update existing user
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: { clerkId },
            select: {
              id: true,
              email: true,
              clerkId: true,
              role: true
            }
          });
        } else {
          console.log('Creating new user with email:', primaryEmail, 'and clerkId:', clerkId);
          // Create new user - ensure clerkId is provided
          user = await prisma.user.create({
            data: {
              email: primaryEmail,
              clerkId, // This is required in the schema
              role: 'USER'
            },
            select: {
              id: true,
              email: true,
              clerkId: true,
              role: true
            }
          });
        }

        return NextResponse.json({
          message: 'User processed successfully',
          userId: user.id
        }, { status: 200 });
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        // Add more detailed error information
        // const errorMessage = dbError instanceof Error 
        //   ? `${dbError.message} (${(dbError as any).code || 'unknown'})` 
        //   : 'Unknown database error';
        
        return NextResponse.json({ 
          error: 'Failed to process user', 
          details: "Database operation failed" 
        }, { status: 500 });
      }
    }

    // Handle other webhook types if needed
    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
