import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google-calendar';
import { getUserFromRequest } from '@/lib/auth';
import { createSignedOAuthState } from '@/lib/oauth-state';

export async function GET(request: NextRequest) {
  try {
    const hasRedirectBase = Boolean(process.env.GOOGLE_CALENDAR_REDIRECT_URI || process.env.NEXT_PUBLIC_BASE_URL);
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !hasRedirectBase) {
      return NextResponse.json(
        {
          error: 'Google Calendar OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALENDAR_REDIRECT_URI (or NEXT_PUBLIC_BASE_URL).',
        },
        { status: 500 }
      );
    }

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const teacherEmailParam = searchParams.get('email');

    if (teacherEmailParam && teacherEmailParam.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match authenticated user' }, { status: 403 });
    }

    // Create a signed state parameter bound to the authenticated teacher identity.
    const state = createSignedOAuthState({
      email: user.email,
      userId: user.id,
      role: user.role,
    });
    
    // Generate Google OAuth URL
    const authUrl = getGoogleAuthUrl(state);
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'development'
          ? `Failed to generate authorization URL: ${error instanceof Error ? error.message : 'unknown error'}`
          : 'Failed to generate authorization URL',
      },
      { status: 500 }
    );
  }
}
