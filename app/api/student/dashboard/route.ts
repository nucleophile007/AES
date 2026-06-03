import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
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

const isMcqSubmissionContent = (content: string | null) => {
  if (!content) return false;
  try {
    const parsed = JSON.parse(content) as { submissionType?: string };
    return parsed.submissionType === 'mcq_test_attempt';
  } catch {
    return false;
  }
};

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'student')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');

    if (studentEmail && studentEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Find the student with their enrollments, submissions, and teacher relationships
    const student = await prisma.student.findUnique({
      where: { email: user.email },
      include: {
        enrollments: true,
        submissions: {
          include: {
            assignment: true
          },
          orderBy: {
            submittedAt: 'desc'
          }
        },
        teacherLinks: {
          include: {
            teacher: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get assignments for this student's teachers.
    // Prefer explicit targeting when available, but fall back to legacy teacher-level assignments.
    const teacherIds = student.teacherLinks.map(tl => tl.teacherId);
    const assignmentInclude = {
      resources: {
        include: {
          resource: true,
        },
      },
    } as const;

    let assignments: Array<any> = [];
    try {
      assignments = await prisma.assignment.findMany({
        where: {
          isActive: true,
          teacherId: { in: teacherIds },
          OR: [
            {
              assignmentTargets: {
                some: { studentId: student.id },
              },
            },
            { targetStudentId: student.id },
          ],
        },
        include: assignmentInclude,
        orderBy: {
          dueDate: 'asc'
        }
      });
    } catch (targetingError) {
      console.warn('Targeted assignment query failed, using legacy fallback:', targetingError);
      assignments = await prisma.assignment.findMany({
        where: {
          isActive: true,
          teacherId: { in: teacherIds },
        },
        include: assignmentInclude,
        orderBy: {
          dueDate: 'asc'
        }
      });
    }

    // Transform assignments to include submission status
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = student.submissions.find(s => s.assignmentId === assignment.id);
      const resources = assignment.resources.map((assignmentResource: any) => {
        const resource = assignmentResource.resource;
        const isRequired = assignmentResource.isRequired;
        const parsedTemplate = resource.type === 'mcq_template'
          ? decodeMcqTemplateDescription(resource.description)
          : { summary: resource.description || '', config: null as unknown };
        const safeMcqConfig = resource.type === 'mcq_template'
          ? sanitizeMcqConfigForStudent(parsedTemplate.config)
          : null;
        return {
          id: resource.id,
          title: resource.title,
          description: resource.type === 'mcq_template' ? parsedTemplate.summary : resource.description,
          type: resource.type,
          isRequired,
          fileUrl: resource.fileUrl,
          linkUrl: resource.linkUrl,
          fileName: resource.fileName,
          fileSize: resource.fileSize,
          subject: resource.subject,
          program: resource.program,
          grade: resource.grade,
          mcqSummary: parsedTemplate.summary,
          mcqConfig: safeMcqConfig,
        };
      });

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        subject: assignment.subject,
        program: assignment.program,
        dueDate: assignment.dueDate.toISOString().split('T')[0],
        dueDateIso: assignment.dueDate.toISOString(),
        dueDateTimezone: assignment.dueDateTimezone || null,
        totalPoints: assignment.totalPoints,
        allowLateSubmission: assignment.allowLateSubmission,
        status: submission ? 
          (submission.grade !== null ? 'graded' : 'submitted') :
          (new Date(assignment.dueDate) < new Date() ? 'overdue' : 'pending'),
        submissionId: submission?.id || null,
        resources,
      };
    });

    // Transform submissions for display
    const submissionsWithDetails = student.submissions.map(submission => {
      const isMcq = isMcqSubmissionContent(submission.content);
      return {
      id: submission.id,
      assignmentId: submission.assignmentId,
      assignmentTitle: submission.assignment.title,
      assignmentSubject: submission.assignment.subject,
      content: submission.content,
      fileUrl: submission.fileUrl,
      submittedAt: submission.submittedAt.toISOString(),
      grade: submission.grade,
        totalPoints: isMcq ? 100 : submission.assignment.totalPoints,
      feedback: submission.feedback,
      status: submission.status
      };
    });

    // Calculate student statistics
    const totalSubmissions = submissionsWithDetails.length;
    const gradedSubmissions = submissionsWithDetails.filter(s => s.grade !== null);
    const averageGrade = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum, s) => sum + (s.grade! / s.totalPoints * 100), 0) / gradedSubmissions.length
      : 0;

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.grade,
        schoolName: student.schoolName,
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        program: student.program,
        enrollments: student.enrollments,
        teachers: student.teacherLinks.map(tl => ({
          id: tl.teacher.id,
          name: tl.teacher.name,
          email: tl.teacher.email,
          program: tl.program
        })),
        stats: {
          totalSubmissions,
          gradedSubmissions: gradedSubmissions.length,
          averageGrade: Math.round(averageGrade),
          pendingAssignments: assignmentsWithStatus.filter(a => a.status === 'pending').length
        }
      },
      assignments: assignmentsWithStatus,
      submissions: submissionsWithDetails
    });

  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Internal server error'
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
