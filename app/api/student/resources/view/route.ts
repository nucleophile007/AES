import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma';

const prisma = new PrismaClient();

// POST: Mark a resource as viewed by a student
export async function POST(request: NextRequest) {
  try {
    const { studentEmail, resourceId } = await request.json();

    if (!studentEmail || !resourceId) {
      return NextResponse.json(
        { success: false, error: 'Student email and resource ID are required' },
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

    // Check if the student has access to this resource
    const studentResource = await prisma.studentResource.findFirst({
      where: {
        studentId: student.id,
        resourceId: parseInt(resourceId)
      }
    });

    if (studentResource) {
      // Update the viewedAt timestamp for student-specific resource
      await prisma.studentResource.update({
        where: { id: studentResource.id },
        data: { viewedAt: new Date() }
      });
    } else {
      // For general assignment resources, we could track viewing in a separate table
      // For now, we'll just return success since the resource exists
      const resource = await prisma.resource.findUnique({
        where: { id: parseInt(resourceId) }
      });

      if (!resource) {
        return NextResponse.json(
          { success: false, error: 'Resource not found' },
          { status: 404 }
        );
      }

      // Could implement a ResourceView table here for tracking general resource views
      // For now, we'll just acknowledge the view
    }

    return NextResponse.json({
      success: true,
      message: 'Resource marked as viewed'
    });

  } catch (error) {
    console.error('Error marking resource as viewed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark resource as viewed' },
      { status: 500 }
    );
  }
}