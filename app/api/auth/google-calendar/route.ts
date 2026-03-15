import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teacherEmail = searchParams.get('email');
    
    if (!teacherEmail) {
      return NextResponse.json(
        { error: 'Teacher email is required' },
        { status: 400 }
      );
    }

    // Create state parameter with teacher email (base64 encoded)
    const state = Buffer.from(JSON.stringify({ email: teacherEmail })).toString('base64');
    
    // Generate Google OAuth URL
    const authUrl = getGoogleAuthUrl(state);
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
