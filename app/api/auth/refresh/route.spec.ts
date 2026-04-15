import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('POST /api/auth/refresh', () => {
  it('returns 401 when refresh token is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const payload = await response.json();
    expect(payload).toEqual({ success: false, error: 'Not authenticated' });
  });
});
