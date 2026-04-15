import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/ping', () => {
  it('returns a healthy JSON response', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload).toEqual({ message: 'Hello from Next.js API!' });
  });
});
