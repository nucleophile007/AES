import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma/index.js';

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
      // For demo purposes, we're using simple password checking
      // In production, you should hash passwords and compare hashes
      if (password === 'student123') {
        const response = NextResponse.json({
          success: true,
          user: {
            id: student.id,
            name: student.name,
            email: student.email,
            type: 'student',
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
        });

        // Set a simple session cookie (in production, use proper JWT or session management)
        response.cookies.set('auth-token', `student-${student.id}`, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        });

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
      // For demo purposes, we're using simple password checking
      if (password === 'teacher123') {
        const response = NextResponse.json({
          success: true,
          user: {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            type: 'teacher',
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
        });

        // Set a simple session cookie
        response.cookies.set('auth-token', `teacher-${teacher.id}`, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
      }
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
