import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';

const TEST_CONFIG_START = '[MCQ_TEST_CONFIG_V1]';
const TEST_CONFIG_END = '[/MCQ_TEST_CONFIG_V1]';
const LEGACY_TEMPLATE_START = '[MCQ_TEMPLATE_CONFIG_V1]';
const LEGACY_TEMPLATE_END = '[/MCQ_TEMPLATE_CONFIG_V1]';

const decodeMcqTemplateDescription = (description: string | null) => {
  const value = description || '';
  const candidates: Array<[string, string]> = [
    [TEST_CONFIG_START, TEST_CONFIG_END],
    [LEGACY_TEMPLATE_START, LEGACY_TEMPLATE_END],
  ];

  for (const [startMarker, endMarker] of candidates) {
    const start = value.indexOf(startMarker);
    const end = value.indexOf(endMarker);
    if (start === -1 || end === -1 || end <= start) continue;
    const summary = value.slice(0, start).trim();
    const encoded = value.slice(start + startMarker.length, end).trim();
    try {
      const json = Buffer.from(encoded, 'base64').toString('utf8');
      return {
        summary,
        config: JSON.parse(json),
      };
    } catch {
      return { summary, config: null as unknown };
    }
  }

  return {
    summary: value.trim(),
    config: null as unknown,
  };
};

const sanitizeMcqConfigForStudent = (config: unknown) => {
  if (!config || typeof config !== 'object') return null;
  const raw = config as Record<string, unknown>;
  const rawQuestions = Array.isArray(raw.questions) ? raw.questions : [];
  const sanitizedQuestions = rawQuestions.map((question) => {
    const current = (question || {}) as Record<string, unknown>;
    const { correctAnswers: _correctAnswers, ...safeQuestion } = current;
    return safeQuestion;
  });

  return {
    ...raw,
    questions: sanitizedQuestions,
  };
};

const toStudentSafeResource = (resource: any) => {
  if (resource.type !== 'mcq_template') return resource;
  const parsed = decodeMcqTemplateDescription(resource.description || null);
  return {
    ...resource,
    description: parsed.summary,
    mcqSummary: parsed.summary,
    mcqConfig: sanitizeMcqConfigForStudent(parsed.config),
  };
};

// GET: Get resources available to a student
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'student')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');
    const assignmentId = searchParams.get('assignmentId');
    const includeAssignmentResources = searchParams.get('includeAssignmentResources') === 'true';

    if (studentEmail && studentEmail.toLowerCase() !== user.email.toLowerCase()) {
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
          ...toStudentSafeResource(ar.resource),
          isStudentSpecific: false,
          isRequired: ar.isRequired,
          assignmentTitle: assignment.title
        })),
        ...studentResources.map(sr => {
          const isPersonal = !sr.resource.isPublic;
          return {
            ...toStudentSafeResource(sr.resource),
            isStudentSpecific: isPersonal,
            isRequired: false,
            assignmentTitle: assignment.title,
            assignedAt: sr.assignedAt,
            viewedAt: sr.viewedAt
          };
        })
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

      // Get assignments for this student only when explicitly requested.
      const studentAssignments = includeAssignmentResources
        ? await prisma.assignment.findMany({
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
        })
        : [];

      // Get student-specific resources
      const studentSpecificResources = await prisma.studentResource.findMany({
        where: { studentId: student.id },
        include: {
          resource: true
        }
      });

      // Collect all resources
      const allResources: any[] = [];
      
      // General assignment resources (optional by query param)
      if (includeAssignmentResources) {
        studentAssignments.forEach(assignment => {
          assignment.resources.forEach(ar => {
            allResources.push({
              ...toStudentSafeResource(ar.resource),
              isStudentSpecific: false,
              isRequired: ar.isRequired,
              assignmentId: assignment.id,
              assignmentTitle: assignment.title,
              assignmentSubject: assignment.subject
            });
          });
        });
      }

      // Student-specific resources
      studentSpecificResources.forEach(sr => {
        const isPersonal = !sr.resource.isPublic;
        allResources.push({
          ...toStudentSafeResource(sr.resource),
          isStudentSpecific: isPersonal,
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
