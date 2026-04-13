import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      timezone, // Client's timezone for proper UTC storage
      totalPoints = 100,
      allowLateSubmission = false,
      teacherEmail,
      studentId, // Add studentId parameter
      studentIds = [],
      resourceIds = []
    } = data;
    
    // Default to America/Los_Angeles if no timezone provided (for backward compatibility)
    const dueDateTimezone = timezone || 'America/Los_Angeles';

    if (!title || !description || !program || !subject || !dueDate || !teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const parsedDueDate = new Date(dueDate);
    if (Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid due date' },
        { status: 400 }
      );
    }

    const parsedTotalPoints = Number.parseInt(String(totalPoints), 10);
    const normalizedTotalPoints = Number.isNaN(parsedTotalPoints) ? 100 : parsedTotalPoints;
    const normalizedInstructions = instructions?.trim() || null;

    const normalizedStudentIds = Array.isArray(studentIds)
      ? Array.from(new Set(studentIds.map((id: any) => Number(id)).filter((id: number) => !Number.isNaN(id))))
      : [];
    const singleStudentId = studentId ? parseInt(studentId) : null;
    const targetStudentIds = normalizedStudentIds.length > 0
      ? normalizedStudentIds
      : singleStudentId
        ? [singleStudentId]
        : [];

    if (targetStudentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student selection is required' },
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

    const students = await prisma.student.findMany({
      where: { id: { in: targetStudentIds } }
    });

    if (students.length !== targetStudentIds.length) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Safety net for accidental double-submit:
    // if an identical assignment was created in the last 2 minutes for the same
    // teacher + target students, return that instead of creating duplicates.
    const dedupeWindowStart = new Date(Date.now() - 2 * 60 * 1000);
    const recentlyCreatedMatches = await prisma.assignment.findMany({
      where: {
        teacherId: teacher.id,
        targetStudentId: { in: targetStudentIds },
        title,
        description,
        instructions: normalizedInstructions,
        program,
        subject,
        dueDate: parsedDueDate,
        totalPoints: normalizedTotalPoints,
        allowLateSubmission,
        isActive: true,
        createdAt: { gte: dedupeWindowStart },
      }
    });

    if (recentlyCreatedMatches.length > 0) {
      const matchedStudentIds = new Set(
        recentlyCreatedMatches.map((assignment) => assignment.targetStudentId).filter((id): id is number => id !== null)
      );
      const allTargetsAlreadyCreated = targetStudentIds.every((id) => matchedStudentIds.has(id));

      if (allTargetsAlreadyCreated) {
        return NextResponse.json({
          success: true,
          assignments: recentlyCreatedMatches,
          deduplicated: true,
          message: 'Assignment already created. Duplicate submit ignored.'
        });
      }
    }

    // We intentionally do NOT enforce that all selected students share the same
    // program as the assignment here, to allow assigning to full groups even
    // if they mix programs. Validation of visibility to students happens
    // separately when fetching assignments for a given student.

    const createdAssignments = [];
    for (const targetId of targetStudentIds) {
      const assignment = await prisma.assignment.create({
        data: {
          title,
          description,
          instructions: normalizedInstructions,
          program,
          subject,
          dueDate: parsedDueDate,
          dueDateTimezone, // Store the timezone used when creating the assignment
          totalPoints: normalizedTotalPoints,
          allowLateSubmission,
          teacherId: teacher.id,
          targetStudentId: targetId
        }
      });

      if (resourceIds.length > 0) {
        await prisma.assignmentResource.createMany({
          data: resourceIds.map((resourceId: number) => ({
            assignmentId: assignment.id,
            resourceId,
            isRequired: true
          }))
        });
      }

      createdAssignments.push(assignment);
    }

    return NextResponse.json({
      success: true,
      assignments: createdAssignments,
      message: targetStudentIds.length > 1 ? 'Assignments created successfully' : 'Assignment created successfully'
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
