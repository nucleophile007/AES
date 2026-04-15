import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-calendar';
import { prisma } from '@/lib/prisma';
import { verifySignedOAuthState } from '@/lib/oauth-state';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle user denial
    if (error) {
      return NextResponse.redirect(
        new URL('/teacher-dashboard?tab=schedule&calendar_error=access_denied', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/teacher-dashboard?tab=schedule&calendar_error=missing_params', request.url)
      );
    }

    // Verify signed state and decode teacher identity.
    const stateData = verifySignedOAuthState(state);
    if (!stateData || stateData.role !== 'teacher') {
      return NextResponse.redirect(
        new URL('/teacher-dashboard?tab=schedule&calendar_error=invalid_state', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL('/teacher-dashboard?tab=schedule&calendar_error=token_exchange_failed', request.url)
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: stateData.userId },
      select: { id: true, email: true, googleRefreshToken: true },
    });

    if (!teacher || teacher.email.toLowerCase() !== stateData.email.toLowerCase()) {
      return NextResponse.redirect(
        new URL('/teacher-dashboard?tab=schedule&calendar_error=invalid_state', request.url)
      );
    }

    // Preserve existing refresh token if Google does not return a new one.
    // Google often omits refresh_token on subsequent consent flows.
    // Update teacher with Google Calendar tokens
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || teacher.googleRefreshToken || null,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        googleCalendarConnected: true,
      },
    });

    // Redirect back to teacher dashboard with success message
    return NextResponse.redirect(
      new URL('/teacher-dashboard?tab=schedule&calendar_connected=true', request.url)
    );
  } catch (error) {
    console.error('Error handling Google Calendar callback:', error);
    return NextResponse.redirect(
      new URL('/teacher-dashboard?tab=schedule&calendar_error=server_error', request.url)
    );
  }
}
