import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';

// GET: List all resources for a teacher
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
    const type = searchParams.get('type');
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
      teacherId: teacher.id
    };

    if (program) filters.program = program;
    if (type) filters.type = type;

    // Get resources
    const resources = await prisma.resource.findMany({
      where: filters,
      ...(limit ? { take: limit } : {}),
      include: {
        assignmentLinks: {
          include: {
            assignment: {
              select: { id: true, title: true }
            }
          }
        },
        studentAssignments: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      resources
    }, {
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
      },
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST: Create new resource
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
      type,
      fileUrl,
      linkUrl,
      fileName,
      fileSize,
      program,
      subject,
      grade,
      teacherEmail: teacherEmailParam,
      isPublic = false,
      assignmentIds,
      studentIds
    } = data;

    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (teacherEmailParam && String(teacherEmailParam).toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    // Validate resource type and URL
    if (type === 'link' && !linkUrl) {
      return NextResponse.json(
        { success: false, error: 'Link URL is required for link type resources' },
        { status: 400 }
      );
    }

    if (type !== 'link' && !fileUrl && !linkUrl) {
      return NextResponse.json(
        { success: false, error: 'File URL or link URL is required for this resource type' },
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

    const assignmentIdsList = Array.isArray(assignmentIds)
      ? Array.from(new Set(assignmentIds.map((id: any) => Number(id)).filter((id: number) => !Number.isNaN(id))))
      : [];
    let studentIdsList = Array.isArray(studentIds)
      ? Array.from(new Set(studentIds.map((id: any) => Number(id)).filter((id: number) => !Number.isNaN(id))))
      : [];
    let normalizedProgram = String(program || '').trim();
    let normalizedSubject = String(subject || '').trim();
    let normalizedGrade = String(grade || '').trim();

    if (assignmentIdsList.length > 0) {
      const ownedAssignments = await prisma.assignment.findMany({
        where: {
          id: { in: assignmentIdsList },
          teacherId: teacher.id
        },
        select: {
          id: true,
          program: true,
          subject: true,
          targetStudentId: true,
          assignmentTargets: {
            select: { studentId: true }
          }
        }
      });

      if (ownedAssignments.length !== assignmentIdsList.length) {
        return NextResponse.json(
          { success: false, error: 'One or more assignments are not owned by this teacher' },
          { status: 403 }
        );
      }

      if (!normalizedProgram) {
        normalizedProgram = ownedAssignments[0]?.program || '';
      }
      if (!normalizedSubject) {
        normalizedSubject = ownedAssignments[0]?.subject || '';
      }

      if (studentIdsList.length === 0) {
        studentIdsList = Array.from(
          new Set(
            ownedAssignments.flatMap((assignment) => [
              ...assignment.assignmentTargets.map((target) => target.studentId),
              ...(assignment.targetStudentId ? [assignment.targetStudentId] : [])
            ])
          )
        );
      }
    }

    if (studentIdsList.length > 0) {
      const linkedStudents = await prisma.teacherStudent.findMany({
        where: {
          teacherId: teacher.id,
          studentId: { in: studentIdsList.map((id: any) => Number(id)) }
        },
        select: { studentId: true }
      });

      if (linkedStudents.length !== studentIdsList.length) {
        return NextResponse.json(
          { success: false, error: 'Some students are not assigned to this teacher' },
          { status: 403 }
        );
      }
    }

    if (!isPublic && assignmentIdsList.length === 0 && studentIdsList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Select at least one student or assignment for this resource' },
        { status: 400 }
      );
    }

    if (!normalizedGrade && studentIdsList.length > 0) {
      const gradeRows = await prisma.student.findMany({
        where: { id: { in: studentIdsList } },
        select: { grade: true }
      });
      const uniqueGrades = Array.from(new Set(gradeRows.map((row) => row.grade).filter(Boolean)));
      if (uniqueGrades.length === 1) {
        normalizedGrade = uniqueGrades[0];
      } else if (uniqueGrades.length > 1) {
        normalizedGrade = 'Mixed';
      }
    }

    const finalProgram = normalizedProgram || 'General';
    const finalSubject = normalizedSubject || 'General';
    const finalGrade = normalizedGrade || 'General';

    // Create resource
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        type,
        fileUrl,
        linkUrl,
        fileName,
        fileSize: fileSize ? parseInt(fileSize) : null,
        program: finalProgram,
        subject: finalSubject,
        grade: finalGrade,
        teacherId: teacher.id,
        isPublic
      }
    });

    // Link to assignments if provided
    if (assignmentIdsList.length > 0) {
      await prisma.assignmentResource.createMany({
        data: assignmentIdsList.map((assignmentId: number) => ({
          assignmentId,
          resourceId: resource.id,
          isRequired: false
        }))
      });
    }

    // Assign to specific students if provided
    if (studentIdsList.length > 0) {
      await prisma.studentResource.createMany({
        data: studentIdsList.map((studentId: number) => ({
          studentId,
          resourceId: resource.id
        }))
      });
    }

    // Get the created resource with relations
    const createdResource = await prisma.resource.findUnique({
      where: { id: resource.id },
      include: {
        assignmentLinks: {
          include: {
            assignment: {
              select: { id: true, title: true }
            }
          }
        },
        studentAssignments: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      resource: createdResource,
      message: 'Resource created successfully'
    });

  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

// PATCH: Update resource
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
      type,
      fileUrl,
      linkUrl,
      fileName,
      fileSize,
      program,
      subject,
      grade,
      teacherEmail: teacherEmailParam,
      isPublic,
      assignmentIds,
      studentIds
    } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Resource ID is required' },
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

    // Check if resource belongs to teacher
    const existingResource = await prisma.resource.findFirst({
      where: {
        id: parseInt(id),
        teacherId: teacher.id
      },
      include: {
        assignmentLinks: {
          select: { assignmentId: true }
        },
        studentAssignments: {
          select: { studentId: true }
        }
      }
    });

    if (!existingResource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found or access denied' },
        { status: 404 }
      );
    }

    const assignmentIdsProvided = Array.isArray(assignmentIds);
    const studentIdsProvided = Array.isArray(studentIds);
    const assignmentIdsList = assignmentIdsProvided
      ? Array.from(
          new Set(
            assignmentIds
              .map((item: any) => Number(item))
              .filter((item: number) => !Number.isNaN(item))
          )
        )
      : null;
    let studentIdsList = studentIdsProvided
      ? Array.from(
          new Set(
            studentIds
              .map((item: any) => Number(item))
              .filter((item: number) => !Number.isNaN(item))
          )
        )
      : null;
    const normalizedProgram = program !== undefined ? String(program).trim() : undefined;
    const normalizedSubject = subject !== undefined ? String(subject).trim() : undefined;
    const normalizedGrade = grade !== undefined ? String(grade).trim() : undefined;
    const nextType = type !== undefined ? type : existingResource.type;
    const nextLinkUrl = linkUrl !== undefined ? (linkUrl ? String(linkUrl).trim() : null) : existingResource.linkUrl;
    const nextFileUrl = fileUrl !== undefined ? (fileUrl ? String(fileUrl).trim() : null) : existingResource.fileUrl;
    const nextIsPublic = isPublic !== undefined ? Boolean(isPublic) : existingResource.isPublic;

    if (nextType === 'link' && !nextLinkUrl) {
      return NextResponse.json(
        { success: false, error: 'Link URL is required for link type resources' },
        { status: 400 }
      );
    }

    if (nextType !== 'link' && !nextFileUrl && !nextLinkUrl) {
      return NextResponse.json(
        { success: false, error: 'File URL or link URL is required for this resource type' },
        { status: 400 }
      );
    }

    let ownedAssignments: Array<{
      id: number;
      program: string;
      subject: string;
      targetStudentId: number | null;
      assignmentTargets: Array<{ studentId: number }>;
    }> = [];

    if (assignmentIdsList && assignmentIdsList.length > 0) {
      const assignmentRows = await prisma.assignment.findMany({
        where: {
          id: { in: assignmentIdsList },
          teacherId: teacher.id
        },
        select: {
          id: true,
          program: true,
          subject: true,
          targetStudentId: true,
          assignmentTargets: {
            select: { studentId: true }
          }
        }
      });

      if (assignmentRows.length !== assignmentIdsList.length) {
        return NextResponse.json(
          { success: false, error: 'One or more assignments are not owned by this teacher' },
          { status: 403 }
        );
      }
      ownedAssignments = assignmentRows;

      const derivedAssignmentStudentIds = Array.from(
        new Set(
          assignmentRows.flatMap((assignment) => [
            ...assignment.assignmentTargets.map((target) => target.studentId),
            ...(assignment.targetStudentId ? [assignment.targetStudentId] : [])
          ])
        )
      );
      if (!studentIdsProvided) {
        studentIdsList = derivedAssignmentStudentIds;
      }
    }

    if (studentIdsList && studentIdsList.length > 0) {
      const linkedStudents = await prisma.teacherStudent.findMany({
        where: {
          teacherId: teacher.id,
          studentId: { in: studentIdsList.map((id: any) => Number(id)) }
        },
        select: { studentId: true }
      });

      if (linkedStudents.length !== studentIdsList.length) {
        return NextResponse.json(
          { success: false, error: 'Some students are not assigned to this teacher' },
          { status: 403 }
        );
      }
    }

    const effectiveAssignmentCount = assignmentIdsList !== null
      ? assignmentIdsList.length
      : existingResource.assignmentLinks.length;
    const effectiveStudentCount = studentIdsList !== null
      ? studentIdsList.length
      : existingResource.studentAssignments.length;

    if (!nextIsPublic && effectiveAssignmentCount === 0 && effectiveStudentCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Select at least one student or assignment for this resource' },
        { status: 400 }
      );
    }

    let finalGradeValue = normalizedGrade;
    if (grade !== undefined && !finalGradeValue && studentIdsList && studentIdsList.length > 0) {
      const gradeRows = await prisma.student.findMany({
        where: { id: { in: studentIdsList } },
        select: { grade: true }
      });
      const uniqueGrades = Array.from(new Set(gradeRows.map((row) => row.grade).filter(Boolean)));
      if (uniqueGrades.length === 1) {
        finalGradeValue = uniqueGrades[0];
      } else if (uniqueGrades.length > 1) {
        finalGradeValue = 'Mixed';
      }
    }

    const assignmentDerivedProgram = ownedAssignments.length > 0 ? ownedAssignments[0].program : null;
    const assignmentDerivedSubject = ownedAssignments.length > 0 ? ownedAssignments[0].subject : null;

    // Update resource
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = nextType;
    if (fileUrl !== undefined) updateData.fileUrl = nextFileUrl;
    if (linkUrl !== undefined) updateData.linkUrl = nextLinkUrl;
    if (fileName !== undefined) updateData.fileName = fileName;
    if (fileSize !== undefined) updateData.fileSize = fileSize ? parseInt(fileSize) : null;
    if (program !== undefined) {
      updateData.program = normalizedProgram || assignmentDerivedProgram || existingResource.program || 'General';
    }
    if (subject !== undefined) {
      updateData.subject = normalizedSubject || assignmentDerivedSubject || existingResource.subject || 'General';
    }
    if (grade !== undefined) {
      updateData.grade = finalGradeValue || existingResource.grade || 'General';
    }
    if (isPublic !== undefined) updateData.isPublic = nextIsPublic;

    await prisma.$transaction(async (tx) => {
      await tx.resource.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      // Update assignment links if provided
      if (assignmentIdsList !== null) {
        await tx.assignmentResource.deleteMany({
          where: { resourceId: parseInt(id) }
        });

        if (assignmentIdsList.length > 0) {
          await tx.assignmentResource.createMany({
            data: assignmentIdsList.map((assignmentId: number) => ({
              assignmentId,
              resourceId: parseInt(id),
              isRequired: false
            }))
          });
        }
      }

      // Update student assignments if provided or auto-derived from assignment links
      if (studentIdsList !== null) {
        await tx.studentResource.deleteMany({
          where: { resourceId: parseInt(id) }
        });

        if (studentIdsList.length > 0) {
          await tx.studentResource.createMany({
            data: studentIdsList.map((studentId: number) => ({
              studentId,
              resourceId: parseInt(id)
            }))
          });
        }
      }
    });

    // Get updated resource with relations
    const finalResource = await prisma.resource.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignmentLinks: {
          include: {
            assignment: {
              select: { id: true, title: true }
            }
          }
        },
        studentAssignments: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      resource: finalResource,
      message: 'Resource updated successfully'
    });

  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// Keep PUT for backwards compatibility while clients migrate to PATCH.
export async function PUT(request: NextRequest) {
  return PATCH(request);
}

// DELETE: Delete resource
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
        { success: false, error: 'Resource ID is required' },
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

    // Check if resource belongs to teacher
    const resource = await prisma.resource.findFirst({
      where: {
        id: parseInt(id),
        teacherId: teacher.id
      }
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found or access denied' },
        { status: 404 }
      );
    }

    // Delete resource (this will cascade delete relations)
    await prisma.resource.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
