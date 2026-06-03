"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useRequireAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  BookOpen,
  FileText,
  Trophy,
  Calendar,
  User,
  Settings,
  GraduationCap,
  BarChart3,
  Clock,
  Upload,
  Star,
  MessageCircle,
  Bell,
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Eye,
  Send,
  ChevronRight,
  TrendingUp,
  Target,
  Award,
  Bookmark,
  RefreshCw,
  LogOut,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ResourceLibrary from "@/components/student/ResourceLibrary";
import MentorMessages from "../../components/student/MentorMessages";
import StudentScheduleView from "@/components/student/StudentScheduleView";
import ProgressReportList from "@/components/common/ProgressReportList";
import DashboardLoadingSkeleton, { ShimmerSkeleton } from "@/components/ui/dashboard-loading-skeleton";
import { getUserTimezone, formatDateTime, formatDate } from "@/lib/timezone";

interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
  schoolName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  program: string;
  enrollments: Array<{
    program: string;
    subject: string;
    isActive: boolean;
  }>;
  teachers: Array<{
    id: number;
    name: string;
    email: string;
    program: string;
  }>;
  stats: {
    totalSubmissions: number;
    gradedSubmissions: number;
    averageGrade: number;
    pendingAssignments: number;
  };
}

interface Assignment {
  id: number;
  title: string;
  subject: string;
  description: string;
  instructions?: string | null;
  program: string;
  grade: string;
  dueDate: string;
  dueDateIso?: string;
  dueDateTimezone?: string | null;
  totalPoints: number;
  status: string;
  allowLateSubmission?: boolean;
  submissionId?: number | null;
  resources?: AssignmentResource[];
}

type McqQuestionType = "single" | "multiple";
type McqOptionLabelStyle = "alpha-upper" | "numeric" | "roman-lower" | "custom";
type McqQuestionNumberingStyle = "numeric" | "alpha-upper" | "roman-lower" | "roman-upper";
type McqAssessmentType = "mock-test" | "simple-assignment";

interface AssignmentResource {
  id: number;
  title: string;
  description?: string | null;
  type: string;
  isRequired?: boolean;
  fileUrl?: string | null;
  linkUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mcqSummary?: string;
  mcqConfig?: unknown;
}

interface StudentMcqSection {
  id: string;
  name: string;
  color?: string;
  rangeExpression?: string;
}

interface StudentMcqSubtopic {
  id: string;
  name: string;
}

interface StudentMcqTopic {
  id: string;
  name: string;
  subtopics: StudentMcqSubtopic[];
}

interface StudentMcqQuestion {
  id: string;
  sectionId: string;
  topicId?: string | null;
  subtopicId?: string | null;
  type: McqQuestionType;
  marks: number;
  negativeEnabled?: boolean;
  negativeMarks: number;
  partialMarkingEnabled: boolean;
  optionCount: number;
  optionLabelStyle: McqOptionLabelStyle;
  customOptionLabels: string[];
  difficulty?: "easy" | "medium" | "hard";
}

interface StudentMcqConfig {
  assessmentType: McqAssessmentType;
  title: string;
  description: string;
  numberingStyle: McqQuestionNumberingStyle;
  recommendedTimeMode?: "auto" | "manual";
  recommendedTimeMinutes?: number;
  sections: StudentMcqSection[];
  topics: StudentMcqTopic[];
  questions: StudentMcqQuestion[];
}

interface Submission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  assignmentSubject: string;
  content?: string;
  fileUrl?: string;
  fileName?: string; // Added fileName property
  fileSize?: number; // Optionally add fileSize if used elsewhere
  submittedAt: string;
  grade?: number | null;
  totalPoints: number;
  feedback?: string;
  status: string;
}

interface StudentScheduleEvent {
  id: number;
  title?: string | null;
  subject?: string | null;
  status?: string | null;
  date?: string | null;
  startDateTime?: string | null;
  startTime?: string | null;
}

interface TimelineEvent {
  id: string;
  title: string;
  when: Date;
  typeLabel: string;
}

interface ParsedMcqSubmission {
  testTitle: string;
  answeredCount: number;
  totalQuestions: number;
  maxScore: number;
  attemptCount: number;
  latestAttemptLabel: string;
  obtainedScore?: number | null;
  isConfirmedReport: boolean;
}

interface StudentMcqAttemptRecord {
  attemptId: string;
  attemptNumber: number;
  resourceId: number | null;
  startedAt: string;
  submittedAt: string;
  timerMode: "timed" | "untimed";
  recommendedMinutes: number;
  chosenMinutes: number | null;
  elapsedMs: number;
  markedForReviewQuestionIds: string[];
  summary: {
    answeredCount: number;
    totalQuestions: number;
    maxScore: number;
  };
  answersByQuestionId: Record<string, string[]>;
  questions: Array<{
    questionId: string;
    questionNo: string;
    type: McqQuestionType;
    marks: number;
    negativeMarks: number;
    partialMarkingEnabled: boolean;
    selectedAnswers: string[];
    timeSpentMs?: number;
    visitCount?: number;
    firstViewedAt?: string | null;
    lastViewedAt?: string | null;
    lastAnsweredAt?: string | null;
  }>;
}

interface StudentMcqQuestionTiming {
  timeSpentMs: number;
  visitCount: number;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
  lastAnsweredAt: string | null;
}

const clampPercentage = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const getDueDateDeadline = (dueDate: string) => {
  const endOfDay = new Date(`${dueDate}T23:59:59`);
  if (Number.isNaN(endOfDay.getTime())) {
    return new Date(dueDate);
  }
  return endOfDay;
};

