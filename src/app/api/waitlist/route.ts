import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { googleAuth } from '@/app/lib/googleAuth';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

if (!SPREADSHEET_ID) {
  throw new Error('Missing required environment variable: GOOGLE_SPREADSHEET_ID');
}

interface ContactFormData {
  email: string;
  name?: string;
  message?: string;
  phone?: string;
}

export async function POST(req: Request) {
  try {
    const data: ContactFormData = await req.json();
    const { email, name, message, phone } = data;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Check if email already exists
    const readRange = 'A2:A'; // Assuming first row is headers
    const existingEmails = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: readRange,
    });

    const emailExists = existingEmails.data.values ? existingEmails.data.values.flat().includes(email) : false;
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Save contact information to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A1:E1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          email,
          name || '',
          phone || '',
          message || '',
          new Date().toISOString()
        ]],
      },
    });

    return NextResponse.json(
      { message: 'Successfully submitted contact information' },
      { status: 201 }
    );
  } catch (error: unknown) {
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