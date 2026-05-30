import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasRole } from "@/lib/auth";

const TEST_CONFIG_START = "[MCQ_TEST_CONFIG_V1]";
const TEST_CONFIG_END = "[/MCQ_TEST_CONFIG_V1]";
const LEGACY_TEMPLATE_START = "[MCQ_TEMPLATE_CONFIG_V1]";
const LEGACY_TEMPLATE_END = "[/MCQ_TEMPLATE_CONFIG_V1]";

type McqQuestionType = "single" | "multiple";
type Difficulty = "easy" | "medium" | "hard";

interface McqSectionConfig {
  id: string;
  name: string;
}

interface McqQuestionConfig {
  id: string;
  sectionId: string;
  type: McqQuestionType;
  marks: number;
  negativeEnabled?: boolean;
  negativeMarks: number;
  partialMarkingEnabled: boolean;
  optionCount?: number;
  difficulty?: Difficulty;
  correctAnswers: string[];
}

interface McqConfigStored {
  title?: string;
  numberingStyle?: string;
  sections: McqSectionConfig[];
  questions: McqQuestionConfig[];
}

interface StudentMcqAttempt {
  attemptId: string;
  attemptNumber: number;
  resourceId: number | null;
  submittedAt: string;
  timerMode: "timed" | "untimed";
  summary: {
    answeredCount: number;
    totalQuestions: number;
    maxScore: number;
  };
  answersByQuestionId: Record<string, string[]>;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const normalizeAnswerArray = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => String(item).trim()).filter(Boolean)));
};

const normalizeAnswersByQuestion = (value: unknown): Record<string, string[]> => {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([questionId, answers]) => [
      questionId,
      normalizeAnswerArray(answers),
    ])
  );
};

