import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { refreshAccessToken } from '@/lib/google-calendar';
import { getUserFromRequest, hasRole } from '../../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const teacherEmail = searchParams.get('email');

    if (teacherEmail && teacherEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email },
      select: {
        email: true,
        googleCalendarConnected: true,
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    if (!teacher.googleCalendarConnected) {
      return NextResponse.json({ connected: false, needsReconnect: false });
    }

    const now = new Date();
    const tokenSkewMs = 60 * 1000;
    const isExpired = teacher.googleTokenExpiry
      ? now.getTime() >= (new Date(teacher.googleTokenExpiry).getTime() - tokenSkewMs)
      : true;

    if (!isExpired) {
      return NextResponse.json({ connected: true, needsReconnect: false });
    }

    // If expired but we have refresh token, attempt to refresh first.
    if (teacher.googleRefreshToken) {
      const refreshed = await refreshAccessToken(teacher.googleRefreshToken);

      if (refreshed) {
        await prisma.teacher.update({
          where: { email: teacher.email },
          data: {
            googleAccessToken: refreshed.accessToken,
            googleTokenExpiry: refreshed.expiry,
            googleCalendarConnected: true,
          },
        });

        return NextResponse.json({ connected: true, needsReconnect: false });
      }
    }

    return NextResponse.json({
      connected: false,
      needsReconnect: true,
    });
  } catch (error) {
    console.error('Error checking calendar status:', error);
    return NextResponse.json(
      { error: 'Failed to check calendar status' },
      { status: 500 }
    );
  }
}

// Disconnect Google Calendar
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const teacherEmail = searchParams.get('email');

    if (teacherEmail && teacherEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    await prisma.teacher.update({
      where: { email: user.email },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        googleCalendarConnected: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect calendar' },
      { status: 500 }
    );
  }
}
