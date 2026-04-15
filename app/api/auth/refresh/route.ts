import { NextRequest, NextResponse } from 'next/server';
import {
  extractRefreshToken,
  rotateRefreshToken,
  setAuthCookie,
  setRefreshTokenCookie,
} from '../../../../lib/auth';
import { isSecureConnection, timingSafeDelay } from '@/lib/security-utils';

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && !isSecureConnection(request)) {
      return NextResponse.json(
        { success: false, error: 'Secure connection required. Please use HTTPS.' },
        { status: 403 }
      );
    }

    const refreshToken = extractRefreshToken(request);
    if (!refreshToken) {
      await timingSafeDelay();
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const rotatedSession = await rotateRefreshToken(refreshToken);
    if (!rotatedSession) {
      await timingSafeDelay();
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: rotatedSession.user.id,
        email: rotatedSession.user.email,
        name: rotatedSession.user.name,
        role: rotatedSession.user.role,
      },
    });

    setAuthCookie(response, rotatedSession.accessToken);
    setRefreshTokenCookie(response, rotatedSession.refreshToken);

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
