import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma/index.js';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');
    
    if (!studentEmail) {
      return NextResponse.json(
        { error: 'Student email is required' },
        { status: 400 }
      );
    }

    // Find the student with their enrollments, submissions, and teacher relationships
    const student = await prisma.student.findUnique({
      where: { email: studentEmail },
      include: {
        enrollments: true,
        submissions: {
          include: {
            assignment: true
          },
          orderBy: {
            submittedAt: 'desc'
          }
        },
        teacherLinks: {
          include: {
            teacher: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get assignments for the student's programs
    const studentPrograms = student.teacherLinks.map(tl => tl.program);
    const assignments = await prisma.assignment.findMany({
      where: {
        program: {
          in: studentPrograms
        },
        isActive: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    // Transform assignments to include submission status
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = student.submissions.find(s => s.assignmentId === assignment.id);
      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        program: assignment.program,
        dueDate: assignment.dueDate.toISOString().split('T')[0],
        totalPoints: assignment.totalPoints,
        status: submission ? 
          (submission.grade !== null ? 'graded' : 'submitted') :
          (new Date(assignment.dueDate) < new Date() ? 'overdue' : 'pending'),
        submissionId: submission?.id || null
      };
    });

    // Transform submissions for display
    const submissionsWithDetails = student.submissions.map(submission => ({
      id: submission.id,
      assignmentId: submission.assignmentId,
      assignmentTitle: submission.assignment.title,
      assignmentSubject: submission.assignment.subject,
      content: submission.content,
      fileUrl: submission.fileUrl,
      submittedAt: submission.submittedAt.toISOString().split('T')[0],
      grade: submission.grade,
      totalPoints: submission.assignment.totalPoints,
      feedback: submission.feedback,
      status: submission.status
    }));

    // Calculate student statistics
    const totalSubmissions = submissionsWithDetails.length;
    const gradedSubmissions = submissionsWithDetails.filter(s => s.grade !== null);
    const averageGrade = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum, s) => sum + (s.grade! / s.totalPoints * 100), 0) / gradedSubmissions.length
      : 0;

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.grade,
        schoolName: student.schoolName,
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        program: student.program,
        enrollments: student.enrollments,
        teachers: student.teacherLinks.map(tl => ({
          id: tl.teacher.id,
          name: tl.teacher.name,
          email: tl.teacher.email,
          program: tl.program
        })),
        stats: {
          totalSubmissions,
          gradedSubmissions: gradedSubmissions.length,
          averageGrade: Math.round(averageGrade),
          pendingAssignments: assignmentsWithStatus.filter(a => a.status === 'pending').length
        }
      },
      assignments: assignmentsWithStatus,
      submissions: submissionsWithDetails
    });

  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
