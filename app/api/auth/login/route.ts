import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma/index.js';
import bcrypt from 'bcryptjs';
import { generateToken, setAuthCookie, type AuthUser } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

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
          token,
          redirectTo: '/student-dashboard'
        };

        const response = NextResponse.json(responseData);
        setAuthCookie(response, token);
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
          token,
          redirectTo: '/teacher-dashboard'
        };

        const response = NextResponse.json(responseData);
        setAuthCookie(response, token);
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
        Student: true
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
        
        const responseData = {
          success: true,
          user: {
            id: parent.id,
            name: parent.name,
            email: parent.email,
            phone: parent.phone,
            type: 'parent',
            role: 'parent',
            students: parent.Student.map((student: any) => ({
              id: student.id,
              name: student.name,
              email: student.email,
              grade: student.grade,
              program: student.program
            }))
          },
          token,
          redirectTo: '/parent-dashboard'
        };

        const response = NextResponse.json(responseData);
        setAuthCookie(response, token);
        return response;
      }
    }

    // Parent DEMO login (no DB) - fallback for testing
    if (email === 'parent.demo@aes.com' && password === 'parent123') {
      const authUser: AuthUser = {
        id: 900000,
        email,
        name: 'Parent Demo',
        role: 'parent'
      };

      const token = generateToken(authUser);
      const responseData = {
        success: true,
        user: {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          type: 'parent',
          role: 'parent'
        },
        token,
        redirectTo: '/parent-dashboard'
      };
      const response = NextResponse.json(responseData);
      setAuthCookie(response, token);
      return response;
    }

    // If we get here, credentials are invalid
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
  } finally {
    await prisma.$disconnect();
  }
}
