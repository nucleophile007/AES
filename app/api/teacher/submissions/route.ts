import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// GET: View submissions for teacher's assignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');
    const assignmentId = searchParams.get('assignmentId');
    const status = searchParams.get('status'); // submitted, graded, pending
    const studentId = searchParams.get('studentId');

    if (!teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Teacher email is required' },
        { status: 400 }
      );
    }

    // Find teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email: teacherEmail }
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Build filters for assignments owned by this teacher
    const assignmentFilters: any = {
      teacherId: teacher.id,
      isActive: true
    };

    if (assignmentId) {
      assignmentFilters.id = parseInt(assignmentId);
    }

    // Get teacher's assignments
    const assignments = await prisma.assignment.findMany({
      where: assignmentFilters,
      select: { id: true }
    });

    const assignmentIds = assignments.map(a => a.id);

    if (assignmentIds.length === 0) {
      return NextResponse.json({
        success: true,
        submissions: []
      });
    }

    // Build submission filters
    const submissionFilters: any = {
      assignmentId: { in: assignmentIds }
    };

    if (status) {
      if (status === 'pending') {
        submissionFilters.grade = null;
      } else if (status === 'graded') {
        submissionFilters.grade = { not: null };
      } else {
        submissionFilters.status = status;
      }
    }

    if (studentId) {
      submissionFilters.studentId = parseInt(studentId);
    }

    // Get submissions with full details
    const submissions = await prisma.submission.findMany({
      where: submissionFilters,
      include: {
        student: {
          select: { id: true, name: true, email: true, grade: true }
        },
        assignment: {
          select: { 
            id: true, 
            title: true, 
            description: true, 
            dueDate: true, 
            totalPoints: true,
            program: true,
            subject: true
          }
        }
      },
      orderBy: [
        { submittedAt: 'desc' },
        { assignment: { dueDate: 'desc' } }
      ]
    });

    return NextResponse.json({
      success: true,
      submissions
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// PUT: Grade submission
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      submissionId,
      grade,
      feedback,
      teacherEmail
    } = data;

    if (!submissionId || !teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Submission ID and teacher email are required' },
        { status: 400 }
      );
    }

    if (grade !== null && (grade < 0 || grade > 100)) {
      return NextResponse.json(
        { success: false, error: 'Grade must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Find teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email: teacherEmail }
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Find submission and verify teacher owns the assignment
    const submission = await prisma.submission.findFirst({
      where: {
        id: parseInt(submissionId),
        assignment: {
          teacherId: teacher.id
        }
      },
      include: {
        assignment: {
          select: { id: true, title: true, totalPoints: true }
        },
        student: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found or access denied' },
        { status: 404 }
      );
    }

    // Validate grade against assignment total points
    if (grade !== null && grade > submission.assignment.totalPoints) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Grade cannot exceed assignment total points (${submission.assignment.totalPoints})` 
        },
        { status: 400 }
      );
    }

    // Update submission with grade and feedback
    const updatedSubmission = await prisma.submission.update({
      where: { id: parseInt(submissionId) },
      data: {
        grade: grade !== null ? parseInt(grade) : null,
        feedback: feedback || null,
        status: grade !== null ? 'graded' : 'submitted'
      },
      include: {
        assignment: {
          select: { id: true, title: true, totalPoints: true }
        },
        student: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      message: 'Submission graded successfully'
    });

  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to grade submission' },
      { status: 500 }
    );
  }
}

// POST: Bulk grade multiple submissions
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      submissions, // Array of {submissionId, grade, feedback}
      teacherEmail
    } = data;

    if (!submissions || !Array.isArray(submissions) || !teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Submissions array and teacher email are required' },
        { status: 400 }
      );
    }

    // Find teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email: teacherEmail }
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    const results = [];
    const errors = [];

    // Process each submission
    for (const submissionData of submissions) {
      try {
        const { submissionId, grade, feedback } = submissionData;

        // Verify teacher owns the assignment for this submission
        const submission = await prisma.submission.findFirst({
          where: {
            id: parseInt(submissionId),
            assignment: {
              teacherId: teacher.id
            }
          },
          include: {
            assignment: { select: { totalPoints: true } }
          }
        });

        if (!submission) {
          errors.push({ submissionId, error: 'Submission not found or access denied' });
          continue;
        }

        // Validate grade
        if (grade !== null && (grade < 0 || grade > submission.assignment.totalPoints)) {
          errors.push({ 
            submissionId, 
            error: `Grade must be between 0 and ${submission.assignment.totalPoints}` 
          });
          continue;
        }

        // Update submission
        const updated = await prisma.submission.update({
          where: { id: parseInt(submissionId) },
          data: {
            grade: grade !== null ? parseInt(grade) : null,
            feedback: feedback || null,
            status: grade !== null ? 'graded' : 'submitted'
          }
        });

        results.push({ submissionId, success: true });

      } catch (error) {
        errors.push({ submissionId: submissionData.submissionId, error: 'Processing failed' });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      message: `Processed ${results.length} submissions successfully, ${errors.length} errors`
    });

  } catch (error) {
    console.error('Error bulk grading submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk grading' },
      { status: 500 }
    );
  }
}