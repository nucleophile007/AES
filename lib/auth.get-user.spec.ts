import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const jwtMocks = vi.hoisted(() => ({
  sign: vi.fn(),
  verify: vi.fn(),
}));

const prismaMocks = vi.hoisted(() => ({
  prisma: {
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    $transaction: vi.fn(),
    securityLog: {
      findFirst: vi.fn(),
    },
    student: {
      findUnique: vi.fn(),
    },
    teacher: {
      findUnique: vi.fn(),
    },
    parentAccount: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: jwtMocks.sign,
    verify: jwtMocks.verify,
  },
}));

vi.mock('./prisma', () => ({
  prisma: prismaMocks.prisma,
}));

let getUserFromRequest: typeof import('./auth').getUserFromRequest;

describe('getUserFromRequest', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.ACCESS_TOKEN_MAX_AGE_SECONDS = process.env.ACCESS_TOKEN_MAX_AGE_SECONDS || '900';
    process.env.ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
    process.env.REFRESH_TOKEN_TTL_DAYS = process.env.REFRESH_TOKEN_TTL_DAYS || '30';

    ({ getUserFromRequest } = await import('./auth'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.prisma.securityLog.findFirst.mockResolvedValue(null);
  });

  it('returns payload from a valid access token', async () => {
    jwtMocks.verify.mockReturnValue({
      id: 42,
      email: 'teacher@example.com',
      name: 'Teacher',
      role: 'teacher',
      tokenType: 'access',
      iat: 100,
      exp: 200,
    });

    const request = new NextRequest('http://localhost/api/teacher/students', {
      headers: {
        cookie: 'access-token=valid-token',
      },
    });

    const user = await getUserFromRequest(request);
    expect(user).toEqual({
      id: 42,
      email: 'teacher@example.com',
      name: 'Teacher',
      role: 'teacher',
      tokenType: 'access',
      iat: 100,
      exp: 200,
    });
    expect(prismaMocks.prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('falls back to refresh-token identity when access token is missing', async () => {
    prismaMocks.prisma.$queryRaw.mockResolvedValue([
      {
        userId: 7,
        userRole: 'teacher',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        revokedAt: null,
      },
    ]);
    prismaMocks.prisma.teacher.findUnique.mockResolvedValue({
      id: 7,
      email: 'teacher@example.com',
      name: 'Teacher',
    });

    const request = new NextRequest('http://localhost/api/teacher/students', {
      headers: {
        cookie: 'refresh-token=valid-refresh-token',
      },
    });

    const user = await getUserFromRequest(request);
    expect(user?.id).toBe(7);
    expect(user?.email).toBe('teacher@example.com');
    expect(user?.role).toBe('teacher');
    expect(user?.tokenType).toBe('access');
  });

  it('returns null when refresh token is revoked or expired', async () => {
    prismaMocks.prisma.$queryRaw.mockResolvedValue([
      {
        userId: 7,
        userRole: 'teacher',
        expiresAt: new Date(Date.now() - 5 * 60 * 1000),
        revokedAt: null,
      },
    ]);

    const request = new NextRequest('http://localhost/api/teacher/students', {
      headers: {
        cookie: 'refresh-token=expired-refresh-token',
      },
    });

    const user = await getUserFromRequest(request);
    expect(user).toBeNull();
  });
});
