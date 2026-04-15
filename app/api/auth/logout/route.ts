import { NextRequest, NextResponse } from 'next/server';
import {
  clearAuthCookie,
  clearRefreshTokenCookie,
  extractAuthToken,
  extractRefreshToken,
  revokeRefreshToken,
  revokeToken,
} from '../../../../lib/auth';
import { getClientIP } from '@/lib/security-utils';

export async function POST(request: NextRequest) {
  try {
    const accessToken = extractAuthToken(request);
    if (accessToken) {
      await revokeToken(accessToken, {
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    }

    const refreshToken = extractRefreshToken(request);
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear auth cookies
    clearAuthCookie(response);
    clearRefreshTokenCookie(response);
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}