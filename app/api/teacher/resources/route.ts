import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// GET: List all resources for a teacher
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');
    const program = searchParams.get('program');
    const type = searchParams.get('type');

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
      teacherId: teacher.id
    };

    if (program) filters.program = program;
    if (type) filters.type = type;

    // Get resources
    const resources = await prisma.resource.findMany({
      where: filters,
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
      teacherEmail,
      isPublic = false,
      assignmentIds = [],
      studentIds = []
    } = data;

    if (!title || !type || !program || !subject || !grade || !teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate resource type and URL
    if (type === 'link' && !linkUrl) {
      return NextResponse.json(
        { success: false, error: 'Link URL is required for link type resources' },
        { status: 400 }
      );
    }

    if (['document', 'video', 'image'].includes(type) && !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'File URL is required for file type resources' },
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
        program,
        subject,
        grade,
        teacherId: teacher.id,
        isPublic
      }
    });

    // Link to assignments if provided
    if (assignmentIds.length > 0) {
      await prisma.assignmentResource.createMany({
        data: assignmentIds.map((assignmentId: number) => ({
          assignmentId,
          resourceId: resource.id,
          isRequired: false
        }))
      });
    }

    // Assign to specific students if provided
    if (studentIds.length > 0) {
      await prisma.studentResource.createMany({
        data: studentIds.map((studentId: number) => ({
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

// PUT: Update resource
export async function PUT(request: NextRequest) {
  try {
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
      teacherEmail,
      isPublic,
      assignmentIds = [],
      studentIds = []
    } = data;

    if (!id || !teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Resource ID and teacher email are required' },
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

    // Check if resource belongs to teacher
    const existingResource = await prisma.resource.findFirst({
      where: {
        id: parseInt(id),
        teacherId: teacher.id
      }
    });

    if (!existingResource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found or access denied' },
        { status: 404 }
      );
    }

    // Update resource
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (fileName !== undefined) updateData.fileName = fileName;
    if (fileSize !== undefined) updateData.fileSize = fileSize ? parseInt(fileSize) : null;
    if (program !== undefined) updateData.program = program;
    if (subject !== undefined) updateData.subject = subject;
    if (grade !== undefined) updateData.grade = grade;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedResource = await prisma.resource.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // Update assignment links if provided
    if (assignmentIds.length >= 0) {
      // Remove existing assignment links
      await prisma.assignmentResource.deleteMany({
        where: { resourceId: parseInt(id) }
      });

      // Add new assignment links
      if (assignmentIds.length > 0) {
        await prisma.assignmentResource.createMany({
          data: assignmentIds.map((assignmentId: number) => ({
            assignmentId,
            resourceId: parseInt(id),
            isRequired: false
          }))
        });
      }
    }

    // Update student assignments if provided
    if (studentIds.length >= 0) {
      // Remove existing student assignments
      await prisma.studentResource.deleteMany({
        where: { resourceId: parseInt(id) }
      });

      // Add new student assignments
      if (studentIds.length > 0) {
        await prisma.studentResource.createMany({
          data: studentIds.map((studentId: number) => ({
            studentId,
            resourceId: parseInt(id)
          }))
        });
      }
    }

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

// DELETE: Delete resource
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const teacherEmail = searchParams.get('teacherEmail');

    if (!id || !teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Resource ID and teacher email are required' },
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