import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');
    const limitRaw = searchParams.get('limit');
    const parsedLimit = limitRaw ? Number(limitRaw) : Number.NaN;
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(Math.floor(parsedLimit), 1), 200)
      : null;
    
    if (teacherEmail && teacherEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // First, find the teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email },
      include: {
        students: {
          ...(limit ? { take: limit } : {}),
          orderBy: {
            assignedAt: 'desc',
          },
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
    }, {
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
      },
    });

  } catch (error) {
    console.error('Error fetching teacher students:', error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Internal server error'
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
