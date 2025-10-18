import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma';

const prisma = new PrismaClient();

// GET: Teacher views student submissions sent to them
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');

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

    // Get submissions sent to this teacher
    const submissions = await prisma.studentSubmission.findMany({
      where: {
        teacherIds: {
          has: teacher.id
        }
      },
      include: {
        student: {
          select: { id: true, name: true, email: true, grade: true, program: true }
        },
        teacherRemarks: {
          where: { teacherId: teacher.id },
          include: {
            teacher: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Get all teacher names for each submission
    const allTeacherIds = [...new Set(submissions.flatMap(s => s.teacherIds))];
    const allTeachers = await prisma.teacher.findMany({
      where: { id: { in: allTeacherIds } },
      select: { id: true, name: true, email: true }
    });

    const teacherMap = new Map(allTeachers.map(t => [t.id, t]));

    // Add all teachers information to submissions
    const submissionsWithTeachers = submissions.map(submission => ({
      ...submission,
      allTeachers: submission.teacherIds.map(id => teacherMap.get(id)).filter(Boolean),
      hasMyRemark: submission.teacherRemarks.length > 0
    }));

    return NextResponse.json({
      success: true,
      submissions: submissionsWithTeachers
    });

  } catch (error) {
    console.error('Error fetching student submissions for teacher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST: Teacher adds a remark to a student submission
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      teacherEmail,
      submissionId,
      remark
    } = data;

    if (!teacherEmail || !submissionId || !remark) {
      return NextResponse.json(
        { success: false, error: 'Teacher email, submission ID, and remark are required' },
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

    // Verify submission exists and teacher is in the recipient list
    const submission = await prisma.studentSubmission.findUnique({
      where: { id: parseInt(submissionId) }
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (!submission.teacherIds.includes(teacher.id)) {
      return NextResponse.json(
        { success: false, error: 'You are not a recipient of this submission' },
        { status: 403 }
      );
    }

    // Create or update the teacher's remark
    const teacherRemark = await prisma.studentSubmissionRemark.upsert({
      where: {
        studentSubmissionId_teacherId: {
          studentSubmissionId: parseInt(submissionId),
          teacherId: teacher.id
        }
      },
      update: {
        remark,
        updatedAt: new Date()
      },
      create: {
        studentSubmissionId: parseInt(submissionId),
        teacherId: teacher.id,
        remark
      },
      include: {
        teacher: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      remark: teacherRemark,
      message: 'Remark saved successfully'
    });

  } catch (error) {
    console.error('Error adding teacher remark:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add remark' },
      { status: 500 }
    );
  }
}