const decodeMcqTemplateDescription = (description: string | null) => {
  const value = description || "";
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
      const json = Buffer.from(encoded, "base64").toString("utf8");
      return {
        summary,
        config: JSON.parse(json) as unknown,
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

const normalizeMcqConfig = (config: unknown): McqConfigStored | null => {
  if (!config || typeof config !== "object") return null;
  const raw = config as Record<string, unknown>;
  const rawSections = Array.isArray(raw.sections) ? raw.sections : [];
  const sections = rawSections.map((section, index) => {
    const current = (section || {}) as Record<string, unknown>;
    return {
      id: typeof current.id === "string" && current.id ? current.id : `section-${index + 1}`,
      name: typeof current.name === "string" && current.name ? current.name : `Section ${index + 1}`,
    };
  });

  const sectionIds = new Set(sections.map((section) => section.id));
  const fallbackSectionId = sections[0]?.id || "section-1";
  if (sections.length === 0) {
    sections.push({ id: fallbackSectionId, name: "Section 1" });
  }

  const rawQuestions = Array.isArray(raw.questions) ? raw.questions : [];
  const questions = rawQuestions.map((question, index) => {
    const current = (question || {}) as Record<string, unknown>;
    const type: McqQuestionType = current.type === "multiple" ? "multiple" : "single";
    const negativeMarks = Math.max(0, Number(current.negativeMarks) || 0);
    const sectionIdRaw = typeof current.sectionId === "string" ? current.sectionId : fallbackSectionId;
    return {
      id: typeof current.id === "string" && current.id ? current.id : `q-${index + 1}`,
      sectionId: sectionIds.has(sectionIdRaw) ? sectionIdRaw : fallbackSectionId,
      type,
      marks: Math.max(0, Number(current.marks) || 0),
      negativeEnabled: Boolean(current.negativeEnabled) || negativeMarks > 0,
      negativeMarks,
      partialMarkingEnabled: type === "multiple" ? Boolean(current.partialMarkingEnabled) : false,
      optionCount: Math.max(2, Math.min(8, Number(current.optionCount) || 4)),
      difficulty: current.difficulty === "easy" || current.difficulty === "hard" ? current.difficulty : "medium",
      correctAnswers: normalizeAnswerArray(current.correctAnswers),
    } satisfies McqQuestionConfig;
  });

  if (questions.length === 0) return null;
  return {
    title: typeof raw.title === "string" ? raw.title : "MCQ Test",
    numberingStyle: typeof raw.numberingStyle === "string" ? raw.numberingStyle : "numeric",
    sections,
    questions,
  };
};

const formatQuestionNumber = (index: number, style: string | undefined) => {
  const n = index + 1;
  if (style === "alpha-upper") {
    let value = n;
    let result = "";
    while (value > 0) {
      value -= 1;
      result = String.fromCharCode(65 + (value % 26)) + result;
      value = Math.floor(value / 26);
    }
    return result;
  }
  return String(n);
};

const parseSubmissionAttempts = (content: string | null): {
  parsed: Record<string, unknown> | null;
  attempts: StudentMcqAttempt[];
  resourceId: number | null;
} => {
  if (!content) return { parsed: null, attempts: [], resourceId: null };
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    if (parsed.submissionType !== "mcq_test_attempt") {
      return { parsed: null, attempts: [], resourceId: null };
    }

    const resourceId = Number.isFinite(Number(parsed.resourceId)) ? Number(parsed.resourceId) : null;
    const attemptsRaw = Array.isArray(parsed.attempts) ? parsed.attempts : [];
    const attemptsFromHistory = attemptsRaw.map((attempt, index) => {
      const current = (attempt || {}) as Record<string, unknown>;
      return {
        attemptId: typeof current.attemptId === "string" ? current.attemptId : `attempt-${index + 1}`,
        attemptNumber: Number(current.attemptNumber) || index + 1,
        resourceId: Number.isFinite(Number(current.resourceId)) ? Number(current.resourceId) : resourceId,
        submittedAt: typeof current.submittedAt === "string" ? current.submittedAt : "",
        timerMode: current.timerMode === "timed" ? "timed" : "untimed",
        summary: {
          answeredCount: Number((current.summary as Record<string, unknown> | undefined)?.answeredCount) || 0,
          totalQuestions: Number((current.summary as Record<string, unknown> | undefined)?.totalQuestions) || 0,
          maxScore: Number((current.summary as Record<string, unknown> | undefined)?.maxScore) || 0,
        },
        answersByQuestionId: normalizeAnswersByQuestion(current.answersByQuestionId),
      } satisfies StudentMcqAttempt;
    }).filter((attempt) => attempt.submittedAt || Object.keys(attempt.answersByQuestionId).length > 0);

    if (attemptsFromHistory.length > 0) {
      return { parsed, attempts: attemptsFromHistory, resourceId };
    }

    // Backward compatibility for older submissions.
    const fallbackAttempt: StudentMcqAttempt = {
      attemptId: "attempt-1",
      attemptNumber: 1,
      resourceId,
      submittedAt: typeof parsed.submittedAt === "string" ? parsed.submittedAt : "",
      timerMode: parsed.timerMode === "timed" ? "timed" : "untimed",
      summary: {
        answeredCount: Number((parsed.summary as Record<string, unknown> | undefined)?.answeredCount) || 0,
        totalQuestions: Number((parsed.summary as Record<string, unknown> | undefined)?.totalQuestions) || 0,
        maxScore: Number((parsed.summary as Record<string, unknown> | undefined)?.maxScore) || 0,
      },
      answersByQuestionId: normalizeAnswersByQuestion(parsed.answersByQuestionId),
    };
    return { parsed, attempts: [fallbackAttempt], resourceId };
  } catch {
    return { parsed: null, attempts: [], resourceId: null };
  }
};

const evaluateQuestion = (question: McqQuestionConfig, selectedRaw: string[]) => {
  const selected = normalizeAnswerArray(selectedRaw);
  const correct = normalizeAnswerArray(question.correctAnswers);
  const marks = Math.max(0, Number(question.marks) || 0);
  const negativeEnabled = Boolean(question.negativeEnabled) || Number(question.negativeMarks) > 0;
  const negativeMarks = Math.max(0, Number(question.negativeMarks) || 0);

  if (selected.length === 0) {
    return { score: 0, status: "unanswered" as const, selected, correct };
  }

  if (question.type === "single") {
    const isCorrect = correct.length > 0 && selected.length === 1 && correct.includes(selected[0]);
    if (isCorrect) return { score: marks, status: "correct" as const, selected, correct };
    return { score: negativeEnabled ? -negativeMarks : 0, status: "incorrect" as const, selected, correct };
  }

  const selectedSet = new Set(selected);
  const correctSet = new Set(correct);
  let correctSelectedCount = 0;
  let wrongSelectedCount = 0;
  selected.forEach((option) => {
    if (correctSet.has(option)) correctSelectedCount += 1;
    else wrongSelectedCount += 1;
  });

  const exactMatch =
    correct.length > 0 &&
    wrongSelectedCount === 0 &&
    correct.length === selected.length &&
    correct.every((option) => selectedSet.has(option));

  if (exactMatch) return { score: marks, status: "correct" as const, selected, correct };

  if (!question.partialMarkingEnabled) {
    return {
      score: negativeEnabled ? -negativeMarks : 0,
      status: "incorrect" as const,
      selected,
      correct,
    };
  }

  const correctFraction = correct.length > 0 ? correctSelectedCount / correct.length : 0;
  const positiveScore = marks * correctFraction;
  const optionCount = Math.max(correct.length + wrongSelectedCount, Number(question.optionCount) || 2);
  const wrongSlots = Math.max(1, optionCount - correct.length);
  const wrongPenalty = wrongSelectedCount > 0 && negativeEnabled
    ? negativeMarks * (wrongSelectedCount / wrongSlots)
    : 0;
  let score = positiveScore - wrongPenalty;
  if (!negativeEnabled) {
    score = Math.max(0, score);
  } else {
    score = Math.max(-negativeMarks, score);
  }
  const hasAnyCorrect = correctSelectedCount > 0;
  const status = hasAnyCorrect ? "partial" : "incorrect";
  return { score: round2(score), status, selected, correct };
};

const stripPreviousAutoReport = (feedback: string | null) => {
  const value = feedback || "";
  const marker = "MCQ Evaluation Report";
  const idx = value.indexOf(marker);
  if (idx === -1) return value.trim();
  return value.slice(0, idx).trim();
};

const buildFeedbackReportText = (report: any) => {
  const lines: string[] = [];
  lines.push("MCQ Evaluation Report");
  lines.push(`Score: ${report.scoreSummary.finalScore}/${report.scoreSummary.maxScore} (${report.scoreSummary.percentage}%)`);
  lines.push(`Raw score (with negatives): ${report.scoreSummary.rawScore}`);
  lines.push(`Considered attempt: #${report.attemptPolicy.consideredAttemptNumber} on ${report.attemptPolicy.consideredAttemptSubmittedAt || "N/A"}`);
  lines.push("");
  lines.push("Section Breakdown:");
  report.sectionStats.forEach((section: any) => {
    lines.push(`- ${section.sectionName}: ${section.score}/${section.maxScore} (${section.percentage}%)`);
  });
  lines.push("");
  lines.push(`Questions: ${report.scoreSummary.answeredCount} answered, ${report.scoreSummary.correctCount} correct, ${report.scoreSummary.partialCount} partial, ${report.scoreSummary.wrongCount} wrong.`);
  return lines.join("\n");
};

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    if (!hasRole(user, "teacher")) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const data = await request.json();
    const submissionId = Number(data.submissionId);
    const sendToStudent = Boolean(data.sendToStudent);
    const teacherEmailParam = String(data.teacherEmail || "").toLowerCase();

    if (!Number.isFinite(submissionId)) {
      return NextResponse.json({ success: false, error: "Valid submissionId is required" }, { status: 400 });
    }

    if (teacherEmailParam && teacherEmailParam !== user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({ where: { email: user.email } });
    if (!teacher) {
      return NextResponse.json({ success: false, error: "Teacher not found" }, { status: 404 });
    }

    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        assignment: { teacherId: teacher.id },
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
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

    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found or access denied" }, { status: 404 });
    }

    const { parsed, attempts, resourceId } = parseSubmissionAttempts(submission.content);
    if (!parsed || attempts.length === 0) {
      return NextResponse.json({ success: false, error: "This submission is not an MCQ attempt." }, { status: 400 });
    }

    const linkedResources = submission.assignment.resources.map((item) => item.resource);
    const targetResource = linkedResources.find((resource) => resource.id === resourceId) || linkedResources.find((resource) => resource.type === "mcq_template");
    if (!targetResource) {
      return NextResponse.json({ success: false, error: "No linked MCQ template found for this assignment." }, { status: 400 });
    }

    const parsedTemplate = decodeMcqTemplateDescription(targetResource.description);
    const mcqConfig = normalizeMcqConfig(parsedTemplate.config);
    if (!mcqConfig) {
      return NextResponse.json({ success: false, error: "Invalid MCQ configuration on linked template." }, { status: 400 });
    }

    const attemptsSorted = [...attempts].sort((a, b) => {
      const left = new Date(a.submittedAt).getTime();
      const right = new Date(b.submittedAt).getTime();
      return left - right;
    });

    const dueDate = new Date(submission.assignment.dueDate);
    const hasValidDueDate = Number.isFinite(dueDate.getTime());
    const validAttempts = hasValidDueDate
      ? attemptsSorted.filter((attempt) => {
          const submittedAtMs = new Date(attempt.submittedAt).getTime();
          return Number.isFinite(submittedAtMs) && submittedAtMs <= dueDate.getTime();
        })
      : attemptsSorted;
    const consideredAttempt = (validAttempts.length > 0 ? validAttempts[validAttempts.length - 1] : attemptsSorted[attemptsSorted.length - 1]) || attemptsSorted[attemptsSorted.length - 1];

    if (!consideredAttempt) {
      return NextResponse.json({ success: false, error: "No attempt found to evaluate." }, { status: 400 });
    }

    const sectionNameById = new Map(mcqConfig.sections.map((section) => [section.id, section.name]));
    const sectionStatsMap = new Map<string, {
      sectionId: string;
      sectionName: string;
      questionCount: number;
      answeredCount: number;
      correctCount: number;
      partialCount: number;
      wrongCount: number;
      unansweredCount: number;
      score: number;
      maxScore: number;
    }>();
    const difficultyStatsMap = new Map<Difficulty, {
      difficulty: Difficulty;
      questionCount: number;
      answeredCount: number;
      correctCount: number;
      partialCount: number;
      wrongCount: number;
      unansweredCount: number;
      score: number;
      maxScore: number;
    }>();

    let answeredCount = 0;
    let correctCount = 0;
    let partialCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let rawScore = 0;
    let maxScore = 0;

    const questionStats = mcqConfig.questions.map((question, index) => {
      const selectedAnswers = consideredAttempt.answersByQuestionId[question.id] || [];
      const result = evaluateQuestion(question, selectedAnswers);
      const difficulty: Difficulty = question.difficulty || "medium";
      const sectionName = sectionNameById.get(question.sectionId) || "Section";
      const questionMax = Math.max(0, question.marks);
      maxScore += questionMax;
      rawScore += result.score;

      const sectionStat = sectionStatsMap.get(question.sectionId) || {
        sectionId: question.sectionId,
        sectionName,
        questionCount: 0,
        answeredCount: 0,
        correctCount: 0,
        partialCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
        score: 0,
        maxScore: 0,
      };
      sectionStat.questionCount += 1;
      sectionStat.score = round2(sectionStat.score + result.score);
      sectionStat.maxScore = round2(sectionStat.maxScore + questionMax);

      const difficultyStat = difficultyStatsMap.get(difficulty) || {
        difficulty,
        questionCount: 0,
        answeredCount: 0,
        correctCount: 0,
        partialCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
        score: 0,
        maxScore: 0,
      };
      difficultyStat.questionCount += 1;
      difficultyStat.score = round2(difficultyStat.score + result.score);
      difficultyStat.maxScore = round2(difficultyStat.maxScore + questionMax);

      if (result.status === "unanswered") {
        unansweredCount += 1;
        sectionStat.unansweredCount += 1;
        difficultyStat.unansweredCount += 1;
      } else {
        answeredCount += 1;
        sectionStat.answeredCount += 1;
        difficultyStat.answeredCount += 1;
        if (result.status === "correct") {
          correctCount += 1;
          sectionStat.correctCount += 1;
          difficultyStat.correctCount += 1;
        } else if (result.status === "partial") {
          partialCount += 1;
          sectionStat.partialCount += 1;
          difficultyStat.partialCount += 1;
        } else {
          wrongCount += 1;
          sectionStat.wrongCount += 1;
          difficultyStat.wrongCount += 1;
        }
      }

      sectionStatsMap.set(question.sectionId, sectionStat);
      difficultyStatsMap.set(difficulty, difficultyStat);

      return {
        questionId: question.id,
        questionNumber: formatQuestionNumber(index, mcqConfig.numberingStyle),
        sectionId: question.sectionId,
        sectionName,
        difficulty,
        type: question.type,
        marks: question.marks,
        negativeMarks: question.negativeMarks,
        partialMarkingEnabled: question.type === "multiple" ? question.partialMarkingEnabled : false,
        correctAnswers: question.correctAnswers,
        selectedAnswers: result.selected,
        scoreAwarded: round2(result.score),
        status: result.status,
      };
    });

    const roundedRawScore = round2(rawScore);
    const finalScore = round2(Math.max(0, roundedRawScore));
    const percentage = maxScore > 0 ? round2((finalScore / maxScore) * 100) : 0;
    const gradeToStore = Math.round(Math.max(0, Math.min(submission.assignment.totalPoints, finalScore)));

    const sectionStats = Array.from(sectionStatsMap.values()).map((section) => ({
      ...section,
      percentage: section.maxScore > 0 ? round2((section.score / section.maxScore) * 100) : 0,
    }));
    const difficultyStats = Array.from(difficultyStatsMap.values()).map((difficulty) => ({
      ...difficulty,
      percentage: difficulty.maxScore > 0 ? round2((difficulty.score / difficulty.maxScore) * 100) : 0,
    }));

    const report = {
      version: 1,
      generatedAt: new Date().toISOString(),
      generatedByTeacherId: teacher.id,
      submissionId: submission.id,
      assignmentId: submission.assignment.id,
      assignmentTitle: submission.assignment.title,
      student: submission.student,
      template: {
        resourceId: targetResource.id,
        title: targetResource.title,
      },
      attemptPolicy: {
        rule: hasValidDueDate ? "latest_before_due_date_else_latest" : "latest_attempt",
        assignmentDueDate: hasValidDueDate ? dueDate.toISOString() : null,
        attemptsFound: attemptsSorted.length,
        validAttemptsBeforeDue: validAttempts.length,
        consideredAttemptId: consideredAttempt.attemptId,
        consideredAttemptNumber: consideredAttempt.attemptNumber,
        consideredAttemptSubmittedAt: consideredAttempt.submittedAt,
        usedLateFallback: hasValidDueDate && validAttempts.length === 0,
      },
      scoreSummary: {
        maxScore: round2(maxScore),
        rawScore: roundedRawScore,
        finalScore,
        percentage,
        gradeStored: gradeToStore,
        answeredCount,
        unansweredCount,
        correctCount,
        partialCount,
        wrongCount,
      },
      sectionStats,
      difficultyStats,
      questionStats,
    };

    const nextContentPayload = {
      ...parsed,
      report,
      reportGeneratedAt: report.generatedAt,
      reportGeneratedByTeacherId: teacher.id,
    };

    const manualFeedback = stripPreviousAutoReport(submission.feedback);
    const reportText = buildFeedbackReportText(report);
    const nextFeedback = sendToStudent
      ? [manualFeedback, reportText].filter(Boolean).join("\n\n")
      : submission.feedback;

    const updatedSubmission = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        content: JSON.stringify(nextContentPayload, null, 2),
        grade: gradeToStore,
        status: "graded",
        feedback: nextFeedback,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true, grade: true },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            totalPoints: true,
            program: true,
            subject: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      report,
      submission: updatedSubmission,
      message: sendToStudent
        ? "MCQ report generated and sent to student feedback."
        : "MCQ report generated successfully.",
    });
  } catch (error) {
    console.error("Error generating MCQ report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate MCQ report" },
      { status: 500 }
    );
  }
}
