import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_COOKIE = 'access-token';
const LEGACY_ACCESS_TOKEN_COOKIE = 'auth-token';
const REFRESH_TOKEN_COOKIE = 'refresh-token';
const ACCESS_TOKEN_MAX_AGE_SECONDS = getPositiveIntegerEnv('ACCESS_TOKEN_MAX_AGE_SECONDS');
const ACCESS_TOKEN_EXPIRES_IN = getRequiredEnv('ACCESS_TOKEN_TTL') as jwt.SignOptions['expiresIn'];
const REFRESH_TOKEN_TTL_DAYS = getPositiveIntegerEnv('REFRESH_TOKEN_TTL_DAYS');

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function getPositiveIntegerEnv(name: string): number {
  const rawValue = getRequiredEnv(name);
  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }

  return Math.floor(parsed);
}

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required for authentication. Set it in the environment.');
  }

  return JWT_SECRET;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'teacher' | 'student' | 'parent';
}

export interface JWTPayload extends AuthUser {
  tokenType: 'access';
  iat: number;
  exp: number;
}

function isAuthRole(value: string): value is AuthUser['role'] {
  return value === 'teacher' || value === 'student' || value === 'parent';
}

function getRefreshTokenExpiryDate(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

// Generate access JWT token
export function generateAccessToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenType: 'access',
    },
    getJwtSecret(),
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
}

// Backward-compatible alias for existing imports.
export const generateToken = generateAccessToken;

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (!decoded || typeof decoded === 'string') {
      return null;
    }

    const payload = decoded as Partial<JWTPayload>;
    if (typeof payload.role !== 'string' || !isAuthRole(payload.role)) {
      return null;
    }

    if (payload.tokenType && payload.tokenType !== 'access') {
      return null;
    }

    if (
      typeof payload.id !== 'number' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string'
    ) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      tokenType: 'access',
      iat: Number(payload.iat || 0),
      exp: Number(payload.exp || 0),
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

function getTokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Extract raw auth token from request (cookie first, header fallback)
export function extractAuthToken(request: NextRequest): string | null {
  const tokenFromCookie =
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
    request.cookies.get(LEGACY_ACCESS_TOKEN_COOKIE)?.value;

  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export function extractRefreshToken(request: NextRequest): string | null {
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

async function getAuthUserByRoleAndId(
  role: AuthUser['role'],
  userId: number
): Promise<AuthUser | null> {
  if (role === 'student') {
    const student = await prisma.student.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    return student
      ? { id: student.id, email: student.email, name: student.name, role: 'student' }
      : null;
  }

  if (role === 'teacher') {
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    return teacher
      ? { id: teacher.id, email: teacher.email, name: teacher.name, role: 'teacher' }
      : null;
  }

  const parent = await prisma.parentAccount.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  return parent
    ? { id: parent.id, email: parent.email, name: parent.name, role: 'parent' }
    : null;
}

export async function issueRefreshToken(user: AuthUser): Promise<string> {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = getTokenHash(refreshToken);

  await prisma.$executeRaw`
    INSERT INTO "RefreshToken" ("tokenHash", "userId", "userRole", "expiresAt", "createdAt", "updatedAt")
    VALUES (${tokenHash}, ${user.id}, ${user.role}, ${getRefreshTokenExpiryDate()}, NOW(), NOW())
  `;

  return refreshToken;
}

export async function rotateRefreshToken(
  refreshToken: string
): Promise<{ user: AuthUser; accessToken: string; refreshToken: string } | null> {
  const tokenHash = getTokenHash(refreshToken);
  const now = new Date();

  const existingTokenRows = await prisma.$queryRaw<Array<{
    id: number;
    userId: number;
    userRole: string;
    expiresAt: Date;
    revokedAt: Date | null;
  }>>`
    SELECT "id", "userId", "userRole", "expiresAt", "revokedAt"
    FROM "RefreshToken"
    WHERE "tokenHash" = ${tokenHash}
    LIMIT 1
  `;

  const existingToken = existingTokenRows[0];

  if (!existingToken || existingToken.revokedAt || existingToken.expiresAt <= now) {
    return null;
  }

  if (!isAuthRole(existingToken.userRole)) {
    return null;
  }

  const user = await getAuthUserByRoleAndId(existingToken.userRole, existingToken.userId);
  if (!user) {
    await prisma.$executeRaw`
      UPDATE "RefreshToken"
      SET "revokedAt" = ${now}, "updatedAt" = NOW()
      WHERE "id" = ${existingToken.id}
    `;

    return null;
  }

  const nextRefreshToken = crypto.randomBytes(64).toString('hex');
  const nextTokenHash = getTokenHash(nextRefreshToken);

  await prisma.$transaction([
    prisma.$executeRaw`
      UPDATE "RefreshToken"
      SET "revokedAt" = ${now}, "updatedAt" = NOW()
      WHERE "id" = ${existingToken.id}
    `,
    prisma.$executeRaw`
      INSERT INTO "RefreshToken" ("tokenHash", "userId", "userRole", "expiresAt", "createdAt", "updatedAt")
      VALUES (${nextTokenHash}, ${user.id}, ${user.role}, ${getRefreshTokenExpiryDate()}, NOW(), NOW())
    `,
  ]);

  return {
    user,
    accessToken: generateAccessToken(user),
    refreshToken: nextRefreshToken,
  };
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const tokenHash = getTokenHash(refreshToken);

  await prisma.$executeRaw`
    UPDATE "RefreshToken"
    SET "revokedAt" = ${new Date()}, "updatedAt" = NOW()
    WHERE "tokenHash" = ${tokenHash} AND "revokedAt" IS NULL
  `;
}

async function isTokenRevoked(token: string, payload: JWTPayload): Promise<boolean> {
  try {
    const tokenHash = getTokenHash(token);
    const revoked = await prisma.securityLog.findFirst({
      where: {
        event: 'TOKEN_REVOKED',
        userId: payload.id,
        userRole: payload.role,
        success: true,
        metadata: {
          equals: {
            tokenHash,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(revoked);
  } catch (error) {
    console.error('Token revocation lookup failed:', error);
    return false;
  }
}

export async function revokeToken(
  token: string,
  context?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  const payload = verifyToken(token);
  if (!payload) {
    return;
  }

  try {
    const tokenHash = getTokenHash(token);
    await prisma.securityLog.create({
      data: {
        event: 'TOKEN_REVOKED',
        userId: payload.id,
        userRole: payload.role,
        success: true,
        ipAddress: context?.ipAddress || 'unknown',
        userAgent: context?.userAgent || 'unknown',
        metadata: {
          tokenHash,
        },
      },
    });
  } catch (error) {
    console.error('Failed to revoke token:', error);
  }
}

// Extract user from request (from cookies or headers)
export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = extractAuthToken(request);
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    if (await isTokenRevoked(token, payload)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error extracting user from request:', error);
    return null;
  }
}

// Check if user has required role
export function hasRole(user: JWTPayload | null, requiredRole: 'teacher' | 'student' | 'parent'): boolean {
  return user?.role === requiredRole;
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export function setRefreshTokenCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    path: '/',
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  response.cookies.set(LEGACY_ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export function clearRefreshTokenCookie(response: NextResponse): NextResponse {
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}