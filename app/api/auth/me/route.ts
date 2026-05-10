import { NextRequest, NextResponse } from 'next/server';
import {
  extractRefreshToken,
  getUserFromRequest,
  issueRefreshToken,
  rotateRefreshToken,
  setAuthCookie,
  setRefreshTokenCookie,
} from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const accessUser = await getUserFromRequest(request);
    let resolvedUser: {
      id: number;
      email: string;
      name: string;
      role: 'teacher' | 'student' | 'parent';
    } | null = accessUser
      ? {
          id: accessUser.id,
          email: accessUser.email,
          name: accessUser.name,
          role: accessUser.role,
        }
      : null;

    let rotatedSession: Awaited<ReturnType<typeof rotateRefreshToken>> | null = null;

    // If access token is expired but refresh token is present, recover in one call.
    if (!resolvedUser) {
      const refreshToken = extractRefreshToken(request);
      if (refreshToken) {
        rotatedSession = await rotateRefreshToken(refreshToken);
        resolvedUser = rotatedSession?.user ?? null;
      }
    }

    if (!resolvedUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: resolvedUser.id,
        email: resolvedUser.email,
        name: resolvedUser.name,
        role: resolvedUser.role
      }
    });

    if (rotatedSession) {
      setAuthCookie(response, rotatedSession.accessToken);
      setRefreshTokenCookie(response, rotatedSession.refreshToken);
      return response;
    }

    // Compatibility bridge: issue refresh cookie for already-authenticated legacy sessions.
    if (!extractRefreshToken(request)) {
      const refreshToken = await issueRefreshToken({
        id: resolvedUser.id,
        email: resolvedUser.email,
        name: resolvedUser.name,
        role: resolvedUser.role,
      });
      setRefreshTokenCookie(response, refreshToken);
    }

    return response;
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
