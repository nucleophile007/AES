import { NextRequest, NextResponse } from 'next/server';
import {
  generateAccessToken,
  extractRefreshToken,
  getUserFromRequest,
  issueRefreshToken,
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

    const buildSessionResponse = ({
      user,
      accessToken,
      refreshToken,
    }: {
      user: { id: number; email: string; name: string; role: 'teacher' | 'student' | 'parent' };
      accessToken: string;
      refreshToken: string;
    }) => {
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      }, {
        headers: {
          'Cache-Control': 'no-store',
        },
      });

      setAuthCookie(response, accessToken);
      setRefreshTokenCookie(response, refreshToken);
      return response;
    };

    const recoverUsingAccessToken = async () => {
      const accessUser = await getUserFromRequest(request);
      if (!accessUser) {
        return null;
      }

      const user = {
        id: accessUser.id,
        email: accessUser.email,
        name: accessUser.name,
        role: accessUser.role,
      } as const;
      const nextRefreshToken = await issueRefreshToken(user);
      const nextAccessToken = generateAccessToken(user);
      return buildSessionResponse({
        user,
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      });
    };

    const refreshToken = extractRefreshToken(request);
    if (!refreshToken) {
      const recovered = await recoverUsingAccessToken();
      if (recovered) {
        return recovered;
      }

      await timingSafeDelay();
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          ...(process.env.NODE_ENV === 'development'
            ? { debug: { reason: 'missing_refresh_cookie' } }
            : {})
        },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const rotatedSession = await rotateRefreshToken(refreshToken);
    if (!rotatedSession) {
      const recovered = await recoverUsingAccessToken();
      if (recovered) {
        return recovered;
      }

      await timingSafeDelay();
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          ...(process.env.NODE_ENV === 'development'
            ? { debug: { reason: 'invalid_or_expired_refresh' } }
            : {})
        },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    return buildSessionResponse({
      user: rotatedSession.user,
      accessToken: rotatedSession.accessToken,
      refreshToken: rotatedSession.refreshToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
