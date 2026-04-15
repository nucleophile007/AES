import { NextRequest, NextResponse } from 'next/server';
import {
  extractRefreshToken,
  getUserFromRequest,
  issueRefreshToken,
  setRefreshTokenCookie,
} from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Compatibility bridge: issue refresh cookie for already-authenticated legacy sessions.
    if (!extractRefreshToken(request)) {
      const refreshToken = await issueRefreshToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
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