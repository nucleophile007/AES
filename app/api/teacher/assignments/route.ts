import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// GET: List all assignments for a teacher
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');
    const program = searchParams.get('program');
    const grade = searchParams.get('grade');

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

    // Build filters
    const filters: any = {
      teacherId: teacher.id,
      isActive: true
    };

    if (program) filters.program = program;
    if (grade) filters.grade = grade;

    // Get assignments with related data
    const assignments = await prisma.assignment.findMany({
      where: filters,
      include: {
        targetStudent: { // Include assigned student info
          select: { id: true, name: true, email: true }
        },
        submissions: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        resources: {
          include: {
            resource: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      assignments
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST: Create new assignment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      title,
      description,
      instructions,
      program,
      subject,
      dueDate,
      totalPoints = 100,
      allowLateSubmission = false,
      teacherEmail,
      studentId, // Add studentId parameter
      resourceIds = []
    } = data;

    if (!title || !description || !program || !subject || !dueDate || !teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate studentId if provided
    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { id: parseInt(studentId) }
      });

      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        );
      }

      // Verify student is in the selected program
      if (student.program !== program) {
        return NextResponse.json(
          { success: false, error: 'Student is not enrolled in the selected program' },
          { status: 400 }
        );
      }
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

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        instructions,
        program,
        subject,
        dueDate: new Date(dueDate),
        totalPoints: parseInt(totalPoints),
        allowLateSubmission,
        teacherId: teacher.id,
        targetStudentId: studentId ? parseInt(studentId) : null // Add student assignment
      }
    });

    // Link resources if provided
    if (resourceIds.length > 0) {
      await prisma.assignmentResource.createMany({
        data: resourceIds.map((resourceId: number) => ({
          assignmentId: assignment.id,
          resourceId,
          isRequired: true
        }))
      });
    }

    // Get the created assignment with relations
    const createdAssignment = await prisma.assignment.findUnique({
      where: { id: assignment.id },
      include: {
        resources: {
          include: {
            resource: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      assignment: createdAssignment,
      message: 'Assignment created successfully'
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

// PUT: Update assignment
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      id,
      title,
      description,
      instructions,
      program,
      subject,
      grade,
      dueDate,
      totalPoints,
      allowLateSubmission,
      isActive,
      teacherEmail,
      resourceIds = []
    } = data;

    if (!id || !teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID and teacher email are required' },
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

    // Check if assignment belongs to teacher
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id: parseInt(id),
        teacherId: teacher.id
      }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found or access denied' },
        { status: 404 }
      );
    }

    // Update assignment
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (program !== undefined) updateData.program = program;
    if (subject !== undefined) updateData.subject = subject;
    if (grade !== undefined) updateData.grade = grade;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (totalPoints !== undefined) updateData.totalPoints = parseInt(totalPoints);
    if (allowLateSubmission !== undefined) updateData.allowLateSubmission = allowLateSubmission;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedAssignment = await prisma.assignment.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // Update resource links if provided
    if (resourceIds.length >= 0) {
      // Remove existing resource links
      await prisma.assignmentResource.deleteMany({
        where: { assignmentId: parseInt(id) }
      });

      // Add new resource links
      if (resourceIds.length > 0) {
        await prisma.assignmentResource.createMany({
          data: resourceIds.map((resourceId: number) => ({
            assignmentId: parseInt(id),
            resourceId,
            isRequired: true
          }))
        });
      }
    }

    // Get updated assignment with relations
    const finalAssignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id) },
      include: {
        resources: {
          include: {
            resource: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      assignment: finalAssignment,
      message: 'Assignment updated successfully'
    });

  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

// DELETE: Delete assignment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const teacherEmail = searchParams.get('teacherEmail');

    if (!id || !teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID and teacher email are required' },
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

    // Check if assignment belongs to teacher
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: parseInt(id),
        teacherId: teacher.id
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found or access denied' },
        { status: 404 }
      );
    }

    // Soft delete (mark as inactive) instead of hard delete to preserve submissions
    await prisma.assignment.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
