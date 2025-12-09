import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { 
  validatePasswordStrength, 
  isCommonPassword,
  timingSafeDelay,
  getClientIP,
  isSecureConnection 
} from "@/lib/security-utils";
import { 
  activationRateLimiter, 
  verificationRateLimiter,
  getRateLimitKey 
} from "@/lib/rate-limiter";

// GET /api/auth/activate
// Verify token and return user info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const clientIP = getClientIP(request);

    // Rate limiting for verification
    const rateLimitKey = getRateLimitKey('verification', clientIP);
    const { success, remaining, resetAt } = await verificationRateLimiter.limit(rateLimitKey);

    if (!success) {
      await timingSafeDelay();
      return NextResponse.json({ 
        error: 'Too many verification attempts. Please try again later.',
        resetAt 
      }, { status: 429 });
    }

    if (!token) {
      await timingSafeDelay();
      return NextResponse.json({ error: 'Invalid activation link' }, { status: 400 });
    }

    // Find activation request by token
    const activationRequest = await prisma.activationRequest.findUnique({
      where: { token }
    });

    // Uniform error message for all failure cases (prevent timing attacks)
    if (!activationRequest || activationRequest.isUsed || new Date() > activationRequest.expiresAt) {
      await timingSafeDelay();
      return NextResponse.json({ error: 'Invalid or expired activation link' }, { status: 400 });
    }

    // Get user data based on role
    let userData;
    if (activationRequest.role === 'TEACHER') {
      userData = await prisma.teacher.findUnique({
        where: { id: activationRequest.userId }
      });
    } else if (activationRequest.role === 'STUDENT') {
      userData = await prisma.student.findUnique({
        where: { id: activationRequest.userId }
      });
    } else if (activationRequest.role === 'ADMIN') {
      userData = await prisma.admin.findUnique({
        where: { id: activationRequest.userId }
      });
    } else if (activationRequest.role === 'PARENT') {
      userData = await prisma.parentAccount.findUnique({
        where: { id: activationRequest.userId }
      });
    } else {
      await timingSafeDelay();
      return NextResponse.json({ error: 'Invalid activation link' }, { status: 400 });
    }

    if (!userData) {
      await timingSafeDelay();
      return NextResponse.json({ error: 'Invalid activation link' }, { status: 404 });
    }

    // Return user info
    return NextResponse.json({
      user: {
        name: userData.name,
        email: userData.email,
        role: activationRequest.role,
        expiresAt: activationRequest.expiresAt
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error verifying activation token:', error);
    await timingSafeDelay();
    return NextResponse.json({ error: 'Invalid activation link' }, { status: 400 });
  }
}

// POST /api/auth/activate
// Activate account with password
export async function POST(request: NextRequest) {
  try {
    // 1. HTTPS enforcement in production
    if (process.env.NODE_ENV === 'production' && !isSecureConnection(request)) {
      return NextResponse.json({ 
        error: 'Secure connection required. Please use HTTPS.' 
      }, { status: 403 });
    }

    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 2. Rate limiting
    const rateLimitKey = getRateLimitKey('activation', clientIP);
    const { success, remaining, resetAt } = await activationRateLimiter.limit(rateLimitKey);

    if (!success) {
      return NextResponse.json({ 
        error: 'Too many activation attempts. Please try again later.',
        resetAt
      }, { status: 429 });
    }

    const { token, password } = await request.json();

    if (!token || !password) {
      await timingSafeDelay();
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // 3. Password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ 
        error: passwordValidation.error,
        strength: passwordValidation.strength 
      }, { status: 400 });
    }

    // 4. Check for common passwords
    if (isCommonPassword(password)) {
      return NextResponse.json({ 
        error: 'This password is too common. Please choose a more unique password.' 
      }, { status: 400 });
    }

    // 5. Find activation request by token
    const activationRequest = await prisma.activationRequest.findUnique({
      where: { token }
    });

    if (!activationRequest) {
      // Log failed attempt for security monitoring
      try {
        await prisma.failedActivation.create({
          data: {
            token,
            ipAddress: clientIP,
            userAgent,
            reason: 'TOKEN_NOT_FOUND'
          }
        });
      } catch (e) {
        console.error('Failed to log activation attempt:', e);
      }
      
      await timingSafeDelay();
      return NextResponse.json({ error: 'Invalid or expired activation link' }, { status: 404 });
    }

    // Check if already used
    if (activationRequest.isUsed) {
      await timingSafeDelay();
      return NextResponse.json({ error: 'This activation link has already been used' }, { status: 400 });
    }

    // Check if expired
    if (new Date() > activationRequest.expiresAt) {
      await timingSafeDelay();
      return NextResponse.json({ error: 'This activation link has expired' }, { status: 400 });
    }

    // 6. Hash the password with increased rounds (12 instead of 10)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 7. Update user data based on role
    if (activationRequest.role === 'TEACHER') {
      await prisma.teacher.update({
        where: { id: activationRequest.userId },
        data: {
          password: hashedPassword,
          isActivated: true,
          updatedAt: new Date()
        }
      });
    } else if (activationRequest.role === 'STUDENT') {
      await prisma.student.update({
        where: { id: activationRequest.userId },
        data: {
          password: hashedPassword,
          isActivated: true,
          updatedAt: new Date()
        }
      });
    } else if (activationRequest.role === 'ADMIN') {
      await prisma.admin.update({
        where: { id: activationRequest.userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      });
    } else if (activationRequest.role === 'PARENT') {
      await prisma.parentAccount.update({
        where: { id: activationRequest.userId },
        data: {
          password: hashedPassword,
          isActivated: true,
          updatedAt: new Date()
        }
      });
    } else {
      await timingSafeDelay();
      return NextResponse.json({ error: 'Invalid activation link' }, { status: 400 });
    }

    // 8. Mark activation request as used
    await prisma.activationRequest.update({
      where: { id: activationRequest.id },
      data: { 
        isUsed: true,
        updatedAt: new Date()
      }
    });

    // 9. Log successful activation
    try {
      await prisma.securityLog.create({
        data: {
          event: 'ACCOUNT_ACTIVATED',
          userId: activationRequest.userId,
          userRole: activationRequest.role,
          success: true,
          ipAddress: clientIP,
          userAgent
        }
      });
    } catch (e) {
      console.error('Failed to log security event:', e);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Account activated successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error activating account:', error);
    await timingSafeDelay();
    return NextResponse.json({ error: 'Failed to activate account. Please try again.' }, { status: 500 });
  }
}
