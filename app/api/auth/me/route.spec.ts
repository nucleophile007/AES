import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const authMocks = vi.hoisted(() => ({
  extractRefreshToken: vi.fn(),
  getUserFromRequest: vi.fn(),
  issueRefreshToken: vi.fn(),
  rotateRefreshToken: vi.fn(),
  setAuthCookie: vi.fn(),
  setRefreshTokenCookie: vi.fn(),
}));

vi.mock('../../../../lib/auth', () => authMocks);

import { GET } from './route';

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 when no access user and no refresh token', async () => {
    authMocks.getUserFromRequest.mockResolvedValue(null);
    authMocks.extractRefreshToken.mockReturnValue(null);

    const request = new NextRequest('http://localhost/api/auth/me');
    const response = await GET(request);

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload).toEqual({ success: false, error: 'Not authenticated' });
  });

  it('returns authenticated user when access token is valid', async () => {
    authMocks.getUserFromRequest.mockResolvedValue({
      id: 1,
      email: 'teacher@example.com',
      name: 'Teacher',
      role: 'teacher',
    });
    authMocks.extractRefreshToken.mockReturnValue('refresh-token');

    const request = new NextRequest('http://localhost/api/auth/me');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      success: true,
      user: {
        id: 1,
        email: 'teacher@example.com',
        name: 'Teacher',
        role: 'teacher',
      },
    });
  });
});
