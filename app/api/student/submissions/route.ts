import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma/index.js';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, assignmentId, content, fileUrl } = body;

    if (!studentId || !assignmentId) {
      return NextResponse.json(
        { error: 'Student ID and Assignment ID are required' },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId) }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        studentId_assignmentId: {
          studentId: parseInt(studentId),
          assignmentId: parseInt(assignmentId)
        }
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Assignment already submitted' },
        { status: 400 }
      );
    }

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        studentId: parseInt(studentId),
        assignmentId: parseInt(assignmentId),
        content: content || null,
        fileUrl: fileUrl || null,
        status: 'submitted'
      },
      include: {
        assignment: true,
        student: true
      }
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        assignmentId: submission.assignmentId,
        assignmentTitle: submission.assignment.title,
        content: submission.content,
        fileUrl: submission.fileUrl,
        submittedAt: submission.submittedAt.toISOString(),
        status: submission.status,
        studentName: submission.student.name
      }
    });

  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, content, fileUrl } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: parseInt(submissionId) },
      include: {
        assignment: true,
        student: true
      }
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if assignment deadline has passed
    const deadline = new Date(existingSubmission.assignment.dueDate);
    const now = new Date();
    
    if (now > deadline) {
      return NextResponse.json(
        { error: 'Cannot resubmit after deadline' },
        { status: 400 }
      );
    }

    // Check if submission has already been graded
    if (existingSubmission.grade !== null) {
      return NextResponse.json(
        { error: 'Cannot resubmit a graded assignment' },
        { status: 400 }
      );
    }

    // Update the submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: parseInt(submissionId) },
      data: {
        content: content || existingSubmission.content,
        fileUrl: fileUrl || existingSubmission.fileUrl,
        submittedAt: new Date(), // Update submission timestamp
        status: 'submitted'
      },
      include: {
        assignment: true,
        student: true
      }
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: updatedSubmission.id,
        assignmentId: updatedSubmission.assignmentId,
        assignmentTitle: updatedSubmission.assignment.title,
        content: updatedSubmission.content,
        fileUrl: updatedSubmission.fileUrl,
        submittedAt: updatedSubmission.submittedAt.toISOString(),
        status: updatedSubmission.status,
        studentName: updatedSubmission.student.name,
        grade: updatedSubmission.grade,
        totalPoints: updatedSubmission.assignment.totalPoints,
        feedback: updatedSubmission.feedback
      }
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Get all submissions for the student
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: parseInt(studentId)
      },
      include: {
        assignment: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    const submissionsWithDetails = submissions.map(submission => ({
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

    return NextResponse.json({
      success: true,
      submissions: submissionsWithDetails
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