const normalizeTimelineDate = (schedule: StudentScheduleEvent) => {
  if (schedule.startDateTime) {
    const dt = new Date(schedule.startDateTime);
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  if (schedule.date && typeof schedule.startTime === "string" && /^\d{1,2}:\d{2}/.test(schedule.startTime)) {
    const dt = new Date(`${schedule.date.split("T")[0]}T${schedule.startTime}`);
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  if (schedule.date) {
    const dt = new Date(schedule.date);
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  return null;
};

const formatDuration = (ms: number) => {
  const value = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(value / 3600);
  const mins = Math.floor((value % 3600) / 60);
  const secs = value % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const createDefaultMcqQuestionTiming = (): StudentMcqQuestionTiming => ({
  timeSpentMs: 0,
  visitCount: 0,
  firstViewedAt: null,
  lastViewedAt: null,
  lastAnsweredAt: null,
});

const ALL_MCQ_SECTIONS_VALUE = "__all_sections__";

const parseStudentMcqAttemptHistory = (content: string | undefined): StudentMcqAttemptRecord[] => {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content) as {
      submissionType?: string;
      attempts?: unknown;
      resourceId?: number;
      answersByQuestionId?: Record<string, string[]>;
      questions?: Array<{
        questionId?: string;
        questionNo?: string;
        type?: McqQuestionType;
        marks?: number;
        negativeMarks?: number;
        partialMarkingEnabled?: boolean;
        selectedAnswers?: string[];
        timeSpentMs?: number;
        visitCount?: number;
        firstViewedAt?: string | null;
        lastViewedAt?: string | null;
        lastAnsweredAt?: string | null;
      }>;
      summary?: {
        answeredCount?: number;
        totalQuestions?: number;
        maxScore?: number;
      };
      submittedAt?: string;
    };

    if (parsed.submissionType !== "mcq_test_attempt") return [];
    if (Array.isArray(parsed.attempts)) {
      return parsed.attempts
        .map((attempt, index) => {
          const current = (attempt || {}) as Partial<StudentMcqAttemptRecord>;
          const attemptSummary = current.summary || { answeredCount: 0, totalQuestions: 0, maxScore: 0 };
          const safeAnswers = current.answersByQuestionId && typeof current.answersByQuestionId === "object"
            ? Object.fromEntries(
                Object.entries(current.answersByQuestionId).map(([questionId, answers]) => [
                  questionId,
                  Array.isArray(answers) ? answers.map((value) => String(value)) : [],
                ])
              )
            : {};
          return {
            attemptId: current.attemptId || `attempt-${index + 1}`,
            attemptNumber: Number(current.attemptNumber) || index + 1,
            resourceId: Number.isFinite(Number(current.resourceId)) ? Number(current.resourceId) : null,
            startedAt: typeof current.startedAt === "string" ? current.startedAt : "",
            submittedAt: typeof current.submittedAt === "string" ? current.submittedAt : "",
            timerMode: current.timerMode === "timed" ? ("timed" as const) : ("untimed" as const),
            recommendedMinutes: Math.max(1, Number(current.recommendedMinutes) || 1),
            chosenMinutes: current.chosenMinutes !== null && current.chosenMinutes !== undefined
              ? Math.max(1, Number(current.chosenMinutes) || 1)
              : null,
            elapsedMs: Math.max(0, Number(current.elapsedMs) || 0),
            markedForReviewQuestionIds: Array.isArray(current.markedForReviewQuestionIds)
              ? current.markedForReviewQuestionIds.map((value) => String(value))
              : [],
            summary: {
              answeredCount: Number(attemptSummary.answeredCount) || 0,
              totalQuestions: Number(attemptSummary.totalQuestions) || 0,
              maxScore: Number(attemptSummary.maxScore) || 0,
            },
            answersByQuestionId: safeAnswers,
            questions: Array.isArray(current.questions)
              ? current.questions.map((question, questionIndex) => {
                  const currentQuestion = (question || {}) as StudentMcqAttemptRecord["questions"][number];
                  return {
                    questionId: String(currentQuestion.questionId || `q-${questionIndex + 1}`),
                    questionNo: String(currentQuestion.questionNo || `${questionIndex + 1}`),
                    type: currentQuestion.type === "multiple" ? ("multiple" as McqQuestionType) : ("single" as McqQuestionType),
                    marks: Math.max(0, Number(currentQuestion.marks) || 0),
                    negativeMarks: Math.max(0, Number(currentQuestion.negativeMarks) || 0),
                    partialMarkingEnabled: Boolean(currentQuestion.partialMarkingEnabled),
                    selectedAnswers: Array.isArray(currentQuestion.selectedAnswers)
                      ? currentQuestion.selectedAnswers.map((value) => String(value))
                      : [],
                    timeSpentMs: Math.max(0, Number(currentQuestion.timeSpentMs) || 0),
                    visitCount: Math.max(0, Number(currentQuestion.visitCount) || 0),
                    firstViewedAt: typeof currentQuestion.firstViewedAt === "string" ? currentQuestion.firstViewedAt : null,
                    lastViewedAt: typeof currentQuestion.lastViewedAt === "string" ? currentQuestion.lastViewedAt : null,
                    lastAnsweredAt: typeof currentQuestion.lastAnsweredAt === "string" ? currentQuestion.lastAnsweredAt : null,
                  };
                })
              : [],
          };
        })
        .filter((attempt) => attempt.summary.totalQuestions > 0 || Object.keys(attempt.answersByQuestionId).length > 0);
    }

    // Legacy fallback before attempt history existed.
    const summary = parsed.summary || { answeredCount: 0, totalQuestions: 0, maxScore: 0 };
    const answersByQuestionId = parsed.answersByQuestionId && typeof parsed.answersByQuestionId === "object"
      ? parsed.answersByQuestionId
      : {};
    return [{
      attemptId: "attempt-1",
      attemptNumber: 1,
      resourceId: Number.isFinite(Number(parsed.resourceId)) ? Number(parsed.resourceId) : null,
      startedAt: parsed.submittedAt || "",
      submittedAt: parsed.submittedAt || "",
      timerMode: "untimed" as const,
      recommendedMinutes: 1,
      chosenMinutes: null,
      elapsedMs: 0,
      markedForReviewQuestionIds: [],
      summary: {
        answeredCount: Number(summary.answeredCount) || 0,
        totalQuestions: Number(summary.totalQuestions) || 0,
        maxScore: Number(summary.maxScore) || 0,
      },
      answersByQuestionId: answersByQuestionId,
      questions: Array.isArray(parsed.questions) ? parsed.questions.map((question, index) => ({
        questionId: String(question.questionId || `q-${index + 1}`),
        questionNo: String(question.questionNo || `${index + 1}`),
        type: question.type === "multiple" ? ("multiple" as McqQuestionType) : ("single" as McqQuestionType),
        marks: Math.max(0, Number(question.marks) || 0),
        negativeMarks: Math.max(0, Number(question.negativeMarks) || 0),
        partialMarkingEnabled: Boolean(question.partialMarkingEnabled),
        selectedAnswers: Array.isArray(question.selectedAnswers)
          ? question.selectedAnswers.map((value) => String(value))
          : [],
        timeSpentMs: Math.max(0, Number(question.timeSpentMs) || 0),
        visitCount: Math.max(0, Number(question.visitCount) || 0),
        firstViewedAt: typeof question.firstViewedAt === "string" ? question.firstViewedAt : null,
        lastViewedAt: typeof question.lastViewedAt === "string" ? question.lastViewedAt : null,
        lastAnsweredAt: typeof question.lastAnsweredAt === "string" ? question.lastAnsweredAt : null,
      })) : [],
    }];
  } catch {
    return [];
  }
};

const parseMcqSubmissionSummary = (content: string | undefined): ParsedMcqSubmission | null => {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as {
      submissionType?: string;
      testTitle?: string;
      summary?: {
        answeredCount?: number;
        totalQuestions?: number;
        maxScore?: number;
      };
      report?: {
        scoreSummary?: {
          finalScore?: number;
        };
      };
      reportPresentation?: {
        mode?: "draft" | "confirmed";
      };
      attempts?: Array<{ summary?: { answeredCount?: number; totalQuestions?: number; maxScore?: number } }>;
    };
    if (parsed.submissionType !== "mcq_test_attempt") return null;
    const attempts = Array.isArray(parsed.attempts) ? parsed.attempts : [];
    const latestAttemptSummary = attempts.length > 0 ? attempts[attempts.length - 1]?.summary : null;
    const effectiveSummary = latestAttemptSummary || parsed.summary || {};
    const reportScore = Number(parsed.report?.scoreSummary?.finalScore);
    return {
      testTitle: parsed.testTitle || "MCQ + PDF Assessment",
      answeredCount: Number(effectiveSummary.answeredCount) || 0,
      totalQuestions: Number(effectiveSummary.totalQuestions) || 0,
      maxScore: Number(effectiveSummary.maxScore) || 0,
      attemptCount: attempts.length > 0 ? attempts.length : 1,
      latestAttemptLabel: attempts.length > 1 ? `Attempt ${attempts.length}` : "Attempt 1",
      obtainedScore: Number.isFinite(reportScore) ? reportScore : null,
      isConfirmedReport: parsed.reportPresentation?.mode === "confirmed",
    };
  } catch {
    return null;
  }
};

const toRoman = (num: number) => {
  if (num <= 0) return "";
  const romans: Array<[number, string]> = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let value = num;
  let result = "";
  romans.forEach(([v, symbol]) => {
    while (value >= v) {
      result += symbol;
      value -= v;
    }
  });
  return result;
};

const toAlpha = (num: number) => {
  if (num <= 0) return "";
  let n = num;
  let result = "";
  while (n > 0) {
    n -= 1;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
};

const formatMcqQuestionNumber = (index: number, style: McqQuestionNumberingStyle) => {
  const n = index + 1;
  if (style === "alpha-upper") return toAlpha(n);
  if (style === "roman-lower") return toRoman(n).toLowerCase();
  if (style === "roman-upper") return toRoman(n);
  return String(n);
};

const getMcqOptionLabels = (question: StudentMcqQuestion) => {
  const count = Math.max(2, Math.min(8, question.optionCount));
  if (question.optionLabelStyle === "custom") {
    const normalizedCustom = question.customOptionLabels.map((item) => item.trim()).filter(Boolean);
    return Array.from({ length: count }, (_, idx) => normalizedCustom[idx] || `Opt ${idx + 1}`);
  }

  return Array.from({ length: count }, (_, idx) => {
    const n = idx + 1;
    if (question.optionLabelStyle === "numeric") return String(n);
    if (question.optionLabelStyle === "roman-lower") return toRoman(n).toLowerCase();
    return toAlpha(n);
  });
};

const getMcqAssessmentTypeShortLabel = (assessmentType: McqAssessmentType) =>
  assessmentType === "simple-assignment" ? "Assignment" : "Mock Test";

const getMcqAssessmentTypeLabel = (assessmentType: McqAssessmentType) =>
  assessmentType === "simple-assignment" ? "MCQ + PDF Assignment" : "MCQ + PDF Mock Test";

const getMcqAttemptActionLabel = (assessmentType: McqAssessmentType, hasPreviousAttempt = false) => {
  const action = hasPreviousAttempt ? "Reattempt" : "Attempt";
  return assessmentType === "simple-assignment" ? `${action} Assignment` : `${action} Mock Test`;
};

const MCQ_CONFIG_MARKERS = [
  ["[MCQ_TEST_CONFIG_V1]", "[/MCQ_TEST_CONFIG_V1]"],
  ["[MCQ_TEMPLATE_CONFIG_V1]", "[/MCQ_TEMPLATE_CONFIG_V1]"],
] as const;

const cleanStudentVisibleText = (value?: string | null) => {
  if (!value) return "";
  let cleaned = value;
  MCQ_CONFIG_MARKERS.forEach(([startMarker, endMarker]) => {
    const start = cleaned.indexOf(startMarker);
    if (start === -1) return;
    const end = cleaned.indexOf(endMarker, start + startMarker.length);
    cleaned = end === -1
      ? cleaned.slice(0, start)
      : `${cleaned.slice(0, start)} ${cleaned.slice(end + endMarker.length)}`;
  });
  return cleaned.trim();
};

const getStudentResourceSummary = (resource?: AssignmentResource | null) =>
  cleanStudentVisibleText(resource?.mcqSummary || resource?.description || "");

const normalizeStudentMcqConfig = (value: unknown): StudentMcqConfig | null => {
  const raw = (value || {}) as Record<string, unknown>;
  const rawSections = Array.isArray(raw.sections) ? raw.sections : [];
  const sections = rawSections.map((section, idx) => {
    const current = (section || {}) as Record<string, unknown>;
    return {
      id: typeof current.id === "string" && current.id ? current.id : `section-${idx + 1}`,
      name: typeof current.name === "string" && current.name ? current.name : `Section ${idx + 1}`,
      color: typeof current.color === "string" ? current.color : undefined,
      rangeExpression: typeof current.rangeExpression === "string" ? current.rangeExpression : undefined,
    };
  });

  if (sections.length === 0) {
    sections.push({ id: "section-1", name: "Section 1", color: undefined, rangeExpression: undefined });
  }

  const rawTopics = Array.isArray(raw.topics) ? raw.topics : [];
  const topics: StudentMcqTopic[] = rawTopics
    .map((topic, idx) => {
      const current = (topic || {}) as Record<string, unknown>;
      const topicName = typeof current.name === "string" ? current.name.trim() : "";
      if (!topicName) return null;
      const rawSubtopics = Array.isArray(current.subtopics) ? current.subtopics : [];
      const subtopics: StudentMcqSubtopic[] = rawSubtopics
        .map((subtopic, subtopicIndex) => {
          const sub = (subtopic || {}) as Record<string, unknown>;
          const subtopicName = typeof sub.name === "string" ? sub.name.trim() : "";
          if (!subtopicName) return null;
          return {
            id: typeof sub.id === "string" && sub.id ? sub.id : `subtopic-${idx + 1}-${subtopicIndex + 1}`,
            name: subtopicName,
          };
        })
        .filter((subtopic): subtopic is StudentMcqSubtopic => Boolean(subtopic));
      return {
        id: typeof current.id === "string" && current.id ? current.id : `topic-${idx + 1}`,
        name: topicName,
        subtopics,
      };
    })
    .filter((topic): topic is StudentMcqTopic => Boolean(topic));
  const subtopicIdByTopicId = new Map(topics.map((topic) => [topic.id, new Set(topic.subtopics.map((subtopic) => subtopic.id))]));

  const sectionIds = new Set(sections.map((section) => section.id));
  const firstSection = sections[0].id;
  const rawQuestions = Array.isArray(raw.questions) ? raw.questions : [];
  const questions = rawQuestions.map((question, idx) => {
    const current = (question || {}) as Record<string, unknown>;
    const type: McqQuestionType = current.type === "multiple" ? "multiple" : "single";
    const optionCountRaw = Number(current.optionCount);
    const optionCount = Number.isFinite(optionCountRaw) ? Math.max(2, Math.min(8, Math.floor(optionCountRaw))) : 4;
    const negativeRaw = Number(current.negativeMarks);
    const sectionIdRaw = typeof current.sectionId === "string" ? current.sectionId : firstSection;
    const topicIdRaw = typeof current.topicId === "string" ? current.topicId : "";
    const topicId = subtopicIdByTopicId.has(topicIdRaw) ? topicIdRaw : null;
    const subtopicIdRaw = typeof current.subtopicId === "string" ? current.subtopicId : "";
    const subtopicId = topicId && subtopicIdByTopicId.get(topicId)?.has(subtopicIdRaw) ? subtopicIdRaw : null;
    return {
      id: typeof current.id === "string" && current.id ? current.id : `q-${idx + 1}`,
      sectionId: sectionIds.has(sectionIdRaw) ? sectionIdRaw : firstSection,
      topicId,
      subtopicId,
      type,
      marks: Math.max(1, Number(current.marks) || 1),
      negativeEnabled: Boolean(current.negativeEnabled),
      negativeMarks: Math.max(0, Number.isFinite(negativeRaw) ? negativeRaw : 0),
      partialMarkingEnabled: type === "multiple" ? Boolean(current.partialMarkingEnabled) : false,
      optionCount,
      optionLabelStyle: ["alpha-upper", "numeric", "roman-lower", "custom"].includes(String(current.optionLabelStyle))
        ? (current.optionLabelStyle as McqOptionLabelStyle)
        : "alpha-upper",
      customOptionLabels: Array.isArray(current.customOptionLabels)
        ? current.customOptionLabels.map((item) => String(item)).filter(Boolean)
        : [],
      difficulty: ["easy", "medium", "hard"].includes(String(current.difficulty))
        ? (current.difficulty as "easy" | "medium" | "hard")
        : "medium",
    };
  });

  if (questions.length === 0) return null;

  const numberingStyle: McqQuestionNumberingStyle =
    raw.numberingStyle === "alpha-upper" || raw.numberingStyle === "roman-lower" || raw.numberingStyle === "roman-upper"
      ? raw.numberingStyle
      : "numeric";

  return {
    assessmentType: raw.assessmentType === "simple-assignment" || raw.type === "simple-assignment" ? "simple-assignment" : "mock-test",
    title: typeof raw.title === "string" ? raw.title : "MCQ + PDF Assessment",
    description: typeof raw.description === "string" ? raw.description : "",
    numberingStyle,
    recommendedTimeMode: raw.recommendedTimeMode === "manual" ? "manual" : "auto",
    recommendedTimeMinutes: Math.max(1, Number(raw.recommendedTimeMinutes) || 1),
    sections,
    topics,
    questions,
  };
};

type StudentDashboardTab =
  | "overview"
  | "assignments"
  | "submissions"
  | "grades"
  | "schedule"
  | "progress"
  | "resources"
  | "messages";

const createStudentTabLoadingState = (): Record<StudentDashboardTab, boolean> => ({
  overview: false,
  assignments: false,
  submissions: false,
  grades: false,
  schedule: false,
  progress: false,
  resources: false,
  messages: false,
});

const createStudentTabReadyState = (): Record<StudentDashboardTab, boolean> => ({
  overview: false,
  assignments: false,
  submissions: false,
  grades: false,
  schedule: false,
  progress: false,
  resources: false,
  messages: false,
});

export default function StudentDashboard() {
  // Authentication - require student role
  const { user: authUser, isLoading: authLoading } = useRequireAuth('student');

  const [activeTab, setActiveTab] = useState<StudentDashboardTab>("overview");
  const [tabLoadingState, setTabLoadingState] = useState<Record<StudentDashboardTab, boolean>>(createStudentTabLoadingState);
  const [tabReadyState, setTabReadyState] = useState<Record<StudentDashboardTab, boolean>>(createStudentTabReadyState);
  const [student, setStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<StudentScheduleEvent[]>([]);
  const [progressReports, setProgressReports] = useState<any[]>([]);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<number | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlightRef = useRef(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isResubmitDialogOpen, setIsResubmitDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [pendingDiscardMode, setPendingDiscardMode] = useState<"submit" | "resubmit" | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmissionId, setResubmissionId] = useState<number | null>(null);
  const [isMcqDialogOpen, setIsMcqDialogOpen] = useState(false);
  const [mcqAssignment, setMcqAssignment] = useState<Assignment | null>(null);
  const [mcqResourceId, setMcqResourceId] = useState<number | null>(null);
  const [mcqConfig, setMcqConfig] = useState<StudentMcqConfig | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string[]>>({});
  const [mcqMarkedForReview, setMcqMarkedForReview] = useState<Record<string, boolean>>({});
  const [mcqAttemptHistory, setMcqAttemptHistory] = useState<StudentMcqAttemptRecord[]>([]);
  const [mcqCursor, setMcqCursor] = useState(0);
  const [mcqQuestionTiming, setMcqQuestionTiming] = useState<Record<string, StudentMcqQuestionTiming>>({});
  const [mcqSectionFilterId, setMcqSectionFilterId] = useState<string>(ALL_MCQ_SECTIONS_VALUE);
  const [mcqStarted, setMcqStarted] = useState(false);
  const [mcqTimerDecision, setMcqTimerDecision] = useState<"pending" | "timed" | "untimed">("pending");
  const [mcqTimerMinutes, setMcqTimerMinutes] = useState(1);
  const [mcqTimerRunning, setMcqTimerRunning] = useState(false);
  const [mcqTimerEndAtMs, setMcqTimerEndAtMs] = useState<number | null>(null);
  const [mcqTimerRemainingMs, setMcqTimerRemainingMs] = useState(0);
  const [mcqStartedAtMs, setMcqStartedAtMs] = useState<number | null>(null);
  const [isMcqSubmitting, setIsMcqSubmitting] = useState(false);
  const [isMcqDialogMaximized, setIsMcqDialogMaximized] = useState(false);
  const mcqTimerIntervalRef = useRef<number | null>(null);
  const mcqQuestionTimingRef = useRef<Record<string, StudentMcqQuestionTiming>>({});
  const mcqQuestionEnteredAtMsRef = useRef<number | null>(null);
  const mcqActiveQuestionIdRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [isUrlStateReady, setIsUrlStateReady] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Get student email from authenticated user
  const studentEmail = authUser?.email || "";
  const isAuthenticated = Boolean(authUser);

  // Fetch data function
  const fetchData = async () => {
    if (!studentEmail) return;
    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort("request-timeout");
    }, 15000);

    try {
      setLoading(true);
      setError("");

      // Fetch student dashboard data
      const response = await fetch(`/api/student/dashboard?studentEmail=${encodeURIComponent(studentEmail)}`, {
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch student data');
      }

      setStudent(data.student);
      setAssignments(data.assignments);
      setSubmissions(data.submissions);

      // Fetch schedule events for overview timeline and schedule context.
      try {
        const scheduleResponse = await fetch(`/api/student/schedule?studentEmail=${encodeURIComponent(studentEmail)}`, {
          signal: controller.signal,
        });
        const scheduleData = await scheduleResponse.json();
        if (scheduleResponse.ok && scheduleData.success && Array.isArray(scheduleData.schedules)) {
          setScheduleEvents(scheduleData.schedules);
        } else {
          setScheduleEvents([]);
          console.error("Failed to fetch schedule events:", scheduleData);
        }
      } catch (scheduleError) {
        const isAbortError =
          (scheduleError instanceof DOMException && scheduleError.name === "AbortError") ||
          (scheduleError instanceof Error && scheduleError.name === "AbortError") ||
          scheduleError === "request-timeout" ||
          (typeof scheduleError === "string" && scheduleError.includes("request-timeout"));

        setScheduleEvents([]);
        if (!isAbortError) {
          console.error("Error fetching schedule events:", scheduleError);
        }
      }

      // Fetch progress reports
      try {
        const reportsResponse = await fetch('/api/student/progress-report');
        const reportsData = await reportsResponse.json();
        console.log('Progress Reports Response:', reportsResponse.ok, reportsData);
        if (reportsResponse.ok) {
          setProgressReports(reportsData.reports || []);
          console.log('Progress Reports Set:', reportsData.reports?.length || 0, 'reports');
        } else {
          console.error('Failed to fetch progress reports:', reportsData);
        }
      } catch (reportError) {
        console.error('Error fetching progress reports:', reportError);
        // Don't fail the whole dashboard if progress reports fail
      }
    } catch (err) {
      const isAbortError =
        (err instanceof DOMException && err.name === "AbortError") ||
        (err instanceof Error && err.name === "AbortError") ||
        err === "request-timeout" ||
        (typeof err === "string" && err.includes("request-timeout"));

      if (isAbortError && didTimeout) {
        setError("Dashboard load timed out. Please retry.");
        toast({
          variant: "destructive",
          title: "Request Timeout",
          description: "Dashboard load timed out. Please retry.",
        });
        return;
      }

      const message =
        err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
      console.error("Error fetching data:", err);
      toast({
        variant: "destructive",
        title: "Failed to load dashboard",
        description: message,
      });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // Fetch initial data - Move this hook before any conditional returns
  useEffect(() => {
    // Only fetch data if we have a student email and auth is complete
    if (!authLoading && isAuthenticated && studentEmail) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, studentEmail]);

  useEffect(() => {
    if (!authLoading) {
      setAuthTimedOut(false);
      return;
    }
    const timeoutId = setTimeout(() => {
      setAuthTimedOut(true);
    }, 15000);
    return () => clearTimeout(timeoutId);
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;
    if (authUser && !studentEmail) {
      setLoading(false);
      setError("Unable to load your account email. Please log out and sign in again.");
    }
  }, [authLoading, authUser, studentEmail]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const allowedTabs = new Set<StudentDashboardTab>([
      "overview",
      "assignments",
      "submissions",
      "grades",
      "schedule",
      "progress",
      "resources",
      "messages",
    ]);
    if (tab && allowedTabs.has(tab as StudentDashboardTab)) {
      setActiveTab(tab as StudentDashboardTab);
    }
    setIsUrlStateReady(true);
  }, []);

  useEffect(() => {
    if (!isUrlStateReady) return;
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    const currentUrl = `${pathname}${window.location.search}`;
    if (nextUrl === currentUrl) return;
    router.replace(nextUrl, { scroll: false });
  }, [activeTab, isUrlStateReady, pathname, router]);

  const warmTabData = useCallback(async (tab: StudentDashboardTab) => {
    if (!studentEmail || tabReadyState[tab]) return;

    setTabLoadingState((prev) => ({ ...prev, [tab]: true }));
    try {
      if (tab === "schedule") {
        const scheduleResponse = await fetch(`/api/student/schedule?studentEmail=${encodeURIComponent(studentEmail)}`);
        const scheduleData = await scheduleResponse.json();
        if (scheduleResponse.ok && scheduleData.success && Array.isArray(scheduleData.schedules)) {
          setScheduleEvents(scheduleData.schedules);
        }
      } else if (tab === "resources") {
        await Promise.all([
          fetch(`/api/student/resources?studentEmail=${encodeURIComponent(studentEmail)}`),
          fetch(`/api/student/teachers?studentEmail=${encodeURIComponent(studentEmail)}`),
          fetch(`/api/student/submissions/resources?studentEmail=${encodeURIComponent(studentEmail)}`),
        ]);
      } else if (tab === "messages") {
        await fetch(`/api/student/mentors?studentEmail=${encodeURIComponent(studentEmail)}`);
      }
      setTabReadyState((prev) => ({ ...prev, [tab]: true }));
    } catch (prefetchError) {
      console.error("Error warming student tab data:", prefetchError);
      // Keep this tab in not-ready state so the next visit retries prefetch.
    } finally {
      setTabLoadingState((prev) => ({ ...prev, [tab]: false }));
    }
  }, [studentEmail, tabReadyState]);

  useEffect(() => {
    if (!studentEmail) return;
    setTabLoadingState(createStudentTabLoadingState());
    setTabReadyState(createStudentTabReadyState());
  }, [studentEmail]);

  useEffect(() => {
    if (loading || !studentEmail || Boolean(error)) return;
    setTabReadyState((prev) => ({
      ...prev,
      overview: true,
      assignments: true,
      submissions: true,
      grades: true,
      schedule: true,
      progress: true,
    }));
  }, [loading, studentEmail, error]);

  useEffect(() => {
    if (!isUrlStateReady || loading || !studentEmail || Boolean(error)) return;
    void warmTabData(activeTab);
  }, [activeTab, isUrlStateReady, loading, studentEmail, error, warmTabData]);

  const hasUnsavedAssignmentDraft = Boolean(submissionText.trim() || submissionFile);

  const getAssignmentDraftStorageKey = (mode: "submit" | "resubmit", assignmentId: number | null) =>
    `aes:student:assignment-submission:draft:${studentEmail}:${mode}:${assignmentId ?? "none"}`;

  const readAssignmentDraft = (mode: "submit" | "resubmit", assignmentId: number | null) => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(getAssignmentDraftStorageKey(mode, assignmentId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { text?: string };
      return parsed.text || "";
    } catch {
      return null;
    }
  };

  const clearAssignmentDraftStorage = (mode: "submit" | "resubmit", assignmentId: number | null) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(getAssignmentDraftStorageKey(mode, assignmentId));
  };

  const resetAssignmentDraft = () => {
    setSelectedAssignment(null);
    setSubmissionText("");
    setSubmissionFile(null);
    setIsResubmitting(false);
    setResubmissionId(null);
  };

  const openAssignmentDialog = (
    assignment: Assignment,
    mode: "submit" | "resubmit",
    options?: { initialText?: string; submissionId?: number | null }
  ) => {
    const draftText = readAssignmentDraft(mode, assignment.id);
    setSelectedAssignment(assignment);
    setSubmissionText(draftText ?? options?.initialText ?? "");
    setSubmissionFile(null);
    setIsResubmitting(mode === "resubmit");
    setResubmissionId(options?.submissionId ?? null);
    if (mode === "submit") {
      setIsSubmitDialogOpen(true);
      setIsResubmitDialogOpen(false);
    } else {
      setIsResubmitDialogOpen(true);
      setIsSubmitDialogOpen(false);
    }
  };

  const discardAssignmentDraftChanges = () => {
    const modeToDiscard = pendingDiscardMode || (isResubmitting ? "resubmit" : "submit");
    clearAssignmentDraftStorage(modeToDiscard, selectedAssignment?.id ?? null);
    setIsDiscardDialogOpen(false);
    setPendingDiscardMode(null);
    setIsSubmitDialogOpen(false);
    setIsResubmitDialogOpen(false);
    resetAssignmentDraft();
  };

  const handleAssignmentDialogOpenChange = (nextOpen: boolean, mode: "submit" | "resubmit") => {
    if (!nextOpen && hasUnsavedAssignmentDraft && !isSubmitting) {
      setPendingDiscardMode(mode);
      setIsDiscardDialogOpen(true);
      return;
    }

    if (!nextOpen) {
      clearAssignmentDraftStorage(mode, selectedAssignment?.id ?? null);
      setIsSubmitDialogOpen(false);
      setIsResubmitDialogOpen(false);
      resetAssignmentDraft();
      return;
    }

    if (mode === "submit") {
      setIsSubmitDialogOpen(true);
      setIsResubmitDialogOpen(false);
    } else {
      setIsResubmitDialogOpen(true);
      setIsSubmitDialogOpen(false);
    }
  };

  useEffect(() => {
    if (!((isSubmitDialogOpen || isResubmitDialogOpen) && hasUnsavedAssignmentDraft && selectedAssignment)) return;
    if (typeof window === "undefined") return;
    const mode: "submit" | "resubmit" = isResubmitting ? "resubmit" : "submit";
    const storageKey = `aes:student:assignment-submission:draft:${studentEmail}:${mode}:${selectedAssignment.id}`;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ text: submissionText })
      );
    } catch {
      // Ignore storage errors.
    }
  }, [
    isSubmitDialogOpen,
    isResubmitDialogOpen,
    hasUnsavedAssignmentDraft,
    selectedAssignment,
    isResubmitting,
    submissionText,
    studentEmail,
  ]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!((isSubmitDialogOpen || isResubmitDialogOpen) && hasUnsavedAssignmentDraft)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isSubmitDialogOpen, isResubmitDialogOpen, hasUnsavedAssignmentDraft]);

  useEffect(() => {
    return () => {
      if (mcqTimerIntervalRef.current !== null) {
        window.clearInterval(mcqTimerIntervalRef.current);
      }
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">Pending</Badge>;
      case "submitted":
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">Submitted</Badge>;
      case "graded":
        return <Badge variant="outline" className="bg-slate-900 text-white border-slate-900">Graded</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">Active</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-slate-900 text-white border-slate-900">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSubmission = async () => {
    if (submissionInFlightRef.current || isSubmitting) return;
    if (!selectedAssignment || !student) return;
    const currentMode: "submit" | "resubmit" = isResubmitting ? "resubmit" : "submit";
    const currentAssignmentId = selectedAssignment.id;

    submissionInFlightRef.current = true;
    setIsSubmitting(true);

    try {
      let fileUrl = null;

      // Upload file to R2 if provided
      if (submissionFile) {
        try {
          // Use server-side upload directly (presigned URLs have issues with R2)
          const formData = new FormData();
          formData.append('file', submissionFile);
          formData.append('studentId', student.id.toString());
          formData.append('assignmentId', selectedAssignment.id.toString());

          const uploadResponse = await fetch('/api/upload-r2', {
            method: 'POST',
            body: formData,
          });

          const uploadData = await uploadResponse.json();

          console.log('Upload response:', uploadData);

          if (uploadData.success) {
            fileUrl = uploadData.fileUrl;
          } else {
            console.error('Upload failed:', uploadData);
            throw new Error(`Upload failed: ${uploadData.error || 'Unknown error'}`);
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          throw uploadError;
        }
      }

      // Submit assignment
      const endpoint = isResubmitting && resubmissionId
        ? '/api/student/submissions'
        : '/api/student/submissions';

      const requestBody = isResubmitting && resubmissionId
        ? {
          studentEmail: student.email,
          assignmentId: selectedAssignment.id,
          content: submissionText,
          fileUrl,
          fileName: submissionFile?.name,
          fileSize: submissionFile?.size,
        }
        : {
          studentEmail: student.email,
          assignmentId: selectedAssignment.id,
          content: submissionText,
          fileUrl,
          fileName: submissionFile?.name,
          fileSize: submissionFile?.size,
        };

      const submissionResponse = await fetch(endpoint, {
        method: isResubmitting ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const submissionData = await submissionResponse.json();

      if (submissionData.success) {
        if (isResubmitting) {
          // Update submissions list for resubmission
          const updatedSubmissions = submissions.map(sub =>
            sub.id === resubmissionId ? submissionData.submission : sub
          );
          setSubmissions(updatedSubmissions);
        } else {
          // Update assignments list for new submission
          const updatedAssignments = assignments.map(assignment =>
            assignment.id === selectedAssignment.id
              ? { ...assignment, status: "submitted" }
              : assignment
          );
          setAssignments(updatedAssignments);

          // Add to submissions list
          setSubmissions([submissionData.submission, ...submissions]);
        }

        // Reset form and close dialogs
        clearAssignmentDraftStorage(currentMode, currentAssignmentId);
        setIsSubmitDialogOpen(false);
        setIsResubmitDialogOpen(false);
        resetAssignmentDraft();

        toast({
          title: isResubmitting ? "Submission updated" : "Assignment submitted",
          description: isResubmitting
            ? "Your updated work has been sent to your mentor."
            : "Your assignment has been submitted successfully.",
          className: "border-slate-300 bg-slate-100 text-slate-800",
        });
      } else {
        throw new Error(submissionData.error || 'Submission failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setError(message);
      console.error("Error submitting assignment:", err);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
      submissionInFlightRef.current = false;
    }
  };

  const sidebarItems = [
    {
      title: "Overview",
      url: "#",
      icon: Home,
      isActive: activeTab === "overview",
      onClick: () => setActiveTab("overview"),
    },
    {
      title: "Assignments",
      url: "#",
      icon: FileText,
      isActive: activeTab === "assignments",
      onClick: () => setActiveTab("assignments"),
      badge: assignments.filter((assignment) => !submissions.some((submission) => submission.assignmentId === assignment.id)).length,
    },
    {
      title: "Submissions",
      url: "#",
      icon: Upload,
      isActive: activeTab === "submissions",
      onClick: () => setActiveTab("submissions"),
    },
    {
      title: "Grades",
      url: "#",
      icon: Trophy,
      isActive: activeTab === "grades",
      onClick: () => setActiveTab("grades"),
    },
    {
      title: "Schedule",
      url: "#",
      icon: Calendar,
      isActive: activeTab === "schedule",
      onClick: () => setActiveTab("schedule"),
    },
    {
      title: "Progress",
      url: "#",
      icon: BarChart3,
      isActive: activeTab === "progress",
      onClick: () => setActiveTab("progress"),
    },
    {
      title: "Resources",
      url: "#",
      icon: BookOpen,
      isActive: activeTab === "resources",
      onClick: () => setActiveTab("resources"),
    },
    {
      title: "Messages",
      url: "#",
      icon: MessageCircle,
      isActive: activeTab === "messages",
      onClick: () => setActiveTab("messages"),
      badge: messageUnreadCount,
    },
  ];

  const calculateGradePercentage = (grade: number, total: number) => {
    if (!Number.isFinite(total) || total <= 0) return 0;
    return Math.round(clampPercentage((grade / total) * 100));
  };

  // Check if assignment deadline has passed
  const isDeadlinePassed = (dueDate: string): boolean => {
    const deadline = getDueDateDeadline(dueDate);
    const now = new Date();
    if (Number.isNaN(deadline.getTime())) return false;
    return now > deadline;
  };

  const wasSubmittedAfterDeadline = (submittedAt: string, dueDate: string): boolean => {
    const submitted = new Date(submittedAt);
    const deadline = getDueDateDeadline(dueDate);
    if (Number.isNaN(submitted.getTime()) || Number.isNaN(deadline.getTime())) return false;
    return submitted.getTime() > deadline.getTime();
  };

  // Check if submission can be resubmitted
  const canResubmit = (submission: Submission): boolean => {
    const assignment = assignments.find(a => a.id === submission.assignmentId);
    if (!assignment) return false;

    const lateAllowed = Boolean(assignment.allowLateSubmission);
    if (isDeadlinePassed(assignment.dueDate) && !lateAllowed) return false;
    return submission.grade === null || submission.grade === undefined;
  };

  const getMcqResourcesForAssignment = (assignment: Assignment) =>
    (assignment.resources || []).filter((resource) => resource.type === "mcq_template");

  const clearMcqTimerInterval = () => {
    if (mcqTimerIntervalRef.current !== null) {
      window.clearInterval(mcqTimerIntervalRef.current);
      mcqTimerIntervalRef.current = null;
    }
  };

  const closeMcqDialog = () => {
    clearMcqTimerInterval();
    setIsMcqDialogOpen(false);
    setIsMcqDialogMaximized(false);
    setMcqAssignment(null);
    setMcqResourceId(null);
    setMcqConfig(null);
    setMcqAnswers({});
    setMcqMarkedForReview({});
    setMcqAttemptHistory([]);
    setMcqCursor(0);
    setMcqQuestionTiming({});
    setMcqSectionFilterId(ALL_MCQ_SECTIONS_VALUE);
    setMcqStarted(false);
    setMcqTimerDecision("pending");
    setMcqTimerMinutes(1);
    setMcqTimerRunning(false);
    setMcqTimerEndAtMs(null);
    setMcqTimerRemainingMs(0);
    setMcqStartedAtMs(null);
    mcqQuestionTimingRef.current = {};
    mcqQuestionEnteredAtMsRef.current = null;
    mcqActiveQuestionIdRef.current = null;
  };

  const loadMcqTemplateForAssignment = (assignment: Assignment, templateId?: number | null) => {
    const mcqResources = getMcqResourcesForAssignment(assignment);
    if (mcqResources.length === 0) return;
    const nextResource = templateId
      ? mcqResources.find((resource) => resource.id === templateId) || mcqResources[0]
      : mcqResources[0];
    const normalized = normalizeStudentMcqConfig(nextResource.mcqConfig);
    if (!normalized) {
      toast({
        variant: "destructive",
        title: "Invalid MCQ + PDF configuration",
        description: "This test is not configured correctly. Please contact your teacher.",
      });
      return;
    }

    const recommendedMinutes = Math.max(
      1,
      Number.isFinite(Number(normalized.recommendedTimeMinutes))
        ? Number(normalized.recommendedTimeMinutes)
        : Math.ceil(normalized.questions.length * 1.8)
    );
    const isSimpleAssignment = normalized.assessmentType === "simple-assignment";

    let restoredAnswers: Record<string, string[]> = {};
    let restoredMarkedForReview: Record<string, boolean> = {};
    let restoredAttempts: StudentMcqAttemptRecord[] = [];
    const existingSubmission = submissions.find((submission) => submission.assignmentId === assignment.id);
    if (existingSubmission?.content) {
      const parsedAttempts = parseStudentMcqAttemptHistory(existingSubmission.content)
        .filter((attempt) => attempt.resourceId === null || attempt.resourceId === nextResource.id)
        .sort((a, b) => {
          const left = new Date(a.submittedAt).getTime();
          const right = new Date(b.submittedAt).getTime();
          return left - right;
        });

      if (parsedAttempts.length > 0) {
        restoredAttempts = parsedAttempts;
        const latestAttempt = parsedAttempts[parsedAttempts.length - 1];
        restoredAnswers = latestAttempt.answersByQuestionId || {};
        restoredMarkedForReview = Object.fromEntries(
          latestAttempt.markedForReviewQuestionIds.map((questionId) => [questionId, true])
        );
      } else {
        const parsedAttemptsAny = parseStudentMcqAttemptHistory(existingSubmission.content);
        if (parsedAttemptsAny.length > 0) {
          restoredAttempts = parsedAttemptsAny;
          const latestAttempt = parsedAttemptsAny[parsedAttemptsAny.length - 1];
          restoredAnswers = latestAttempt.answersByQuestionId || {};
          restoredMarkedForReview = Object.fromEntries(
            latestAttempt.markedForReviewQuestionIds.map((questionId) => [questionId, true])
          );
        }
      }
    }

    setMcqAssignment(assignment);
    setMcqResourceId(nextResource.id);
    setMcqConfig(normalized);
    setMcqAnswers(restoredAnswers);
    setMcqMarkedForReview(restoredMarkedForReview);
    setMcqAttemptHistory(restoredAttempts);
    setMcqCursor(0);
    setMcqQuestionTiming({});
    mcqQuestionTimingRef.current = {};
    mcqQuestionEnteredAtMsRef.current = null;
    mcqActiveQuestionIdRef.current = null;
    setMcqSectionFilterId(ALL_MCQ_SECTIONS_VALUE);
    setMcqStarted(false);
    setMcqTimerDecision(isSimpleAssignment ? "untimed" : "timed");
    setMcqTimerMinutes(recommendedMinutes);
    setMcqTimerRunning(false);
    setMcqTimerEndAtMs(null);
    setMcqTimerRemainingMs(isSimpleAssignment ? 0 : recommendedMinutes * 60 * 1000);
    setMcqStartedAtMs(null);
    setIsMcqDialogOpen(true);
  };

  const activeMcqResources = mcqAssignment ? getMcqResourcesForAssignment(mcqAssignment) : [];
  const getMcqAssessmentTypeForResource = (resource: AssignmentResource | null | undefined): McqAssessmentType => {
    const normalized = resource?.mcqConfig ? normalizeStudentMcqConfig(resource.mcqConfig) : null;
    return normalized?.assessmentType || "mock-test";
  };
  const activeMcqResource = activeMcqResources.find((resource) => resource.id === mcqResourceId) || activeMcqResources[0] || null;
  const activeMcqSectionMap = new Map((mcqConfig?.sections || []).map((section) => [section.id, section.name]));
  const activeMcqTopicMap = new Map((mcqConfig?.topics || []).map((topic) => [topic.id, topic]));
  const activeMcqQuestionEntries = (mcqConfig?.questions || []).map((question, index) => ({ question, index }));
  const filteredMcqQuestionEntries = activeMcqQuestionEntries.filter(({ question }) =>
    mcqSectionFilterId === ALL_MCQ_SECTIONS_VALUE || question.sectionId === mcqSectionFilterId
  );
  const activeMcqQuestion = mcqConfig?.questions[mcqCursor] || null;
  const activeMcqTopic = activeMcqQuestion?.topicId
    ? activeMcqTopicMap.get(activeMcqQuestion.topicId) || null
    : null;
  const activeMcqSubtopic = activeMcqTopic && activeMcqQuestion?.subtopicId
    ? activeMcqTopic.subtopics.find((subtopic) => subtopic.id === activeMcqQuestion.subtopicId) || null
    : null;
  const activeMcqQuestionTiming = activeMcqQuestion
    ? mcqQuestionTiming[activeMcqQuestion.id] || createDefaultMcqQuestionTiming()
    : createDefaultMcqQuestionTiming();
  const activeMcqOptionLabels = activeMcqQuestion ? getMcqOptionLabels(activeMcqQuestion) : [];
  const activeMcqOptionGridClass = activeMcqOptionLabels.length <= 2
    ? "grid-cols-1 sm:grid-cols-2"
    : activeMcqOptionLabels.length <= 4
      ? "grid-cols-2"
      : "grid-cols-2 lg:grid-cols-3";
  const answeredQuestionIds = new Set(
    Object.entries(mcqAnswers)
      .filter(([, selected]) => Array.isArray(selected) && selected.length > 0)
      .map(([questionId]) => questionId)
  );
  const markedQuestionIds = new Set(
    Object.entries(mcqMarkedForReview)
      .filter(([, marked]) => Boolean(marked))
      .map(([questionId]) => questionId)
  );
  const mcqRecommendedTimeMinutes = Math.max(
    1,
    Number.isFinite(Number(mcqConfig?.recommendedTimeMinutes))
      ? Number(mcqConfig?.recommendedTimeMinutes)
      : Math.ceil(((mcqConfig?.questions || []).length || 1) * 1.8)
  );
  const mcqSectionBreakdown = (mcqConfig?.sections || []).map((section) => {
    const sectionQuestions = (mcqConfig?.questions || []).filter((question) => question.sectionId === section.id);
    const totalMarks = sectionQuestions.reduce((sum, question) => sum + Math.max(0, question.marks), 0);
    const totalNegative = sectionQuestions.reduce((sum, question) => {
      const negativeEnabled = question.negativeEnabled || question.negativeMarks > 0;
      return sum + (negativeEnabled ? Math.max(0, question.negativeMarks) : 0);
    }, 0);
    return {
      section,
      questionCount: sectionQuestions.length,
      totalMarks,
      totalNegative,
    };
  });
  const mcqAssessmentType = mcqConfig?.assessmentType || "mock-test";
  const isSimpleMcqAssessment = mcqAssessmentType === "simple-assignment";
  const mcqTypeShortLabel = getMcqAssessmentTypeShortLabel(mcqAssessmentType);
  const mcqAttemptActionLabel = getMcqAttemptActionLabel(mcqAssessmentType, mcqAttemptHistory.length > 0);
  const mcqStartActionLabel = mcqAttemptHistory.length > 0 ? mcqAttemptActionLabel : `Start ${mcqTypeShortLabel}`;

  const updateMcqQuestionTiming = (questionId: string, updater: (current: StudentMcqQuestionTiming) => StudentMcqQuestionTiming) => {
    const current = mcqQuestionTimingRef.current[questionId] || createDefaultMcqQuestionTiming();
    const next = updater(current);
    mcqQuestionTimingRef.current = {
      ...mcqQuestionTimingRef.current,
      [questionId]: next,
    };
    setMcqQuestionTiming(mcqQuestionTimingRef.current);
  };

  const flushCurrentMcqQuestionTiming = (nowMs = Date.now()) => {
    const questionId = mcqActiveQuestionIdRef.current;
    const enteredAtMs = mcqQuestionEnteredAtMsRef.current;
    if (!questionId || enteredAtMs === null) return;
    const viewedMs = Math.max(0, nowMs - enteredAtMs);
    if (viewedMs > 0) {
      updateMcqQuestionTiming(questionId, (current) => ({
        ...current,
        timeSpentMs: current.timeSpentMs + viewedMs,
        lastViewedAt: new Date(nowMs).toISOString(),
      }));
    }
    mcqQuestionEnteredAtMsRef.current = nowMs;
  };

  const handleMcqTemplateChange = (nextTemplateId: string) => {
    if (!mcqAssignment) return;
    const parsed = Number(nextTemplateId);
    if (!Number.isFinite(parsed)) return;
    loadMcqTemplateForAssignment(mcqAssignment, parsed);
  };

  useEffect(() => {
    if (!mcqConfig) return;
    if (mcqSectionFilterId === ALL_MCQ_SECTIONS_VALUE) return;
    const sectionExists = mcqConfig.sections.some((section) => section.id === mcqSectionFilterId);
    if (!sectionExists) {
      setMcqSectionFilterId(ALL_MCQ_SECTIONS_VALUE);
    }
  }, [mcqConfig, mcqSectionFilterId]);

  useEffect(() => {
    if (!filteredMcqQuestionEntries.length) return;
    const activeInFilter = filteredMcqQuestionEntries.some(({ index }) => index === mcqCursor);
    if (!activeInFilter) {
      setMcqCursor(filteredMcqQuestionEntries[0].index);
    }
  }, [filteredMcqQuestionEntries, mcqCursor]);

  const toggleMcqAnswer = (question: StudentMcqQuestion, optionLabel: string) => {
    setMcqAnswers((prev) => {
      const current = prev[question.id] || [];
      if (question.type === "single") {
        return { ...prev, [question.id]: [optionLabel] };
      }
      const exists = current.includes(optionLabel);
      const next = exists ? current.filter((value) => value !== optionLabel) : [...current, optionLabel];
      return { ...prev, [question.id]: next };
    });
    updateMcqQuestionTiming(question.id, (current) => ({
      ...current,
      lastAnsweredAt: new Date().toISOString(),
    }));
  };

  const toggleMcqReview = (questionId: string) => {
    setMcqMarkedForReview((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const mcqAttemptSummary = (() => {
    if (!mcqConfig) {
      return { answeredCount: 0, totalQuestions: 0, maxScore: 0 };
    }
    let maxScore = 0;
    let answeredCount = 0;
    mcqConfig.questions.forEach((question) => {
      const answers = mcqAnswers[question.id] || [];
      if (answers.length > 0) answeredCount += 1;
      maxScore += Math.max(0, question.marks);
    });
    return {
      answeredCount,
      totalQuestions: mcqConfig.questions.length,
      maxScore,
    };
  })();

  const getMcqAttemptCountForResource = (submission: Submission | null | undefined, resourceId?: number | null) => {
    if (!submission?.content) return 0;
    const attempts = parseStudentMcqAttemptHistory(submission.content);
    if (!resourceId) return attempts.length;
    const resourceAttempts = attempts.filter((attempt) => attempt.resourceId === null || attempt.resourceId === resourceId);
    return resourceAttempts.length;
  };

  const getMcqActionLabelForResource = (
    assessmentType: McqAssessmentType,
    submission: Submission | null | undefined,
    resourceId?: number | null
  ) => getMcqAttemptActionLabel(assessmentType, getMcqAttemptCountForResource(submission, resourceId) > 0);

  useEffect(() => {
    if (!mcqStarted || !activeMcqQuestion) return;
    const nowMs = Date.now();
    const nextQuestionId = activeMcqQuestion.id;
    const previousQuestionId = mcqActiveQuestionIdRef.current;

    if (previousQuestionId && previousQuestionId !== nextQuestionId) {
      flushCurrentMcqQuestionTiming(nowMs);
    }

    if (previousQuestionId !== nextQuestionId) {
      updateMcqQuestionTiming(nextQuestionId, (current) => ({
        ...current,
        visitCount: current.visitCount + 1,
        firstViewedAt: current.firstViewedAt || new Date(nowMs).toISOString(),
        lastViewedAt: new Date(nowMs).toISOString(),
      }));
      mcqActiveQuestionIdRef.current = nextQuestionId;
      mcqQuestionEnteredAtMsRef.current = nowMs;
    }
  }, [mcqStarted, activeMcqQuestion]);

  // Early return for authentication loading
  if (authLoading && !authTimedOut) {
    return <DashboardLoadingSkeleton role="student" tab={activeTab} />;
  }

  if (authLoading && authTimedOut) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">Authentication is taking too long.</div>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!authUser) {
    return null;
  }

  const startMcqAttempt = () => {
    if (!mcqConfig) return;
    const effectiveTimerDecision = mcqConfig.assessmentType === "mock-test" ? "timed" : "untimed";
    if (mcqConfig.assessmentType === "mock-test") {
      setMcqAnswers({});
      setMcqMarkedForReview({});
    }

    const now = Date.now();
    clearMcqTimerInterval();
    setMcqQuestionTiming({});
    mcqQuestionTimingRef.current = {};
    mcqActiveQuestionIdRef.current = null;
    mcqQuestionEnteredAtMsRef.current = null;
    setMcqStarted(true);
    setMcqStartedAtMs(now);
    setMcqCursor(0);
    if (effectiveTimerDecision === "timed") {
      const boundedMinutes = Math.max(1, Math.min(600, Number(mcqRecommendedTimeMinutes) || 1));
      const remainingMs = boundedMinutes * 60 * 1000;
      const endAt = now + remainingMs;
      setMcqTimerDecision("timed");
      setMcqTimerMinutes(boundedMinutes);
      setMcqTimerRemainingMs(remainingMs);
      setMcqTimerEndAtMs(endAt);
      setMcqTimerRunning(true);
      mcqTimerIntervalRef.current = window.setInterval(() => {
        const remaining = Math.max(0, endAt - Date.now());
        setMcqTimerRemainingMs(remaining);
        if (remaining <= 0) {
          clearMcqTimerInterval();
          setMcqTimerRunning(false);
          setMcqTimerEndAtMs(null);
          void submitMcqAttempt({ autoSubmit: true });
        }
      }, 500);
    } else {
      setMcqTimerDecision("untimed");
      setMcqTimerRunning(false);
      setMcqTimerEndAtMs(null);
      setMcqTimerRemainingMs(0);
    }
  };

  const submitMcqAttempt = async (options?: { autoSubmit?: boolean }) => {
    if (!student || !mcqAssignment || !mcqConfig || !activeMcqResource) return;
    if (isMcqSubmitting) return;
    const existingSubmission = submissions.find((item) => item.assignmentId === mcqAssignment.id);
    const shouldResubmit = Boolean(existingSubmission);
    const isMockTest = mcqConfig.assessmentType === "mock-test";
    const isTimedMode = isMockTest && mcqTimerDecision === "timed";

    if (existingSubmission) {
      if (!isMockTest && !canResubmit(existingSubmission)) {
        toast({
          variant: "destructive",
          title: "Cannot submit attempt",
          description: "This assignment cannot be updated right now.",
        });
        return;
      }

      const deadlinePassed = isDeadlinePassed(mcqAssignment.dueDate);
      const allowLate = Boolean(mcqAssignment.allowLateSubmission);
      if (isMockTest && deadlinePassed && !allowLate) {
        toast({
          variant: "destructive",
          title: "Cannot submit attempt",
          description: "This mock test is closed for new attempts.",
        });
        return;
      }
    }

    setIsMcqSubmitting(true);
    clearMcqTimerInterval();
    setMcqTimerRunning(false);
    setMcqTimerEndAtMs(null);
    try {
      const nowMs = Date.now();
      flushCurrentMcqQuestionTiming(nowMs);
      const submittedAt = new Date(nowMs).toISOString();
      const currentAnswers = Object.fromEntries(
        mcqConfig.questions.map((question) => [question.id, (mcqAnswers[question.id] || []).map((value) => String(value))])
      );
      const attemptNumber = mcqAttemptHistory.length + 1;
      const startedAt = mcqStartedAtMs ? new Date(mcqStartedAtMs).toISOString() : submittedAt;
      const markedForReviewQuestionIds = Object.entries(mcqMarkedForReview)
        .filter(([, marked]) => Boolean(marked))
        .map(([questionId]) => questionId);
      const attemptRecord: StudentMcqAttemptRecord = {
        attemptId: `${mcqAssignment.id}-${activeMcqResource.id}-${nowMs}`,
        attemptNumber,
        resourceId: activeMcqResource.id,
        startedAt,
        submittedAt,
          timerMode: isTimedMode ? "timed" : "untimed",
          recommendedMinutes: mcqRecommendedTimeMinutes,
          chosenMinutes: isTimedMode ? mcqTimerMinutes : null,
          elapsedMs: Math.max(0, mcqStartedAtMs ? nowMs - mcqStartedAtMs : 0),
          markedForReviewQuestionIds,
        summary: mcqAttemptSummary,
        answersByQuestionId: currentAnswers,
          questions: mcqConfig.questions.map((question, index) => ({
            questionId: question.id,
            questionNo: formatMcqQuestionNumber(index, mcqConfig.numberingStyle),
            type: question.type,
            marks: question.marks,
            negativeMarks: question.negativeMarks,
            partialMarkingEnabled: question.partialMarkingEnabled,
            selectedAnswers: currentAnswers[question.id] || [],
            timeSpentMs: mcqQuestionTimingRef.current[question.id]?.timeSpentMs || 0,
            visitCount: mcqQuestionTimingRef.current[question.id]?.visitCount || 0,
            firstViewedAt: mcqQuestionTimingRef.current[question.id]?.firstViewedAt || null,
            lastViewedAt: mcqQuestionTimingRef.current[question.id]?.lastViewedAt || null,
            lastAnsweredAt: mcqQuestionTimingRef.current[question.id]?.lastAnsweredAt || null,
          })),
        };
      const nextAttemptHistory = [...mcqAttemptHistory, attemptRecord];

      const payload = {
        studentEmail: student.email,
        assignmentId: mcqAssignment.id,
        content: JSON.stringify({
          submissionType: "mcq_test_attempt",
          assignmentId: mcqAssignment.id,
          resourceId: activeMcqResource.id,
          testTitle: activeMcqResource.title,
          submittedAt,
          startedAt,
          latestAttemptNumber: attemptNumber,
          attemptPolicy: {
            mode: "last_before_due_date_or_latest",
            dueDate: mcqAssignment.dueDateIso || mcqAssignment.dueDate || null,
            dueDateTimezone: mcqAssignment.dueDateTimezone || null,
          },
          summary: mcqAttemptSummary,
          numberingStyle: mcqConfig.numberingStyle,
          assessmentType: mcqConfig.assessmentType,
          timerMode: isTimedMode ? "timed" : "untimed",
          timerMinutes: isTimedMode ? mcqTimerMinutes : null,
          elapsedMs: attemptRecord.elapsedMs,
          autoSubmitted: Boolean(options?.autoSubmit),
          answersByQuestionId: currentAnswers,
          questions: attemptRecord.questions,
          attempts: nextAttemptHistory,
        }, null, 2),
        fileUrl: null,
        fileName: null,
        fileSize: null,
      };

      const response = await fetch('/api/student/submissions', {
        method: shouldResubmit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Unable to submit MCQ + PDF attempt.");
      }

      await fetchData();
      closeMcqDialog();

      toast({
        title: options?.autoSubmit ? "Time up: test submitted" : shouldResubmit ? "Attempt submitted" : "Assignment submitted",
        description: options?.autoSubmit
          ? "Your timer ended, so your latest answers were submitted automatically."
          : shouldResubmit
            ? "Your latest MCQ attempt has been submitted."
            : "Your MCQ assignment attempt has been submitted successfully.",
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit test.";
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: message,
      });
    } finally {
      setIsMcqSubmitting(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "text-slate-900";
    if (percentage >= 60) return "text-slate-700";
    return "text-slate-500";
  };

  const tabMeta: Record<string, { title: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
    overview: {
      title: "Overview",
      description: "Snapshot of your assignments, grades, and upcoming work.",
      icon: Home,
    },
    assignments: {
      title: "Assignments",
      description: "Track deadlines and submit coursework with clarity.",
      icon: FileText,
    },
    submissions: {
      title: "Submissions",
      description: "Review your delivered work and teacher feedback.",
      icon: Upload,
    },
    grades: {
      title: "Grades",
      description: "Monitor academic performance across all subjects.",
      icon: Trophy,
    },
    schedule: {
      title: "Schedule",
      description: "Manage upcoming sessions and key academic events.",
      icon: Calendar,
    },
    progress: {
      title: "Progress",
      description: "Follow your completion trends and progress reports.",
      icon: BarChart3,
    },
    resources: {
      title: "Resources",
      description: "Access materials shared by your teachers.",
      icon: BookOpen,
    },
    messages: {
      title: "Messages",
      description: "Stay connected with mentors and instructors.",
      icon: MessageCircle,
    },
  };

  const currentTabMeta = tabMeta[activeTab] || tabMeta.overview;
  const submissionsByAssignmentId = new Map(submissions.map((submission) => [submission.assignmentId, submission]));
  const gradedSubmissions = submissions.filter((submission) => submission.grade !== null && submission.grade !== undefined);
  const openAssignmentsCount = assignments.filter((assignment) => {
    const existingSubmission = submissionsByAssignmentId.get(assignment.id);
    if (existingSubmission) return false;
    if (!isDeadlinePassed(assignment.dueDate)) return true;
    return Boolean(assignment.allowLateSubmission);
  }).length;
  const pendingAssignmentsCount = assignments.filter((assignment) => !submissionsByAssignmentId.has(assignment.id)).length;
  const averageGradePercent = gradedSubmissions.length > 0
    ? Math.round(
      clampPercentage(
        gradedSubmissions.reduce((sum, submission) => {
          const total = submission.totalPoints > 0 ? submission.totalPoints : 0;
          if (total === 0) return sum;
          return sum + ((submission.grade || 0) / total) * 100;
        }, 0) / gradedSubmissions.length
      )
    )
    : 0;
  const gradedSubmissionPercentage = submissions.length > 0
    ? Math.round(clampPercentage((gradedSubmissions.length / submissions.length) * 100))
    : 0;

  const scheduleTimelineEvents: TimelineEvent[] = scheduleEvents
    .map((event) => {
      const when = normalizeTimelineDate(event);
      if (!when) return null;
      return {
        id: `schedule-${event.id}`,
        title: event.title?.trim() || "Scheduled Class",
        when,
        typeLabel: event.subject?.trim() || "Class",
      };
    })
    .filter((item): item is TimelineEvent => {
      if (!item) return false;
      const isUpcoming = item.when.getTime() >= Date.now();
      return isUpcoming;
    });

  const assignmentTimelineEvents: TimelineEvent[] = assignments
    .filter((assignment) => !submissionsByAssignmentId.has(assignment.id))
    .map((assignment) => ({
      id: `assignment-${assignment.id}`,
      title: assignment.title,
      when: getDueDateDeadline(assignment.dueDate),
      typeLabel: "Assignment",
    }))
    .filter((item) => !Number.isNaN(item.when.getTime()) && item.when.getTime() >= Date.now());

  const upcomingTimeline = [...scheduleTimelineEvents, ...assignmentTimelineEvents]
    .sort((a, b) => a.when.getTime() - b.when.getTime())
    .slice(0, 5);

  const quickMetrics = [
    { label: "Open Assignments", value: openAssignmentsCount, icon: FileText },
    { label: "Pending", value: pendingAssignmentsCount, icon: Clock },
    { label: "Graded", value: gradedSubmissions.length, icon: Trophy },
    { label: "Unread Messages", value: messageUnreadCount, icon: MessageCircle },
  ];
  const isActiveTabLoading = tabLoadingState[activeTab];
  const renderActiveTabWireframe = () => (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <ShimmerSkeleton className="h-6 w-52 rounded-md" />
        <ShimmerSkeleton className="h-4 w-80 rounded-md" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ShimmerSkeleton key={`student-tab-wireframe-${index}`} className="h-14 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
  const detailAssignment = expandedAssignmentId
    ? assignments.find((assignment) => assignment.id === expandedAssignmentId) || null
    : null;
  const detailSubmission = detailAssignment
    ? submissions.find((submission) => submission.assignmentId === detailAssignment.id) || null
    : null;
  const detailDeadlinePassed = detailAssignment ? isDeadlinePassed(detailAssignment.dueDate) : true;
  const detailCanResubmit =
    !!detailAssignment &&
    !!detailSubmission &&
    (!detailDeadlinePassed || Boolean(detailAssignment.allowLateSubmission)) &&
    detailSubmission.grade === null;
  const detailMcqResources = detailAssignment ? getMcqResourcesForAssignment(detailAssignment) : [];
  const detailHasMcqResources = detailMcqResources.length > 0;
  const detailSingleMcqResource = detailMcqResources.length === 1 ? detailMcqResources[0] : null;
  const detailPrimaryMcqType = getMcqAssessmentTypeForResource(detailSingleMcqResource || detailMcqResources[0] || null);
  const detailDescription = cleanStudentVisibleText(detailAssignment?.description || "");
  const detailCanStartMcq = !!detailAssignment && detailHasMcqResources && (!detailDeadlinePassed || Boolean(detailAssignment.allowLateSubmission));

  if (loading) {
    return <DashboardLoadingSkeleton role="student" tab={activeTab} />;
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">Error: {error}</div>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!student) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-600 text-xl">Student not found</div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-100">
        <Sidebar variant="inset" className="border-r border-slate-200/80 bg-white/90 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/80 bg-white p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-slate-300">
                <AvatarFallback className="bg-slate-900 text-white font-semibold">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {student.name}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  {student.grade} • {student.schoolName}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.slice(0, 4).map((item) => {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={item.isActive}
                          onClick={item.onClick}
                          className={cn(
                            "w-full rounded-md transition-colors hover:bg-slate-100",
                            item.isActive && "bg-slate-900 text-white font-medium"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge>
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>Academic Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.slice(4, 7).map((item) => {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={item.isActive}
                          onClick={item.onClick}
                          className={cn(
                            "w-full rounded-md transition-colors hover:bg-slate-100",
                            item.isActive && "bg-slate-900 text-white font-medium"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge>
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>Communication</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.slice(7).map((item) => {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={item.isActive}
                          onClick={item.onClick}
                          className={cn(
                            "w-full rounded-md transition-colors hover:bg-slate-100",
                            item.isActive && "bg-slate-900 text-white font-medium"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge>
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Logout failed:', error);
                      window.location.href = '/';
                    }
                  }}
                  className="rounded-md text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="flex min-h-16 items-center gap-2 px-4 md:px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-slate-900">
                  Student Dashboard
                </h1>
              </div>
              <Badge variant="outline" className="hidden md:inline-flex border-slate-300 bg-slate-100 text-slate-700">
                {currentTabMeta.title}
              </Badge>
              <Button type="button" variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {messageUnreadCount > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`dashboard-tab-loading-${index}`} className="rounded-xl border bg-white p-4 space-y-3">
                      <ShimmerSkeleton className="h-5 w-2/3" />
                      <ShimmerSkeleton className="h-4 w-full" />
                      <ShimmerSkeleton className="h-4 w-5/6" />
                      <ShimmerSkeleton className="h-32 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="border border-slate-200/80 bg-white shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                        <currentTabMeta.icon className="h-5 w-5 text-slate-700" />
                        {currentTabMeta.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-600">
                        {currentTabMeta.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {quickMetrics.map((metric) => (
                        <div key={metric.label} className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.label}</p>
                            <metric.icon className="h-4 w-4 text-slate-600" />
                          </div>
                          <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {isActiveTabLoading ? (
                  renderActiveTabWireframe()
                ) : (
                  <>
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: -14 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-2xl border border-slate-300 bg-slate-900 p-6 text-white shadow-sm"
                    >
                      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10" />
                      <div className="absolute -bottom-10 right-20 h-24 w-24 rounded-full bg-white/5" />
                      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-semibold">Welcome back, {student.name.split(" ")[0]}</h2>
                          <p className="mt-1 text-sm text-white/85">
                            Keep momentum today. Review priorities, complete pending work, and track your progress.
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
                          onClick={() => setActiveTab("assignments")}
                        >
                          <ChevronRight className="mr-2 h-4 w-4" />
                          Go to Assignments
                        </Button>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {[
                        {
                          label: "Open Assignments",
                          value: openAssignmentsCount,
                          helper: "Needs submission",
                          icon: FileText,
                        },
                        {
                          label: "Completed",
                          value: gradedSubmissions.length,
                          helper: "Already graded",
                          icon: CheckCircle,
                        },
                        {
                          label: "Average Grade",
                          value: gradedSubmissions.length > 0
                            ? `${averageGradePercent}%`
                            : "N/A",
                          helper: "Across graded work",
                          icon: TrendingUp,
                        },
                        {
                          label: "Pending Review",
                          value: submissions.filter((submission) => submission.grade === null || submission.grade === undefined).length,
                          helper: "Awaiting teacher feedback",
                          icon: Clock,
                        },
                      ].map((item) => (
                        <Card key={item.label} className="border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
                                <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
                              </div>
                              <div className="rounded-xl border border-slate-300 bg-slate-100 p-2.5">
                                <item.icon className="h-5 w-5 text-slate-700" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                      <Card className="xl:col-span-3 border border-slate-200 bg-white shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-slate-900">Recent Assignments</CardTitle>
                          <CardDescription>Track latest coursework and due dates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {assignments.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                              No assignments available yet.
                            </div>
                          ) : (
                            assignments.slice(0, 5).map((assignment) => (
                              <div key={assignment.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">{assignment.title}</p>
                                  <p className="text-xs text-slate-500">{assignment.subject} • Due {formatDate(new Date(assignment.dueDate), getUserTimezone())}</p>
                                </div>
                                {getStatusBadge(assignment.status)}
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>

                      <Card className="xl:col-span-2 border border-slate-200 bg-white shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-slate-900">Upcoming Timeline</CardTitle>
                          <CardDescription>Upcoming classes and assignment deadlines.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {upcomingTimeline.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                              No upcoming classes or deadlines.
                            </div>
                          ) : (
                            upcomingTimeline.map((event) => (
                              <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {formatDateTime(event.when, getUserTimezone())}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700">
                                    {event.typeLabel}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setActiveTab("schedule")}
                          >
                            View Full Schedule
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeTab === "assignments" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-slate-900">
                        Assignment Workspace
                      </h2>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchData()}
                          disabled={loading}
                        >
                          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                          Refresh
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {assignments.map((assignment) => {
                        // Find if there's a submission for this assignment
                        const existingSubmission = submissions.find(s => s.assignmentId === assignment.id);
                        const parsedSubmissionSummary = existingSubmission
                          ? parseMcqSubmissionSummary(existingSubmission.content)
                          : null;
                        const gradeMaxPoints = parsedSubmissionSummary ? 100 : assignment.totalPoints;
                        const deadlinePassed = isDeadlinePassed(assignment.dueDate);
                        const acceptsLate = Boolean(assignment.allowLateSubmission);
                        const canResubmitAssignment = existingSubmission &&
                          (!deadlinePassed || acceptsLate) &&
                          existingSubmission.grade === null;
                        const mcqResources = getMcqResourcesForAssignment(assignment);
                        const hasMcqResources = mcqResources.length > 0;
                        const primaryMcqType = getMcqAssessmentTypeForResource(mcqResources[0]);
                        const primaryMcqResource = mcqResources[0] || null;
                        const canStartMcqAttempt = hasMcqResources && (!deadlinePassed || acceptsLate);
                        const assignmentDescription = cleanStudentVisibleText(assignment.description);

                        return (
                          <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -2 }}
                          >
                            <Card className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <button
                                      type="button"
                                      className="mb-2 flex w-full items-center gap-3 text-left"
                                      onClick={() => setExpandedAssignmentId(assignment.id)}
                                    >
                                      <h3 className="text-lg font-semibold">{assignment.title}</h3>
                                      {existingSubmission ? getStatusBadge(existingSubmission.status) : getStatusBadge("pending")}
                                      <span className="ml-auto text-xs text-slate-500">
                                        Click for details
                                      </span>
                                    </button>
                                    {assignmentDescription && (
                                      <p className="text-gray-600 mb-3">{assignmentDescription}</p>
                                    )}

                                    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                      <BookOpen className="h-4 w-4 text-slate-500" />
                                      <span>
                                        {(assignment.resources || []).length} resource{(assignment.resources || []).length !== 1 ? 's' : ''} linked
                                      </span>
                                      {hasMcqResources && (
                                        <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700">
                                          {getMcqAssessmentTypeLabel(primaryMcqType)} ready
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                      <span className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        {assignment.subject}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Due: {formatDate(new Date(assignment.dueDate), getUserTimezone())}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        {assignment.totalPoints} points
                                      </span>
                                    </div>

                                    {/* Deadline status indicator */}
                                    <div className="flex items-center gap-2 text-sm">
                                      {deadlinePassed ? (
                                        acceptsLate ? (
                                          <span className="flex items-center gap-1 text-amber-700">
                                            <AlertCircle className="h-4 w-4" />
                                            Deadline passed, late attempts allowed
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1 text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            Deadline passed
                                          </span>
                                        )
                                      ) : (
                                        <span className="flex items-center gap-1 text-slate-700">
                                          <CheckCircle className="h-4 w-4" />
                                          Still accepting submissions
                                        </span>
                                      )}

                                      {existingSubmission && (
                                        <span className="text-gray-500">
                                          • Submitted on {formatDateTime(new Date(existingSubmission.submittedAt), getUserTimezone())}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                      onClick={() => setExpandedAssignmentId(assignment.id)}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>

                                    {canStartMcqAttempt && primaryMcqResource && (
                                      <Button
                                        className="bg-brand-blue text-white hover:bg-brand-blue/90"
                                        onClick={() => loadMcqTemplateForAssignment(assignment, primaryMcqResource.id)}
                                      >
                                        <Target className="h-4 w-4 mr-2" />
                                        {getMcqActionLabelForResource(primaryMcqType, existingSubmission, primaryMcqResource.id)}
                                      </Button>
                                    )}

                                    {/* Submit button for new written assignments */}
                                    {!hasMcqResources && !existingSubmission && (!deadlinePassed || acceptsLate) && (
                                      <Dialog
                                        open={isSubmitDialogOpen && selectedAssignment?.id === assignment.id && !isResubmitting}
                                        onOpenChange={(nextOpen) => handleAssignmentDialogOpenChange(nextOpen, "submit")}
                                      >
                                        <DialogTrigger asChild>
                                          <Button
                                            onClick={() => {
                                              openAssignmentDialog(assignment, "submit");
                                            }}
                                            className="bg-brand-blue text-white hover:bg-brand-blue/90"
                                          >
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit Assignment
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                          <DialogHeader>
                                            <DialogTitle>Submit Assignment: {selectedAssignment?.title}</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="submission">Written Response</Label>
                                              <Textarea
                                                id="submission"
                                                placeholder="Enter your assignment response here..."
                                                value={submissionText}
                                                onChange={(e) => setSubmissionText(e.target.value)}
                                                rows={6}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="file">File Upload (Optional)</Label>
                                              <Input
                                                id="file"
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                                                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                              />
                                              <p className="text-xs text-gray-500">
                                                Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
                                              </p>
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button
                                              onClick={handleSubmission}
                                              disabled={isSubmitting || (!submissionText.trim() && !submissionFile)}
                                            >
                                              {isSubmitting ? (
                                                <>
                                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                  Submitting...
                                                </>
                                              ) : (
                                                <>
                                                  <Send className="h-4 w-4 mr-2" />
                                                  Submit Assignment
                                                </>
                                              )}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    )}

                                    {/* Resubmit button for submitted assignments */}
                                    {!hasMcqResources && canResubmitAssignment && (
                                      <Dialog
                                        open={isResubmitDialogOpen && selectedAssignment?.id === assignment.id && isResubmitting}
                                        onOpenChange={(nextOpen) => handleAssignmentDialogOpenChange(nextOpen, "resubmit")}
                                      >
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              openAssignmentDialog(assignment, "resubmit", {
                                                initialText: existingSubmission.content || "",
                                                submissionId: existingSubmission.id,
                                              });
                                            }}
                                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                          >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Resubmit
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                          <DialogHeader>
                                            <DialogTitle>Resubmit Assignment: {selectedAssignment?.title}</DialogTitle>
                                            <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg mt-2">
                                              Your previous submission will be replaced with this new one.
                                            </p>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="resubmission">Updated Response</Label>
                                              <Textarea
                                                id="resubmission"
                                                placeholder="Enter your updated assignment response here..."
                                                value={submissionText}
                                                onChange={(e) => setSubmissionText(e.target.value)}
                                                rows={6}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="resubmit-file">File Upload (Optional)</Label>
                                              <Input
                                                id="resubmit-file"
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                                                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                              />
                                              <p className="text-xs text-gray-500">
                                                Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
                                              </p>
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button
                                              onClick={handleSubmission}
                                              disabled={isSubmitting || (!submissionText.trim() && !submissionFile)}
                                            >
                                              {isSubmitting ? (
                                                <>
                                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                  Resubmitting...
                                                </>
                                              ) : (
                                                <>
                                                  <RefreshCw className="h-4 w-4 mr-2" />
                                                  Resubmit Assignment
                                                </>
                                              )}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    )}

                                    {/* Status indicators for completed/graded submissions */}
                                    {existingSubmission && existingSubmission.grade !== null && existingSubmission.grade !== undefined && (
                                      <div className="text-center">
                                        <Badge variant="secondary" className="bg-slate-200 text-slate-800">
                                          <Trophy className="h-3 w-3 mr-1" />
                                          Graded: {existingSubmission.grade}/{gradeMaxPoints}
                                        </Badge>
                                      </div>
                                    )}

                                    {deadlinePassed && existingSubmission && (existingSubmission.grade === null || existingSubmission.grade === undefined) && (
                                      <div className="text-center">
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Awaiting Grade
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>

                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "submissions" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-slate-900">
                        Submission History
                      </h2>
                    </div>

                    <div className="grid gap-4">
                      {submissions.map((submission) => {
                        const assignment = assignments.find(a => a.id === submission.assignmentId);
                        const submittedAfterDeadline = assignment
                          ? wasSubmittedAfterDeadline(submission.submittedAt, assignment.dueDate)
                          : false;
                        const parsedMcqSubmission = parseMcqSubmissionSummary(submission.content);
                        const gradeMaxPoints = parsedMcqSubmission ? 100 : (assignment?.totalPoints || submission.totalPoints || 0);

                        return (
                          <motion.div
                            key={submission.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -2 }}
                          >
                            <Card className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{submission.assignmentTitle}</h3>
                                    <p className="text-sm text-gray-600">
                                      Submitted on {formatDateTime(new Date(submission.submittedAt), getUserTimezone())}
                                    </p>
                                    {assignment && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        Due: {formatDate(new Date(assignment.dueDate), getUserTimezone())}
                                        {submittedAfterDeadline && <span className="text-red-500 ml-2">(Submitted after deadline)</span>}
                                        {!submittedAfterDeadline && <span className="text-slate-500 ml-2">(Submitted on time)</span>}
                                      </p>
                                    )}
                                    {assignment && (
                                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                        <span className="flex items-center gap-1">
                                          <BookOpen className="h-4 w-4" />
                                          {assignment.subject}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Star className="h-4 w-4" />
                                          {assignment.totalPoints} points
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <RefreshCw className="h-4 w-4" />
                                          Submission #{submission.id}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(submission.status)}
                                  </div>
                                </div>

                                {/* Submission Content */}
                                {submission.content && (
                                  <div className="mb-4">
                                    {parsedMcqSubmission ? (
                                      <>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">MCQ Attempt Summary:</h4>
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                                          <p className="text-sm font-semibold text-slate-900">{parsedMcqSubmission.testTitle}</p>
                                          <p className="mt-1 text-sm text-slate-700">
                                            {parsedMcqSubmission.answeredCount}/{parsedMcqSubmission.totalQuestions} answered
                                          </p>
                                          <p className="text-xs text-slate-600">Maximum score: {parsedMcqSubmission.maxScore}</p>
                                          <p className="text-xs text-slate-600">Attempts: {parsedMcqSubmission.attemptCount} ({parsedMcqSubmission.latestAttemptLabel})</p>
                                          {parsedMcqSubmission.isConfirmedReport && (
                                            <div className="mt-3 flex items-center justify-end gap-3">
                                              <Button
                                                size="sm"
                                                className="bg-slate-900 text-white hover:bg-slate-800"
                                                onClick={() => window.open(`/student-dashboard/report/${submission.id}`, "_blank")}
                                              >
                                                Open PDF Report
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Written Response:</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{submission.content}</p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}

                                {/* File Attachment */}
                                {submission.fileUrl && submission.fileName && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">File Attachment:</h4>
                                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 bg-slate-200 rounded-lg">
                                            <FileText className="h-5 w-5 text-slate-700" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-slate-900">{submission.fileName}</p>
                                            {submission.fileSize && (
                                              <p className="text-xs text-slate-600">
                                                {(submission.fileSize / 1024 / 1024).toFixed(2)} MB
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(submission.fileUrl, '_blank')}
                                          >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              const link = document.createElement('a');
                                              if (submission.fileUrl) {
                                                link.href = submission.fileUrl;
                                                link.download = submission.fileName ?? "download";
                                                link.click();
                                              }
                                            }}
                                          >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Grade Display */}
                                {submission.grade !== null && submission.grade !== undefined && assignment && (
                                  <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm text-gray-600">Grade:</span>
                                      <span className={cn("text-lg font-bold", getGradeColor(calculateGradePercentage(submission.grade, gradeMaxPoints)))}>
                                        {submission.grade}/{gradeMaxPoints} ({calculateGradePercentage(submission.grade, gradeMaxPoints)}%)
                                      </span>
                                    </div>
                                    <Progress
                                      value={calculateGradePercentage(submission.grade, gradeMaxPoints)}
                                      className="h-2"
                                    />
                                  </div>
                                )}

                                {/* Teacher feedback hidden in student dashboard */}

                                {/* Submission Status Info */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Submission ID: #{submission.id}</span>
                                    <span>
                                      {submission.grade !== null && submission.grade !== undefined ? 'Graded' : 'Awaiting Review'}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}

                      {submissions.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Card className="border border-slate-200 bg-white shadow-sm">
                            <CardContent className="p-12 text-center">
                              <FileText className="mx-auto mb-4 h-10 w-10 text-slate-400" />
                              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Submissions Yet</h3>
                              <p className="text-slate-600 mb-6 text-lg">
                                Start by submitting an assignment. Your completed work will appear here.
                              </p>
                              <Button
                                className="bg-brand-blue text-white hover:bg-brand-blue/90"
                                onClick={() => setActiveTab("assignments")}
                                size="lg"
                              >
                                <FileText className="h-5 w-5 mr-2" />
                                View Assignments
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "grades" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-slate-900">
                        Grades & Performance
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -2 }}
                      >
                        <Card className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-slate-900 text-lg">
                              <Trophy className="h-5 w-5 text-slate-700" />
                              Overall Performance
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center space-y-2">
                              <div className="text-3xl font-bold text-slate-900">
                                {gradedSubmissions.length > 0
                                  ? averageGradePercent >= 90 ? 'A'
                                    : averageGradePercent >= 80 ? 'B'
                                      : averageGradePercent >= 70 ? 'C'
                                        : averageGradePercent >= 60 ? 'D'
                                          : 'F'
                                  : 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Current Grade</div>
                              <Progress
                                value={averageGradePercent}
                                className={cn(
                                  "h-3",
                                  gradedSubmissions.length > 0 && averageGradePercent >= 80 && "[&>div]:bg-emerald-600",
                                  gradedSubmissions.length > 0 && averageGradePercent >= 60 && averageGradePercent < 80 && "[&>div]:bg-amber-500",
                                  gradedSubmissions.length > 0 && averageGradePercent < 60 && "[&>div]:bg-rose-500"
                                )}
                              />
                              <div className="text-xs text-gray-500">
                                {gradedSubmissions.length > 0 ? `${averageGradePercent}% Average` : 'No grades yet'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -2 }}
                      >
                        <Card className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-slate-900 text-lg">
                              <Target className="h-5 w-5 text-slate-700" />
                              Assignments Completed
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center space-y-2">
                              <div className="text-3xl font-bold text-slate-900">
                                {gradedSubmissions.length}/{submissions.length}
                              </div>
                              <div className="text-sm text-gray-600">Graded Assignments</div>
                              <Progress
                                value={gradedSubmissionPercentage}
                                className="h-3"
                              />
                              <div className="text-xs text-gray-500">
                                {gradedSubmissionPercentage}% Graded
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -2 }}
                      >
                        <Card className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-slate-900 text-lg">
                              <TrendingUp className="h-5 w-5 text-slate-700" />
                              Pending Assignments
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center space-y-2">
                              <div className="text-3xl font-bold text-slate-900">
                                {pendingAssignmentsCount}
                              </div>
                              <div className="text-sm text-gray-600">Due Soon</div>
                              <div className={cn(
                                "text-xs font-medium",
                                pendingAssignmentsCount > 0 ? "text-slate-700" : "text-slate-600"
                              )}>
                                {pendingAssignmentsCount > 0
                                  ? 'Action Required'
                                  : 'All Caught Up'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                        <CardHeader>
                          <CardTitle>Grade Breakdown by Subject</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {(() => {
                              // Group submissions by subject and calculate averages
                              const subjectGrades = submissions
                                .filter(s => s.grade !== null && s.grade !== undefined)
                                .reduce((acc, submission) => {
                                  const subject = submission.assignmentSubject || "Other";
                                  if (!acc[subject]) {
                                    acc[subject] = { total: 0, count: 0, totalPoints: 0, earnedPoints: 0 };
                                  }
                                  acc[subject].count += 1;
                                  acc[subject].earnedPoints += submission.grade || 0;
                                  acc[subject].totalPoints += submission.totalPoints || 100;
                                  acc[subject].total = acc[subject].totalPoints > 0
                                    ? Math.round((acc[subject].earnedPoints / acc[subject].totalPoints) * 100)
                                    : 0;
                                  return acc;
                                }, {} as Record<string, { total: number, count: number, totalPoints: number, earnedPoints: number }>);

                              const subjectArray = Object.entries(subjectGrades).map(([subject, data]) => ({
                                subject,
                                grade: data.total >= 90 ? 'A'
                                  : data.total >= 80 ? 'B'
                                    : data.total >= 70 ? 'C'
                                      : data.total >= 60 ? 'D'
                                        : 'F',
                                percentage: data.total,
                                assignments: data.count
                              }));

                              return subjectArray.length > 0 ? (
                                subjectArray.map((item) => (
                                  <div key={item.subject} className="flex items-center gap-4">
                                    <div className="w-32 text-sm font-medium truncate">{item.subject}</div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-600">{item.assignments} graded</span>
                                        <span className="text-sm font-medium">{item.grade} ({item.percentage}%)</span>
                                      </div>
                                      <Progress value={clampPercentage(item.percentage)} className="h-2" />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                  <p>No graded assignments yet</p>
                                </div>
                              );
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-slate-900">Schedule & Events</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchData()}
                        disabled={loading}
                      >
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Refresh
                      </Button>
                    </div>

                    {studentEmail && <StudentScheduleView studentEmail={studentEmail} />}
                  </div>
                )}

                {activeTab === "progress" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-slate-900">Academic Progress</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                          <CardTitle>Assignment Completion</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Group assignments by subject */}
                            {(() => {
                              // Group assignments by subject
                              const bySubject = assignments.reduce((acc, assignment) => {
                                const subject = assignment.subject || "Other";
                                if (!acc[subject]) {
                                  acc[subject] = { total: 0, completed: 0 };
                                }
                                acc[subject].total += 1;
                                // Count completed assignments
                                if (submissions.some(s => s.assignmentId === assignment.id && s.status === "graded")) {
                                  acc[subject].completed += 1;
                                }
                                return acc;
                              }, {} as Record<string, { total: number, completed: number }>);

                              // Convert to array for rendering
                              return Object.entries(bySubject).map(([subject, counts]) => (
                                <div key={subject} className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">{subject}</span>
                                    <span className="text-sm text-gray-600">
                                      {counts.completed}/{counts.total} completed
                                    </span>
                                  </div>
                                  <Progress
                                    value={clampPercentage(counts.total > 0 ? (counts.completed / counts.total) * 100 : 0)}
                                    className="h-2"
                                  />
                                  <div className="text-xs text-gray-500">
                                    {counts.total - counts.completed} remaining
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                          <CardTitle>Assignment Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {/* Assignment counts */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-100 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-slate-900">
                                  {submissions.length}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Submissions
                                </div>
                              </div>
                              <div className="bg-slate-100 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-slate-900">
                                  {submissions.filter(s => s.status === "graded").length}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Completed
                                </div>
                              </div>
                              <div className="bg-slate-100 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-slate-900">
                                  {assignments.filter(a =>
                                    !submissions.some(s => s.assignmentId === a.id)
                                  ).length}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Pending
                                </div>
                              </div>
                              <div className="bg-slate-100 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-slate-900">
                                  {assignments.length}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Total Assignments
                                </div>
                              </div>
                            </div>

                            {/* Activity summary */}
                            <div className="text-center pt-2 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Recent Activity
                              </p>
                              <p className="text-sm text-gray-600">
                                {(() => {
                                  if (submissions.length === 0) return "No submissions yet";
                                  const latestSubmission = submissions.reduce<Submission | null>((latest, current) => {
                                    if (!latest) return current;
                                    return new Date(current.submittedAt).getTime() > new Date(latest.submittedAt).getTime()
                                      ? current
                                      : latest;
                                  }, null);
                                  if (!latestSubmission) return "No submissions yet";
                                  return `Last submission: ${formatDate(new Date(latestSubmission.submittedAt), getUserTimezone())}`;
                                })()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-8">
                      <Card className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-6 w-6 text-slate-700" />
                            Evaluations & Progress Reports
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {loading ? (
                            <div className="space-y-3 py-2">
                              {Array.from({ length: 3 }).map((_, index) => (
                                <div key={`progress-loading-${index}`} className="rounded-lg border bg-white p-4 space-y-2">
                                  <ShimmerSkeleton className="h-4 w-1/2" />
                                  <ShimmerSkeleton className="h-3 w-full" />
                                  <ShimmerSkeleton className="h-3 w-5/6" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div className="mb-4 text-sm text-gray-600">
                                {progressReports.length > 0 
                                  ? `Showing ${progressReports.length} progress report${progressReports.length !== 1 ? 's' : ''}`
                                  : 'No progress reports published yet'}
                              </div>
                              <ProgressReportList reports={progressReports} />
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeTab === "resources" && (
                  <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-slate-900">Learning Resources</CardTitle>
                      <CardDescription>Personal and general resources shared by your teachers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResourceLibrary studentEmail={studentEmail} />
                    </CardContent>
                  </Card>
                )}

                {activeTab === "messages" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold text-slate-900">Messages</h2>
                    </div>

                    {/* Import and use our MentorMessages component */}
                    {student && (
                      <Card className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-slate-900">Mentor Inbox</CardTitle>
                          <CardDescription>Receive guidance and reply to your instructors.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <MentorMessages
                            studentId={student.id}
                            studentEmail={student.email}
                            studentName={student.name}
                            onUnreadCountChange={setMessageUnreadCount}
                          />
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
                  </>
                )}
              </motion.div>
            )}
          </div>
        </SidebarInset>
      </div>

      <Sheet
        open={Boolean(detailAssignment)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setExpandedAssignmentId(null);
          }
        }}
      >
        <SheetContent side="right" className="w-full border-l border-slate-200 bg-white p-0 sm:max-w-2xl">
          {!detailAssignment ? null : (
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b border-slate-200 px-5 py-4">
                <SheetTitle className="text-slate-900">{detailAssignment.title}</SheetTitle>
                <SheetDescription className="text-slate-600">
                  {detailAssignment.subject} • Due {formatDate(new Date(detailAssignment.dueDate), getUserTimezone())}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-800">Assignment Info</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Program: <span className="font-medium text-slate-700">{detailAssignment.program}</span> • Grade:
                    <span className="font-medium text-slate-700"> {detailAssignment.grade || "N/A"}</span> • Total points:
                    <span className="font-medium text-slate-700"> {detailAssignment.totalPoints}</span>
                  </p>
                  {detailDescription && (
                    <p className="mt-2 text-sm text-slate-700">{detailDescription}</p>
                  )}
                  {detailAssignment.instructions && (
                    <p className="mt-2 text-sm text-slate-700">
                      Instructions: {detailAssignment.instructions}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {detailSubmission ? getStatusBadge(detailSubmission.status) : getStatusBadge("pending")}
                  {detailDeadlinePassed ? (
                    detailAssignment.allowLateSubmission ? (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Late attempts allowed</Badge>
                    ) : (
                      <Badge variant="destructive">Deadline passed</Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700">Accepting submissions</Badge>
                  )}
                  {detailHasMcqResources && (
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                      {detailMcqResources.length === 1
                        ? `${getMcqAssessmentTypeLabel(detailPrimaryMcqType)} ready`
                        : "MCQ + PDF resources ready"}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!detailHasMcqResources && !detailSubmission && (!detailDeadlinePassed || Boolean(detailAssignment.allowLateSubmission)) && (
                    <Button
                      className="bg-brand-blue text-white hover:bg-brand-blue/90"
                      onClick={() => openAssignmentDialog(detailAssignment, "submit")}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Assignment
                    </Button>
                  )}
                  {!detailHasMcqResources && detailCanResubmit && detailSubmission && (
                    <Button
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      onClick={() =>
                        openAssignmentDialog(detailAssignment, "resubmit", {
                          initialText: detailSubmission.content || "",
                          submissionId: detailSubmission.id,
                        })
                      }
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resubmit
                    </Button>
                  )}
                  {detailSingleMcqResource && detailCanStartMcq && (
                    <Button
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      onClick={() => loadMcqTemplateForAssignment(detailAssignment, detailSingleMcqResource.id)}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      {getMcqActionLabelForResource(detailPrimaryMcqType, detailSubmission, detailSingleMcqResource.id)}
                    </Button>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-900">Linked Resources</p>
                  {(detailAssignment.resources || []).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      No resources attached to this assignment.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(detailAssignment.resources || []).map((resource) => {
                        const resourceConfig = resource.type === "mcq_template"
                          ? normalizeStudentMcqConfig(resource.mcqConfig)
                          : null;
                        const resourceAssessmentType = resourceConfig?.assessmentType || "mock-test";
                        const resourceTypeLabel = getMcqAssessmentTypeShortLabel(resourceAssessmentType);
                        const showMcqAttemptButton = detailMcqResources.length > 1;
                        const resourceSummary = getStudentResourceSummary(resource);
                        return (
                        <div key={resource.id} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{resource.title}</p>
                              <p className="text-xs text-slate-500">
                                {resource.type === "mcq_template" ? "MCQ + PDF" : resource.type}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {resource.isRequired && (
                                <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
                                  Required
                                </Badge>
                              )}
                              {resource.type === "mcq_template" && (
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                  MCQ + PDF • {resourceTypeLabel}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {resourceSummary && (
                            <p className="mt-2 text-xs text-slate-600">{resourceSummary}</p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            {resource.fileUrl && resource.type !== "mcq_template" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                onClick={() => window.open(resource.fileUrl || "", "_blank")}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Open PDF
                              </Button>
                            )}

                            {resource.linkUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                onClick={() => window.open(resource.linkUrl || "", "_blank")}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Open Link
                              </Button>
                            )}

                            {resource.type === "mcq_template" && showMcqAttemptButton && detailCanStartMcq && (
                              <Button
                                size="sm"
                                className="bg-slate-900 text-white hover:bg-slate-800"
                                onClick={() => loadMcqTemplateForAssignment(detailAssignment, resource.id)}
                              >
                                <Target className="h-4 w-4 mr-1" />
                                {getMcqActionLabelForResource(resourceAssessmentType, detailSubmission, resource.id)}
                              </Button>
                            )}
                          </div>
                        </div>
                      )})}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={isMcqDialogOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeMcqDialog();
            return;
          }
          setIsMcqDialogOpen(true);
        }}
      >
          <DialogContent
            className={cn(
              "flex h-[92dvh] max-w-[96vw] flex-col overflow-hidden p-0",
              isMcqDialogMaximized &&
                "inset-0 h-[100dvh] w-[100vw] max-h-none max-w-none translate-x-0 translate-y-0 rounded-none"
            )}
            onEscapeKeyDown={(event) => {
              if (!isMcqDialogMaximized) return;
              event.preventDefault();
              setIsMcqDialogMaximized(false);
            }}
          >
          <DialogHeader className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle>
                  {mcqAttemptActionLabel}: {mcqAssignment?.title || "Assignment"}
                </DialogTitle>
                <p className="text-xs text-slate-600">
                  {mcqAssignment?.subject} • {mcqAttemptSummary.totalQuestions} questions • Max marks {mcqAttemptSummary.maxScore}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setIsMcqDialogMaximized((prev) => !prev)}
                aria-label={isMcqDialogMaximized ? "Exit full screen" : "Enter full screen"}
                title={isMcqDialogMaximized ? "Exit full screen" : "Enter full screen"}
              >
                {isMcqDialogMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-4">
            {!mcqConfig ? (
              <div className="py-8 text-center text-sm text-slate-600">
                This assignment does not have a valid MCQ + PDF configuration.
              </div>
            ) : !mcqStarted ? (
              <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4 overflow-y-auto">
                <div className="flex flex-wrap items-center gap-2">
                  {activeMcqResources.length > 1 && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-slate-600">Template</Label>
                      <select
                        value={activeMcqResource?.id || ""}
                        onChange={(event) => handleMcqTemplateChange(event.target.value)}
                        className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900"
                      >
                        {activeMcqResources.map((resource) => (
                          <option key={resource.id} value={resource.id}>
                            {resource.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {activeMcqResource?.fileUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(activeMcqResource.fileUrl || "", "_blank")}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Open PDF
                    </Button>
                  )}
                  <Badge variant="outline" className="border-slate-300 text-slate-700">
                    {isSimpleMcqAssessment ? "Single attempt" : "Reattempts available"}
                  </Badge>
                  {!isSimpleMcqAssessment && (
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      Previous attempts: {mcqAttemptHistory.length}
                    </Badge>
                  )}
                </div>

                <Card className="border border-slate-200 bg-slate-50/70">
                  <CardContent className="space-y-4 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Before you start</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Read the assignment instructions, then {isSimpleMcqAssessment ? "start when ready." : "the mock test will begin with the configured timer."}{" "}
                        {isSimpleMcqAssessment
                          ? ""
                          : "Each mock-test attempt is saved separately. If a due date exists, your latest attempt submitted before the deadline is considered by default."}
                      </p>
                      {mcqAssignment?.instructions && (
                        <p className="mt-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                          {mcqAssignment.instructions}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {mcqSectionBreakdown.map((item) => (
                        <div key={item.section.id} className="rounded-md border border-slate-200 bg-white p-3">
                          <p className="text-sm font-semibold text-slate-900">{item.section.name}</p>
                          <p className="mt-1 text-xs text-slate-600">
                            {item.questionCount} questions • {item.totalMarks} marks
                            {item.totalNegative > 0 ? ` • Up to ${item.totalNegative} negative marks` : ""}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-900">{isSimpleMcqAssessment ? "Attempt mode" : "Timer"}</p>
                      {isSimpleMcqAssessment ? (
                        <p className="text-xs text-slate-600">Assignments run in untimed mode.</p>
                      ) : (
                        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                          This mock test starts with a fixed time limit of {mcqRecommendedTimeMinutes} minutes from Configure.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-auto flex justify-end">
                  <Button type="button" className="bg-brand-blue text-white hover:bg-brand-blue/90" onClick={startMcqAttempt}>
                    {mcqStartActionLabel}
                  </Button>
                </div>
              </div>
            ) : !activeMcqQuestion ? (
              <div className="py-8 text-center text-sm text-slate-600">
                No question found in this assignment.
              </div>
            ) : (
              <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                <Card className="flex min-h-0 flex-col border border-slate-200 bg-slate-50/70">
                  <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                    <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">PDF Workspace</p>
                      {activeMcqResource?.fileUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => window.open(activeMcqResource.fileUrl || "", "_blank")}
                        >
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          Open in new tab
                        </Button>
                      )}
                    </div>
                    {activeMcqResource?.fileUrl ? (
                      <iframe
                        title="Assignment PDF"
                        src={activeMcqResource.fileUrl}
                        className="h-full min-h-0 w-full"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-600">
                        Linked PDF is not available for this template.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex min-h-0 flex-col gap-3">
                  <Card className="border border-slate-200 bg-slate-50/70">
                    <CardContent className="flex flex-wrap items-center gap-2 p-3">
                      {mcqTimerDecision === "timed" ? (
                        <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                          Timer {formatDuration(mcqTimerRemainingMs)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                          Untimed
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                        {mcqAttemptSummary.answeredCount}/{mcqAttemptSummary.totalQuestions} answered
                      </Badge>
                      <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                        Attempt {mcqAttemptHistory.length + 1}
                      </Badge>
                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8"
                          disabled={mcqCursor === 0}
                          onClick={() => setMcqCursor((prev) => Math.max(0, prev - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8"
                          disabled={mcqCursor >= mcqConfig.questions.length - 1}
                          onClick={() => setMcqCursor((prev) => Math.min(mcqConfig.questions.length - 1, prev + 1))}
                        >
                          Next
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
                    <Card className="flex min-h-0 flex-col border border-slate-200 bg-slate-50/70">
                      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-base font-semibold text-slate-900">
                              Q {formatMcqQuestionNumber(mcqCursor, mcqConfig.numberingStyle)}
                            </p>
                            <p className="text-xs text-slate-600">
                              {activeMcqSectionMap.get(activeMcqQuestion.sectionId) || "Section"} •{" "}
                              {activeMcqQuestion.type === "single" ? "Single correct" : "Multiple correct"} •{" "}
                              {activeMcqQuestion.marks} marks
                              {activeMcqTopic
                                ? ` • ${activeMcqTopic.name}${activeMcqSubtopic ? ` / ${activeMcqSubtopic.name}` : ""}`
                                : ""}
                              {activeMcqQuestion.negativeEnabled || activeMcqQuestion.negativeMarks > 0
                                ? ` • -${activeMcqQuestion.negativeMarks} negative`
                                : ""}
                            </p>
                          </div>
                          <div className="flex flex-col items-stretch gap-2 sm:items-end">
                            <div className="grid gap-2 sm:grid-cols-2">
                              <label className="space-y-1">
                                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Section</span>
                                <select
                                  value={mcqSectionFilterId}
                                  onChange={(event) => setMcqSectionFilterId(event.target.value)}
                                  className="h-9 min-w-[170px] rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900"
                                >
                                  <option value={ALL_MCQ_SECTIONS_VALUE}>All sections</option>
                                  {(mcqConfig.sections || []).map((section) => (
                                    <option key={section.id} value={section.id}>
                                      {section.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="space-y-1">
                                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Question</span>
                                <select
                                  value={String(mcqCursor)}
                                  onChange={(event) => setMcqCursor(Number(event.target.value))}
                                  className="h-9 min-w-[190px] rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900"
                                  disabled={filteredMcqQuestionEntries.length === 0}
                                >
                                  {filteredMcqQuestionEntries.map(({ question, index }) => (
                                    <option key={question.id} value={index}>
                                      Q {formatMcqQuestionNumber(index, mcqConfig.numberingStyle)} - {activeMcqSectionMap.get(question.sectionId) || "Section"}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                                {activeMcqQuestion.type === "multiple" && activeMcqQuestion.partialMarkingEnabled ? "Partial marking on" : "Partial marking off"}
                              </Badge>
                              <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                                On this question {formatDuration(activeMcqQuestionTiming.timeSpentMs)}
                              </Badge>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => toggleMcqReview(activeMcqQuestion.id)}
                              >
                                {mcqMarkedForReview[activeMcqQuestion.id] ? "Unmark Review" : "Mark Review"}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className={cn("grid gap-2", activeMcqOptionGridClass)}>
                          {activeMcqOptionLabels.map((optionLabel) => {
                            const selected = (mcqAnswers[activeMcqQuestion.id] || []).includes(optionLabel);
                            return (
                              <button
                                type="button"
                                key={`${activeMcqQuestion.id}-${optionLabel}`}
                                onClick={() => toggleMcqAnswer(activeMcqQuestion, optionLabel)}
                                className={cn(
                                  "flex min-h-11 items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition",
                                  selected
                                    ? "border-slate-700 bg-slate-900 text-white"
                                    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                                )}
                              >
                                <span className="truncate">{optionLabel}</span>
                                {selected ? <CheckCircle className="h-4 w-4" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="flex min-h-0 flex-col border border-slate-200 bg-slate-50/70">
                      <CardContent className="flex min-h-0 flex-1 flex-col p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question Navigator</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Answered</span>
                          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />Not answered</span>
                          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Marked review</span>
                        </div>

                        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
                          <div className="grid grid-cols-4 gap-2 pr-1">
                            {filteredMcqQuestionEntries.map(({ question, index }) => {
                              const answered = answeredQuestionIds.has(question.id);
                              const marked = markedQuestionIds.has(question.id);
                              const isActive = index === mcqCursor;
                              const bgClass = marked
                                ? "bg-amber-400 text-slate-900"
                                : answered
                                  ? "bg-emerald-500 text-white"
                                  : "bg-red-500 text-white";
                              return (
                                <button
                                  type="button"
                                  key={question.id}
                                  onClick={() => setMcqCursor(index)}
                                  className={cn(
                                    "h-9 w-9 rounded-full border-2 text-xs font-semibold transition",
                                    bgClass,
                                    isActive ? "border-slate-900 ring-2 ring-slate-300" : "border-white opacity-90 hover:opacity-100"
                                  )}
                                >
                                  {formatMcqQuestionNumber(index, mcqConfig.numberingStyle)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-200 px-5 py-3">
            <Button type="button" variant="outline" onClick={closeMcqDialog}>
              Close
            </Button>
            {mcqStarted && (
              <Button
                type="button"
                onClick={() => submitMcqAttempt()}
                disabled={!mcqConfig || isMcqSubmitting}
                className="bg-brand-blue text-white hover:bg-brand-blue/90"
              >
                {isMcqSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Attempt
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDiscardDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsDiscardDialogOpen(nextOpen);
          if (!nextOpen) {
            setPendingDiscardMode(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard submission draft?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved submission changes. Discarding will remove this draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={discardAssignmentDraftChanges}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
