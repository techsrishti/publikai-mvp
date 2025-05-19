import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { googleAuth } from '@/app/lib/googleAuth';

const CONTACT_SPREADSHEET_ID = process.env.GOOGLE_CONTACT_SPREADSHEET_ID;

if (!CONTACT_SPREADSHEET_ID) {
  throw new Error('Missing required environment variable: GOOGLE_CONTACT_SPREADSHEET_ID');
}

interface ContactFormData {
  email: string;
  name: string;
  subject: string;
  message: string;
}

export async function POST(req: Request) {
  try {
    const data: ContactFormData = await req.json();
    const { email, name, subject, message } = data;

    if (!email || !name || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const sheets = google.sheets({
      auth: await googleAuth(),
      version: 'v4',
    });

    // Save contact information to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: CONTACT_SPREADSHEET_ID,
      range: 'A1:E1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          email,
          name,
          subject,
          message,
          new Date().toISOString()
        ]],
      },
    });

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Server configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit contact information' },
      { status: 500 }
    );
  }
} 