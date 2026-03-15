import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-calendar';
import { prisma } from '@/lib/prisma';

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

    // Decode state to get teacher email
    let teacherEmail: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      teacherEmail = stateData.email;
    } catch {
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

    // Preserve existing refresh token if Google does not return a new one.
    // Google often omits refresh_token on subsequent consent flows.
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email: teacherEmail },
      select: { googleRefreshToken: true },
    });

    // Update teacher with Google Calendar tokens
    await prisma.teacher.update({
      where: { email: teacherEmail },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || existingTeacher?.googleRefreshToken || null,
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
