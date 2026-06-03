"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PremiumMcqReport from "@/components/common/PremiumMcqReport";
import type { McqReportPresentation } from "@/lib/mcq-report-presentation";
import { Button } from "@/components/ui/button";
import { createDefaultReportPresentation, normalizeReportPresentation } from "@/lib/mcq-report-presentation";

interface SubmissionResponse {
  success: boolean;
  submission?: {
    id: number;
    content: string | null;
    assignment?: {
      title?: string;
    };
    student?: {
      name?: string;
    };
  };
  error?: string;
}

interface ParsedReportPayload {
  testTitle: string;
  assessmentType?: "mock-test" | "simple-assignment";
  report?: {
    assessmentType?: "mock-test" | "simple-assignment";
    generatedAt?: string;
    attemptPolicy?: {
      consideredAttemptNumber?: number;
    };
    scoreSummary?: {
      finalScore?: number;
      maxScore?: number;
    };
    sectionStats?: Array<{
      sectionId?: string;
      sectionName?: string;
      percentage?: number;
    }>;
    difficultyStats?: Array<Record<string, unknown>>;
    questionStats?: Array<Record<string, unknown>>;
  };
  reportPresentation?: unknown;
  reportPdf?: {
    fileKey?: string;
    publicUrl?: string;
    generatedAt?: string;
  };
  attempts?: Array<{
    attemptNumber?: number;
  }>;
  latestAttemptNumber?: number;
}

export default function StudentReportPdfPage() {
  const params = useParams<{ submissionId: string }>();
  const router = useRouter();
  const submissionId = Number(params?.submissionId || 0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<ParsedReportPayload | null>(null);
  const [studentName, setStudentName] = useState("Student");
  const [assignmentTitle, setAssignmentTitle] = useState("Assessment");

  useEffect(() => {
    const run = async () => {
      if (!Number.isFinite(submissionId) || submissionId <= 0) {
        setError("Invalid submission id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/student/submissions?submissionId=${submissionId}`);
        const data = await response.json() as SubmissionResponse;

        if (!response.ok || !data.success || !data.submission) {
          throw new Error(data.error || "Unable to load report");
        }

        const parsed = data.submission.content ? JSON.parse(data.submission.content) as ParsedReportPayload : null;
        if (!parsed || parsed.report == null) {
          throw new Error("No MCQ report found for this submission.");
        }

        const normalizedTestTitle = parsed.testTitle || "MCQ Diagnostic";
        const fallback = createDefaultReportPresentation({
          studentName: data.submission.student?.name || "Student",
          assignmentTitle: data.submission.assignment?.title || "Assessment",
          testTitle: normalizedTestTitle,
          sectionStats: parsed.report.sectionStats || [],
        });
        const presentation = normalizeReportPresentation(
          parsed.reportPresentation,
          fallback,
          parsed.report.sectionStats || []
        );

        if (presentation.mode !== "confirmed") {
          throw new Error("Report is not confirmed by mentor yet.");
        }

        setPayload({
          ...parsed,
          testTitle: normalizedTestTitle,
          reportPresentation: presentation,
        });
        console.log("API student object:", data.submission.student);
        setStudentName(data.submission.student?.name || "Student");
        setAssignmentTitle(data.submission.assignment?.title || "Assessment");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [submissionId]);

  const attemptsLabel = useMemo(() => {
    const attempts = Array.isArray(payload?.attempts) ? payload?.attempts : [];
    const count = attempts.length > 0 ? attempts.length : 1;
    const latest = Number(payload?.latestAttemptNumber) || count;
    return `${count} (latest #${latest})`;
  }, [payload]);

  if (loading) {
    return <div className="mx-auto max-w-5xl p-6 text-sm text-slate-600">Loading report...</div>;
  }

  if (error || !payload?.report || !payload.reportPresentation) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error || "Report unavailable."}</p>
        <Button variant="outline" onClick={() => router.push("/student-dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 bg-white p-4 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button variant="outline" onClick={() => router.push("/student-dashboard")}>Back to Dashboard</Button>
        {/* <Button onClick={() => window.print()}>Download as PDF</Button> */}
      </div>

      <PremiumMcqReport
        report={{ ...payload.report, assessmentType: payload.report.assessmentType || payload.assessmentType }}
        presentation={payload.reportPresentation as McqReportPresentation}
        studentName={studentName}
        assignmentTitle={assignmentTitle}
        testTitle={payload.testTitle || "MCQ Diagnostic"}
        attemptsLabel={attemptsLabel}
        consideredAttemptLabel={`#${payload.report.attemptPolicy?.consideredAttemptNumber ?? 1}`}
      />
    </div>
  );
}
