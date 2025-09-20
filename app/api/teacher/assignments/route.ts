import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma/index.js';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');
    const program = searchParams.get('program');
    
    if (!teacherEmail) {
      return NextResponse.json(
        { error: 'Teacher email is required' },
        { status: 400 }
      );
    }

    // First, find the teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email: teacherEmail }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Build where clause for assignments
    let whereClause: any = {};
    
    if (program) {
      whereClause.program = program;
    } else {
      // If no specific program, get assignments for all teacher's programs
      whereClause.program = {
        in: teacher.programs
      };
    }

    // Get assignments with submission counts
    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        submissions: {
          include: {
            student: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include submission statistics
    const assignmentsWithStats = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      program: assignment.program,
      subject: assignment.subject,
      grade: assignment.grade,
      dueDate: assignment.dueDate,
      totalPoints: assignment.totalPoints,
      isActive: assignment.isActive,
      createdAt: assignment.createdAt,
      submissionStats: {
        total: assignment.submissions.length,
        graded: assignment.submissions.filter(s => s.grade !== null).length,
        pending: assignment.submissions.filter(s => s.grade === null).length,
        submissions: assignment.submissions.map(submission => ({
          id: submission.id,
          studentName: submission.student.name,
          studentEmail: submission.student.email,
          submittedAt: submission.submittedAt,
          grade: submission.grade,
          status: submission.status,
          feedback: submission.feedback
        }))
      }
    }));

    return NextResponse.json({
      assignments: assignmentsWithStats
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
