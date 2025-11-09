import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { deleteR2File, extractFileKeyFromUrl } from '../../../../lib/r2';

const prisma = new PrismaClient();

// GET: Fetch submissions for a student or specific submission
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');
    const assignmentId = searchParams.get('assignmentId');
    const submissionId = searchParams.get('submissionId');

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

    // If requesting specific submission
    if (submissionId) {
      const submission = await prisma.submission.findFirst({
        where: {
          id: parseInt(submissionId),
          studentId: student.id
        },
        include: {
          assignment: {
            include: {
              resources: {
                include: {
                  resource: true
                }
              }
            }
          }
        }
      });

      if (!submission) {
        return NextResponse.json(
          { success: false, error: 'Submission not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        submission
      });
    }

    // Build filters
    const filters: any = {
      studentId: student.id
    };

    if (assignmentId) {
      filters.assignmentId = parseInt(assignmentId);
    }

    // Get submissions with assignment details
    const submissions = await prisma.submission.findMany({
      where: filters,
      include: {
        assignment: {
          include: {
            resources: {
              include: {
                resource: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
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

// POST: Create new submission
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      studentEmail,
      assignmentId,
      content,
      fileUrl,
      fileName,
      fileSize
    } = data;

    if (!studentEmail || !assignmentId) {
      return NextResponse.json(
        { success: false, error: 'Student email and assignment ID are required' },
        { status: 400 }
      );
    }

    if (!content && !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Either content or file submission is required' },
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

    // Find assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId) }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        studentId_assignmentId: {
          studentId: student.id,
          assignmentId: parseInt(assignmentId)
        }
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'Assignment already submitted. Use resubmit to update.' },
        { status: 400 }
      );
    }

    // Check deadline
    const now = new Date();
    const deadline = new Date(assignment.dueDate);
    
    if (now > deadline && !assignment.allowLateSubmission) {
      return NextResponse.json(
        { success: false, error: 'Assignment deadline has passed' },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        studentId: student.id,
        assignmentId: parseInt(assignmentId),
        content: content || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize ? parseInt(fileSize) : null,
        status: now > deadline ? 'late' : 'submitted',
        submissionNumber: 1
      },
      include: {
        assignment: {
          select: { id: true, title: true, dueDate: true, totalPoints: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      submission,
      message: 'Submission created successfully'
    });

  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

// PUT: Update/resubmit submission
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      studentEmail,
      assignmentId,
      content,
      fileUrl,
      fileName,
      fileSize
    } = data;

    if (!studentEmail || !assignmentId) {
      return NextResponse.json(
        { success: false, error: 'Student email and assignment ID are required' },
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

    // Find existing submission
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        studentId_assignmentId: {
          studentId: student.id,
          assignmentId: parseInt(assignmentId)
        }
      },
      include: {
        assignment: true
      }
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'No existing submission found. Create a new submission first.' },
        { status: 404 }
      );
    }

    // Check if resubmission is allowed
    const now = new Date();
    const deadline = new Date(existingSubmission.assignment.dueDate);
    
    if (now > deadline && !existingSubmission.assignment.allowLateSubmission) {
      return NextResponse.json(
        { success: false, error: 'Cannot resubmit after deadline' },
        { status: 400 }
      );
    }

    // Check if already graded
    if (existingSubmission.grade !== null) {
      return NextResponse.json(
        { success: false, error: 'Cannot resubmit graded assignment' },
        { status: 400 }
      );
    }

    // If replacing file, delete old file from R2
    if (fileUrl && existingSubmission.fileUrl && fileUrl !== existingSubmission.fileUrl) {
      const oldFileKey = extractFileKeyFromUrl(existingSubmission.fileUrl);
      if (oldFileKey) {
        await deleteR2File(oldFileKey);
      }
    }

    // Update submission
    const updateData: any = {
      submissionNumber: existingSubmission.submissionNumber + 1,
      status: now > deadline ? 'late_resubmitted' : 'resubmitted'
    };

    if (content !== undefined) updateData.content = content;
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
    if (fileName !== undefined) updateData.fileName = fileName;
    if (fileSize !== undefined) updateData.fileSize = fileSize ? parseInt(fileSize) : null;

    const updatedSubmission = await prisma.submission.update({
      where: {
        studentId_assignmentId: {
          studentId: student.id,
          assignmentId: parseInt(assignmentId)
        }
      },
      data: updateData,
      include: {
        assignment: {
          select: { id: true, title: true, dueDate: true, totalPoints: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      message: 'Submission updated successfully'
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}
