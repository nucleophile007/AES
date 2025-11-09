import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma/index.js';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');
    
    if (!teacherEmail) {
      return NextResponse.json(
        { error: 'Teacher email is required' },
        { status: 400 }
      );
    }

    // First, find the teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email: teacherEmail },
      include: {
        students: {
          include: {
            student: {
              include: {
                enrollments: true,
                submissions: {
                  include: {
                    assignment: true
                  },
                  orderBy: {
                    submittedAt: 'desc'
                  },
                  take: 5 // Get last 5 submissions
                }
              }
            }
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Transform the data to include program information from the relationship
    const studentsWithPrograms = teacher.students.map(teacherStudent => ({
      id: teacherStudent.student.id,
      name: teacherStudent.student.name,
      email: teacherStudent.student.email,
      grade: teacherStudent.student.grade,
      schoolName: teacherStudent.student.schoolName,
      parentName: teacherStudent.student.parentName,
      parentEmail: teacherStudent.student.parentEmail,
      parentPhone: teacherStudent.student.parentPhone,
      program: teacherStudent.program, // This comes from the TeacherStudent relationship
      mainProgram: teacherStudent.student.program, // This comes from the Student model
      enrollments: teacherStudent.student.enrollments,
      recentSubmissions: teacherStudent.student.submissions,
      assignedAt: teacherStudent.assignedAt
    }));

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        programs: teacher.programs
      },
      students: studentsWithPrograms
    });

  } catch (error) {
    console.error('Error fetching teacher students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
