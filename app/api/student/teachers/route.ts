import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// GET: Get teachers mapped to a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email is required' },
        { status: 400 }
      );
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { email: studentEmail }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get teachers mapped to this student
    const teacherLinks = await prisma.teacherStudent.findMany({
      where: { studentId: student.id },
      include: {
        teacher: {
          select: { id: true, name: true, email: true, programs: true }
        }
      }
    });

    const teachers = teacherLinks.map(link => ({
      ...link.teacher,
      program: link.program,
      assignedAt: link.assignedAt
    }));

    return NextResponse.json({
      success: true,
      teachers
    });

  } catch (error) {
    console.error('Error fetching teachers for student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}