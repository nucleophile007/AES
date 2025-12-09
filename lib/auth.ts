import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'teacher' | 'student' | 'parent';
}

export interface JWTPayload extends AuthUser {
  iat: number;
  exp: number;
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Extract user from request (from cookies or headers)
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  try {
    // Try to get token from cookie first
    const tokenFromCookie = request.cookies.get('auth-token')?.value;
    if (tokenFromCookie) {
      return verifyToken(tokenFromCookie);
    }

    // Fallback to Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return verifyToken(token);
    }

    return null;
  } catch (error) {
    console.error('Error extracting user from request:', error);
    return null;
  }
}

// Check if user has required role
export function hasRole(user: JWTPayload | null, requiredRole: 'teacher' | 'student' | 'parent'): boolean {
  return user?.role === requiredRole;
}

// Create response with auth cookie
export function setAuthCookie(response: Response, token: string): Response {
  // Set HTTP-only cookie for security
  response.headers.set(
    'Set-Cookie',
    `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  );
  return response;
}

// Clear auth cookie
export function clearAuthCookie(response: Response): Response {
  response.headers.set(
    'Set-Cookie',
    'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
  );
  return response;
}