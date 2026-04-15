import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '../../../../../lib/auth';

// POST: Mark a resource as viewed by a student
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'student')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const { studentEmail, resourceId } = await request.json();

    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    if (studentEmail && String(studentEmail).toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { email: user.email }
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