import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// GET: Get resources available to a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');
    const assignmentId = searchParams.get('assignmentId');

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

    if (assignmentId) {
      // Get resources for a specific assignment
      const assignment = await prisma.assignment.findUnique({
        where: { id: parseInt(assignmentId) },
        include: {
          resources: {
            include: {
              resource: true
            }
          }
        }
      });

      if (!assignment) {
        return NextResponse.json(
          { success: false, error: 'Assignment not found' },
          { status: 404 }
        );
      }

      // Get student-specific resources that could be related to this assignment
      const studentResources = await prisma.studentResource.findMany({
        where: {
          studentId: student.id,
          resource: {
            OR: [
              { program: assignment.program },
              { subject: assignment.subject }
            ]
          }
        },
        include: {
          resource: true
        }
      });

      // Combine general assignment resources and potentially related student-specific resources
      const allResources = [
        ...assignment.resources.map(ar => ({
          ...ar.resource,
          isStudentSpecific: false,
          isRequired: ar.isRequired,
          assignmentTitle: assignment.title
        })),
        ...studentResources.map(sr => ({
          ...sr.resource,
          isStudentSpecific: true,
          isRequired: false,
          assignmentTitle: assignment.title,
          assignedAt: sr.assignedAt,
          viewedAt: sr.viewedAt
        }))
      ];

      return NextResponse.json({
        success: true,
        resources: allResources,
        assignment: {
          id: assignment.id,
          title: assignment.title,
          subject: assignment.subject
        }
      });
    } else {
      // Get all resources available to this student
      // First get teacher IDs for this student
      const teacherLinks = await prisma.teacherStudent.findMany({
        where: { studentId: student.id },
        select: { teacherId: true }
      });

      const teacherIds = teacherLinks.map(link => link.teacherId);

      if (teacherIds.length === 0) {
        return NextResponse.json({
          success: true,
          resources: [],
          totalCount: 0
        });
      }

      // Get assignments for this student
      const studentAssignments = await prisma.assignment.findMany({
        where: {
          teacherId: { in: teacherIds },
          isActive: true
        },
        include: {
          resources: {
            include: {
              resource: true
            }
          }
        }
      });

      // Get student-specific resources
      const studentSpecificResources = await prisma.studentResource.findMany({
        where: { studentId: student.id },
        include: {
          resource: true
        }
      });

      // Collect all resources
      const allResources: any[] = [];
      
      // General assignment resources
      studentAssignments.forEach(assignment => {
        assignment.resources.forEach(ar => {
          allResources.push({
            ...ar.resource,
            isStudentSpecific: false,
            isRequired: ar.isRequired,
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            assignmentSubject: assignment.subject
          });
        });
      });

      // Student-specific resources
      studentSpecificResources.forEach(sr => {
        allResources.push({
          ...sr.resource,
          isStudentSpecific: true,
          isRequired: false,
          assignedAt: sr.assignedAt,
          viewedAt: sr.viewedAt
        });
      });

      // Remove duplicates and sort
      const uniqueResources = allResources.filter((resource, index, self) =>
        index === self.findIndex(r => r.id === resource.id)
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        success: true,
        resources: uniqueResources,
        totalCount: uniqueResources.length
      });
    }

  } catch (error) {
    console.error('Error fetching student resources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}