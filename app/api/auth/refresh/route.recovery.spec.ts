import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const authMocks = vi.hoisted(() => ({
  generateAccessToken: vi.fn(),
  extractRefreshToken: vi.fn(),
  getUserFromRequest: vi.fn(),
  issueRefreshToken: vi.fn(),
  rotateRefreshToken: vi.fn(),
  setAuthCookie: vi.fn(),
  setRefreshTokenCookie: vi.fn(),
}));

vi.mock('../../../../lib/auth', () => authMocks);

import { POST } from './route';

describe('POST /api/auth/refresh recovery', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('recovers session from valid access token when refresh cookie is missing', async () => {
    authMocks.extractRefreshToken.mockReturnValue(null);
    authMocks.getUserFromRequest.mockResolvedValue({
      id: 10,
      email: 'teacher@example.com',
      name: 'Teacher',
      role: 'teacher',
    });
    authMocks.issueRefreshToken.mockResolvedValue('next-refresh-token');
    authMocks.generateAccessToken.mockReturnValue('next-access-token');

    const request = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const payload = await response.json();

    expect(payload).toEqual({
      success: true,
      user: {
        id: 10,
        email: 'teacher@example.com',
        name: 'Teacher',
        role: 'teacher',
      },
    });

    expect(authMocks.issueRefreshToken).toHaveBeenCalledTimes(1);
    expect(authMocks.generateAccessToken).toHaveBeenCalledTimes(1);
    expect(authMocks.setAuthCookie).toHaveBeenCalledTimes(1);
    expect(authMocks.setRefreshTokenCookie).toHaveBeenCalledTimes(1);
  });

  it('returns 401 when refresh token rotation fails and access token is not valid', async () => {
    authMocks.extractRefreshToken.mockReturnValue('refresh-token');
    authMocks.rotateRefreshToken.mockResolvedValue(null);
    authMocks.getUserFromRequest.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    const payload = await response.json();

    expect(payload).toEqual({
      success: false,
      error: 'Not authenticated',
    });
    expect(authMocks.setAuthCookie).not.toHaveBeenCalled();
    expect(authMocks.setRefreshTokenCookie).not.toHaveBeenCalled();
  });
});
