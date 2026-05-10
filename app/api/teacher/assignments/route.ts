import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';

// GET: List all assignments for a teacher
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');
    const program = searchParams.get('program');
    const limitRaw = searchParams.get('limit');
    const parsedLimit = limitRaw ? Number(limitRaw) : Number.NaN;
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(Math.floor(parsedLimit), 1), 200)
      : null;

    if (teacherEmail && teacherEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    // Find teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email }
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

    // Get assignments with related data
    const assignments = await prisma.assignment.findMany({
      where: filters,
      ...(limit ? { take: limit } : {}),
      include: {
        targetStudent: {
          select: { id: true, name: true, email: true }
        },
        assignmentTargets: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
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
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assignments',
        ...(process.env.NODE_ENV === 'development' ? { details } : {}),
      },
      { status: 500 }
    );
  }
}

// POST: Create new assignment
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const data = await request.json();
    const {
      title,
      description,
      instructions,
      program = '',
      subject = '',
      dueDate,
      timezone, // Client's timezone for proper UTC storage
      totalPoints = 100,
      allowLateSubmission = false,
      teacherEmail: teacherEmailParam,
      studentId, // Add studentId parameter
      studentIds = [],
      resourceIds = []
    } = data;
    
    // Default to America/Los_Angeles if no timezone provided (for backward compatibility)
    const dueDateTimezone = timezone || 'America/Los_Angeles';

    if (!title || !description || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (teacherEmailParam && String(teacherEmailParam).toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const parsedDueDate = new Date(dueDate);
    if (Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid due date' },
        { status: 400 }
      );
    }

    const normalizedProgram = String(program).trim();
    const normalizedSubject = String(subject).trim();
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
      where: { email: user.email }
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

    const linkedStudents = await prisma.teacherStudent.findMany({
      where: {
        teacherId: teacher.id,
        studentId: { in: targetStudentIds }
      },
      select: { studentId: true }
    });

    if (linkedStudents.length !== targetStudentIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some students are not assigned to this teacher' },
        { status: 403 }
      );
    }

    if (Array.isArray(resourceIds) && resourceIds.length > 0) {
      const ownedResources = await prisma.resource.findMany({
        where: {
          id: { in: resourceIds.map((id: any) => Number(id)) },
          teacherId: teacher.id
        },
        select: { id: true }
      });

      if (ownedResources.length !== resourceIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more resources are not owned by this teacher' },
          { status: 403 }
        );
      }
    }

    // Safety net for accidental double-submit:
    // if an identical assignment was created in the last 2 minutes for the same
    // teacher + target students, return that instead of creating duplicates.
    const dedupeWindowStart = new Date(Date.now() - 2 * 60 * 1000);
    const recentlyCreatedMatches = await prisma.assignment.findMany({
      where: {
        teacherId: teacher.id,
        title,
        description,
        instructions: normalizedInstructions,
        dueDate: parsedDueDate,
        totalPoints: normalizedTotalPoints,
        allowLateSubmission,
        isActive: true,
        createdAt: { gte: dedupeWindowStart },
      },
      include: {
        assignmentTargets: {
          select: { studentId: true }
        }
      }
    });

    if (recentlyCreatedMatches.length > 0) {
      const targetSet = new Set(targetStudentIds);
      const matchingAssignment = recentlyCreatedMatches.find((assignment) => {
        const assignmentTargets = assignment.assignmentTargets.map((t) => t.studentId);
        if (assignmentTargets.length !== targetSet.size) return false;
        return assignmentTargets.every((id) => targetSet.has(id));
      });

      if (matchingAssignment) {
        return NextResponse.json({
          success: true,
          assignments: [matchingAssignment],
          deduplicated: true,
          message: 'Assignment already created. Duplicate submit ignored.'
        });
      }
    }

    // We intentionally derive program per target student so group assignments
    // do not depend on manual program entry.

    const defaultProgram = normalizedProgram || students[0]?.program || "General";
    const defaultSubject = normalizedSubject || "General";
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        instructions: normalizedInstructions,
        program: defaultProgram,
        subject: defaultSubject,
        dueDate: parsedDueDate,
        dueDateTimezone, // Store the timezone used when creating the assignment
        totalPoints: normalizedTotalPoints,
        allowLateSubmission,
        teacherId: teacher.id,
        targetStudentId: targetStudentIds.length === 1 ? targetStudentIds[0] : null
      }
    });

    await prisma.assignmentTarget.createMany({
      data: targetStudentIds.map((studentId) => ({
        assignmentId: assignment.id,
        studentId
      })),
      skipDuplicates: true
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

    const finalAssignment = await prisma.assignment.findUnique({
      where: { id: assignment.id },
      include: {
        targetStudent: {
          select: { id: true, name: true, email: true }
        },
        assignmentTargets: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
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
      }
    });

    return NextResponse.json({
      success: true,
      assignment: finalAssignment,
      assignments: finalAssignment ? [finalAssignment] : [assignment],
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

// PATCH: Update assignment
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const data = await request.json();
    const {
      id,
      title,
      description,
      instructions,
      program,
      subject,
      dueDate,
      timezone,
      totalPoints,
      allowLateSubmission,
      isActive,
      teacherEmail: teacherEmailParam,
      studentId,
      studentIds,
      resourceIds = []
    } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    if (teacherEmailParam && String(teacherEmailParam).toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    // Find teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email }
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

    if (Array.isArray(resourceIds) && resourceIds.length > 0) {
      const ownedResources = await prisma.resource.findMany({
        where: {
          id: { in: resourceIds.map((rid: any) => Number(rid)) },
          teacherId: teacher.id
        },
        select: { id: true }
      });

      if (ownedResources.length !== resourceIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more resources are not owned by this teacher' },
          { status: 403 }
        );
      }
    }

    const hasStudentSelection = studentId !== undefined || Array.isArray(studentIds);
    let targetStudentIds: number[] = [];
    if (hasStudentSelection) {
      const normalizedStudentIds = Array.isArray(studentIds)
        ? Array.from(
            new Set(
              studentIds
                .map((sid: any) => Number(sid))
                .filter((sid: number) => !Number.isNaN(sid))
            )
          )
        : [];
      const parsedSingleStudentId = studentId ? Number(studentId) : null;
      targetStudentIds = normalizedStudentIds.length > 0
        ? normalizedStudentIds
        : parsedSingleStudentId
          ? [parsedSingleStudentId]
          : [];

      if (targetStudentIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Student selection is required' },
          { status: 400 }
        );
      }

      const students = await prisma.student.findMany({
        where: { id: { in: targetStudentIds } },
        select: { id: true }
      });

      if (students.length !== targetStudentIds.length) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        );
      }

      const linkedStudents = await prisma.teacherStudent.findMany({
        where: {
          teacherId: teacher.id,
          studentId: { in: targetStudentIds }
        },
        select: { studentId: true }
      });

      if (linkedStudents.length !== targetStudentIds.length) {
        return NextResponse.json(
          { success: false, error: 'Some students are not assigned to this teacher' },
          { status: 403 }
        );
      }
    }

    // Update assignment
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (program !== undefined) updateData.program = program;
    if (subject !== undefined) updateData.subject = subject;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (timezone !== undefined) updateData.dueDateTimezone = timezone;
    if (totalPoints !== undefined) updateData.totalPoints = parseInt(totalPoints);
    if (allowLateSubmission !== undefined) updateData.allowLateSubmission = allowLateSubmission;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (hasStudentSelection) updateData.targetStudentId = targetStudentIds.length === 1 ? targetStudentIds[0] : null;

    await prisma.$transaction(async (tx) => {
      await tx.assignment.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      if (hasStudentSelection) {
        await tx.assignmentTarget.deleteMany({
          where: { assignmentId: parseInt(id) }
        });

        await tx.assignmentTarget.createMany({
          data: targetStudentIds.map((sid) => ({
            assignmentId: parseInt(id),
            studentId: sid
          })),
          skipDuplicates: true
        });
      }

      if (Array.isArray(resourceIds)) {
        await tx.assignmentResource.deleteMany({
          where: { assignmentId: parseInt(id) }
        });

        if (resourceIds.length > 0) {
          await tx.assignmentResource.createMany({
            data: resourceIds.map((resourceId: number) => ({
              assignmentId: parseInt(id),
              resourceId,
              isRequired: true
            }))
          });
        }
      }
    });

    // Get updated assignment with relations
    const finalAssignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id) },
      include: {
        targetStudent: {
          select: { id: true, name: true, email: true }
        },
        assignmentTargets: {
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

// Keep PUT for backward compatibility while clients migrate to PATCH.
export async function PUT(request: NextRequest) {
  return PATCH(request);
}

// DELETE: Delete assignment
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const teacherEmail = searchParams.get('teacherEmail');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    if (teacherEmail && teacherEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    // Find teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email }
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
