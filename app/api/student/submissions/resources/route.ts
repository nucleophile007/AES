import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma';

const prisma = new PrismaClient();

// POST: Student creates a submission to teachers
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      studentEmail,
      title,
      description,
      content,
      fileUrl,
      fileName,
      fileSize,
      teacherIds
    } = data;

    if (!studentEmail || !title || !teacherIds || teacherIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student email, title, and at least one teacher are required' },
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

    // Verify teacher IDs exist and student is mapped to them
    const teacherLinks = await prisma.teacherStudent.findMany({
      where: {
        studentId: student.id,
        teacherId: { in: teacherIds }
      },
      include: {
        teacher: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (teacherLinks.length !== teacherIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some selected teachers are not mapped to this student' },
        { status: 400 }
      );
    }

    // Create student submission
    const submission = await prisma.studentSubmission.create({
      data: {
        studentId: student.id,
        title,
        description,
        content,
        fileUrl,
        fileName,
        fileSize: fileSize ? parseInt(fileSize) : null,
        teacherIds
      },
      include: {
        student: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      submission,
      teachers: teacherLinks.map(link => link.teacher),
      message: 'Submission sent successfully'
    });

  } catch (error) {
    console.error('Error creating student submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

// GET: Get student's submissions
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

    // Get student's submissions
    const submissions = await prisma.studentSubmission.findMany({
      where: { studentId: student.id },
      include: {
        teacherRemarks: {
          include: {
            teacher: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Get teacher names for the submitted teacher IDs
    const allTeacherIds = [...new Set(submissions.flatMap(s => s.teacherIds))];
    const teachers = await prisma.teacher.findMany({
      where: { id: { in: allTeacherIds } },
      select: { id: true, name: true, email: true }
    });

    const teacherMap = new Map(teachers.map(t => [t.id, t]));

    // Add teacher information to submissions
    const submissionsWithTeachers = submissions.map(submission => ({
      ...submission,
      teachers: submission.teacherIds.map(id => teacherMap.get(id)).filter(Boolean)
    }));

    return NextResponse.json({
      success: true,
      submissions: submissionsWithTeachers
    });

  } catch (error) {
    console.error('Error fetching student submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}