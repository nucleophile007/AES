import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  generateToken,
  issueRefreshToken,
  setAuthCookie,
  setRefreshTokenCookie,
  type AuthUser,
} from '../../../../lib/auth';
import { getClientIP, isSecureConnection, timingSafeDelay } from '@/lib/security-utils';
import { getRateLimitKey, loginRateLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && !isSecureConnection(request)) {
      return NextResponse.json(
        { success: false, error: 'Secure connection required. Please use HTTPS.' },
        { status: 403 }
      );
    }

    const clientIP = getClientIP(request);
    const rateLimitKey = getRateLimitKey('login', clientIP);
    const { success, resetAt } = await loginRateLimiter.limit(rateLimitKey);

    if (!success) {
      await timingSafeDelay();
      return NextResponse.json(
        {
          success: false,
          error: 'Too many login attempts. Please try again later.',
          resetAt,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? '').trim();
    const password = String(body?.password ?? '');

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user is a student
    const student = await prisma.student.findUnique({
      where: { email },
      include: {
        teacherLinks: {
          include: {
            teacher: true
          }
        },
        enrollments: true
      }
    });

    if (student) {
      // Check if password exists
      if (!student.password) {
        return NextResponse.json(
          { success: false, error: 'Account not activated. Please check your email for activation link.' },
          { status: 401 }
        );
      }

      // Verify password with bcrypt
      const isValidPassword = await bcrypt.compare(password, student.password);

      if (isValidPassword) {
        const authUser: AuthUser = {
          id: student.id,
          email: student.email,
          name: student.name,
          role: 'student'
        };

        const token = generateToken(authUser);
        const refreshToken = await issueRefreshToken(authUser);

        const responseData = {
          success: true,
          user: {
            id: student.id,
            name: student.name,
            email: student.email,
            type: 'student',
            role: 'student',
            grade: student.grade,
            schoolName: student.schoolName,
            program: student.program,
            parentName: student.parentName,
            parentEmail: student.parentEmail,
            parentPhone: student.parentPhone,
            teachers: student.teacherLinks.map((link: any) => ({
              id: link.teacher.id,
              name: link.teacher.name,
              email: link.teacher.email,
              program: link.program
            })),
            enrollments: student.enrollments
          },
          redirectTo: '/student-dashboard'
        };

        const response = NextResponse.json(responseData);
        setAuthCookie(response, token);
        setRefreshTokenCookie(response, refreshToken);
        return response;
      }
    }

    // Check if user is a teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });

    if (teacher) {
      // Check if password exists
      if (!teacher.password) {
        return NextResponse.json(
          { success: false, error: 'Account not activated. Please check your email for activation link.' },
          { status: 401 }
        );
      }

      // Verify password with bcrypt
      const isValidPassword = await bcrypt.compare(password, teacher.password);

      if (isValidPassword) {
        const authUser: AuthUser = {
          id: teacher.id,
          email: teacher.email,
          name: teacher.name,
          role: 'teacher'
        };

        const token = generateToken(authUser);
        const refreshToken = await issueRefreshToken(authUser);

        const responseData = {
          success: true,
          user: {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            type: 'teacher',
            role: 'teacher',
            programs: teacher.programs,
            students: teacher.students.map((link: any) => ({
              id: link.student.id,
              name: link.student.name,
              email: link.student.email,
              grade: link.student.grade,
              schoolName: link.student.schoolName,
              program: link.program
            }))
          },
          redirectTo: '/teacher-dashboard'
        };

        const response = NextResponse.json(responseData);
        setAuthCookie(response, token);
        setRefreshTokenCookie(response, refreshToken);
        return response;
      }
    }

    // Check if user is a parent (database-based)
    const parent = await prisma.parentAccount.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
      include: {
        students: true
      }
    });

    if (parent) {
      // Check if account is activated
      if (!parent.isActivated) {
        return NextResponse.json(
          { success: false, error: 'Please activate your account first. Check your email for the activation link.' },
          { status: 401 }
        );
      }

      // Check if password exists
      if (!parent.password) {
        return NextResponse.json(
          { success: false, error: 'Please set your password using the activation link sent to your email.' },
          { status: 401 }
        );
      }

      // Verify password with bcrypt
      const isValidPassword = await bcrypt.compare(password, parent.password);

      if (isValidPassword) {
        const authUser: AuthUser = {
          id: parent.id,
          email: parent.email,
          name: parent.name,
          role: 'parent'
        };

        const token = generateToken(authUser);
        const refreshToken = await issueRefreshToken(authUser);

        const responseData = {
          success: true,
          user: {
            id: parent.id,
            name: parent.name,
            email: parent.email,
            phone: parent.phone,
            type: 'parent',
            role: 'parent',
            students: parent.students.map((student: any) => ({
              id: student.id,
              name: student.name,
              email: student.email,
              grade: student.grade,
              program: student.program
            }))
          },
          redirectTo: '/parent-dashboard'
        };

        const response = NextResponse.json(responseData);
        setAuthCookie(response, token);
        setRefreshTokenCookie(response, refreshToken);
        return response;
      }
    }

    // If we get here, credentials are invalid
    await timingSafeDelay();
    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
