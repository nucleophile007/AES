import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, hasRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const parseReportPayload = (content: string | null) => {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as {
      submissionType?: string;
      testTitle?: string;
      report?: unknown;
      reportPresentation?: {
        mode?: string;
      };
      reportPdf?: {
        generatedAt?: string;
        sentAt?: string | null;
      };
    };

    if (parsed.submissionType !== "mcq_test_attempt") return null;
    if (!parsed.report || parsed.reportPresentation?.mode !== "confirmed") return null;

    return parsed;
  } catch {
    return null;
  }
};

const getParentStudentIds = async (parentEmail: string) => {
  const parentAccount = await prisma.parentAccount.findUnique({
    where: { email: parentEmail },
    select: { id: true },
  });

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { parentEmail },
        ...(parentAccount ? [{ parentAccountId: parentAccount.id }] : []),
      ],
    },
    select: { id: true },
  });

  return students.map((student) => student.id);
};

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    if (!hasRole(user, "parent")) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const studentIds = await getParentStudentIds(user.email);
    if (studentIds.length === 0) {
      return NextResponse.json({ success: true, reports: [] });
    }

    const { searchParams } = new URL(request.url);
    const submissionIdParam = searchParams.get("submissionId");

    if (submissionIdParam) {
      const submissionId = Number(submissionIdParam);
      if (!Number.isFinite(submissionId)) {
        return NextResponse.json({ success: false, error: "Valid submissionId is required" }, { status: 400 });
      }

      const submission = await prisma.submission.findFirst({
        where: {
          id: submissionId,
          studentId: { in: studentIds },
        },
        include: {
          student: true,
          assignment: {
            include: {
              resources: {
                include: {
                  resource: true,
                },
              },
            },
          },
        },
      });

      if (!submission || !parseReportPayload(submission.content)) {
        return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, submission });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        studentId: { in: studentIds },
        content: { not: null },
      },
      include: {
        student: {
          select: { id: true, name: true, email: true, grade: true },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            subject: true,
            program: true,
            dueDate: true,
            totalPoints: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const reports = submissions
      .map((submission) => {
        const parsed = parseReportPayload(submission.content);
        if (!parsed) return null;

        const scoreSummary = (parsed.report as { scoreSummary?: { finalScore?: number; maxScore?: number; percentage?: number } })?.scoreSummary || {};
        return {
          id: submission.id,
          studentId: submission.studentId,
          studentName: submission.student.name,
          studentGrade: submission.student.grade,
          assignmentTitle: submission.assignment.title,
          subject: submission.assignment.subject,
          program: submission.assignment.program,
          testTitle: parsed.testTitle || "MCQ Diagnostic",
          finalScore: scoreSummary.finalScore ?? null,
          maxScore: scoreSummary.maxScore ?? null,
          percentage: scoreSummary.percentage ?? null,
          generatedAt: parsed.reportPdf?.generatedAt || submission.updatedAt.toISOString(),
          sentAt: parsed.reportPdf?.sentAt || null,
          reportUrl: `/parent-dashboard/report/${submission.id}`,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("Error fetching parent MCQ reports:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch MCQ reports" }, { status: 500 });
  }
}
