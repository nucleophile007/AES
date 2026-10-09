"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShimmerSkeleton } from "@/components/ui/dashboard-loading-skeleton";
import PremiumMcqReport from "../../../components/common/PremiumMcqReport";
import { 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Star,
  ExternalLink,
  BarChart3,
  Send,
  CheckCircle2,
  Save,
  PencilLine
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserTimezone, formatDate as formatDateTz, formatDateTime } from "@/lib/timezone";
import {
  McqReportPresentation,
  createDefaultReportPresentation,
  normalizeReportPresentation,
} from "@/lib/mcq-report-presentation";

interface Submission {
  id: number;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  status: string;
  submissionNumber: number;
  student: {
    id: number;
    name: string;
    email: string;
    grade: string;
  };
  assignment: {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    totalPoints: number;
    program: string;
    subject: string;
  };
}

interface SubmissionReviewerProps {
  teacherEmail: string;
}

interface ParsedMcqSubmission {
  testTitle: string;
  assessmentType: "mock-test" | "simple-assignment";
  attemptCount: number;
  latestAttemptNumber: number;
  answeredCount: number;
  totalQuestions: number;
  maxScore: number;
  attempts: Array<{
    attemptNumber: number;
    submittedAt: string;
    answeredCount: number;
    totalQuestions: number;
    maxScore: number;
    elapsedMs: number;
    timerMode: "timed" | "untimed";
    recommendedMinutes: number | null;
    chosenMinutes: number | null;
  }>;
  hasReport: boolean;
  reportPdf?: {
    fileKey?: string;
    publicUrl?: string;
    generatedAt?: string;
    generatedByTeacherId?: number;
  };
  reportPresentation?: McqReportPresentation;
  report?: {
    assessmentType?: "mock-test" | "simple-assignment";
    generatedAt?: string;
    attemptPolicy?: {
      consideredAttemptNumber?: number;
      consideredAttemptSubmittedAt?: string;
      validAttemptsBeforeDue?: number;
      attemptsFound?: number;
    };
    scoreSummary?: {
      finalScore?: number;
      rawScore?: number;
      percentage?: number;
      maxScore?: number;
      correctCount?: number;
      partialCount?: number;
      wrongCount?: number;
      answeredCount?: number;
      unansweredCount?: number;
    };
    topicStats?: Array<{
      topicId: string;
      topicName: string;
      questionCount?: number;
      answeredCount?: number;
      correctCount?: number;
      partialCount?: number;
      wrongCount?: number;
      unansweredCount?: number;
      score?: number;
      maxScore?: number;
      percentage?: number;
    }>;
    difficultyStats?: Array<{
      difficulty?: string;
      questionCount?: number;
      answeredCount?: number;
      correctCount?: number;
      partialCount?: number;
      wrongCount?: number;
      unansweredCount?: number;
      score?: number;
      maxScore?: number;
      percentage?: number;
    }>;
    questionStats?: Array<{
      questionId?: string;
      questionNumber?: string;
      sectionId?: string;
      sectionName?: string;
      difficulty?: string;
      type?: string;
      marks?: number;
      negativeMarks?: number;
      partialMarkingEnabled?: boolean;
      correctAnswers?: string[];
      selectedAnswers?: string[];
      scoreAwarded?: number;
      status?: string;
    }>;
  };
}

const parseMcqSubmission = (content: string | null): ParsedMcqSubmission | null => {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as {
      submissionType?: string;
      testTitle?: string;
      submittedAt?: string;
      summary?: {
        answeredCount?: number;
        totalQuestions?: number;
        maxScore?: number;
      };
      attempts?: Array<{
        attemptNumber?: number;
        submittedAt?: string;
        elapsedMs?: number;
        timerMode?: string;
        recommendedMinutes?: number | null;
        chosenMinutes?: number | null;
        summary?: {
          answeredCount?: number;
          totalQuestions?: number;
          maxScore?: number;
        };
      }>;
      latestAttemptNumber?: number;
      report?: ParsedMcqSubmission["report"];
      assessmentType?: "mock-test" | "simple-assignment";
      reportPresentation?: unknown;
      reportPdf?: ParsedMcqSubmission["reportPdf"];
    };
    if (parsed.submissionType !== "mcq_test_attempt") return null;
    const attempts = Array.isArray(parsed.attempts) ? parsed.attempts : [];
    const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
    const latestSummary = latestAttempt?.summary || parsed.summary || {};
    const normalizedAttempts: ParsedMcqSubmission["attempts"] = attempts.length > 0
      ? attempts.map((attempt, index) => {
          const summary = attempt.summary || {};
          const timerMode: "timed" | "untimed" = attempt.timerMode === "timed" ? "timed" : "untimed";
          return {
            attemptNumber: Number(attempt.attemptNumber) || index + 1,
            submittedAt: typeof attempt.submittedAt === "string" ? attempt.submittedAt : "",
            answeredCount: Number(summary.answeredCount) || 0,
            totalQuestions: Number(summary.totalQuestions) || 0,
            maxScore: Number(summary.maxScore) || 0,
            elapsedMs: Math.max(0, Number(attempt.elapsedMs) || 0),
            timerMode,
            recommendedMinutes: Number.isFinite(Number(attempt.recommendedMinutes))
              ? Math.max(1, Number(attempt.recommendedMinutes))
              : null,
            chosenMinutes: Number.isFinite(Number(attempt.chosenMinutes))
              ? Math.max(1, Number(attempt.chosenMinutes))
              : null,
          };
        })
      : [
          {
            attemptNumber: 1,
            submittedAt: typeof parsed.submittedAt === "string" ? parsed.submittedAt : "",
            answeredCount: Number((parsed.summary || {}).answeredCount) || 0,
            totalQuestions: Number((parsed.summary || {}).totalQuestions) || 0,
            maxScore: Number((parsed.summary || {}).maxScore) || 0,
            elapsedMs: 0,
            timerMode: "untimed" as const,
            recommendedMinutes: null,
            chosenMinutes: null,
          },
        ];
    const fallbackPresentation = createDefaultReportPresentation({
      testTitle: parsed.testTitle || "MCQ + PDF Assessment",
      topicStats: parsed.report?.topicStats || [],
    });
    const reportPresentation = parsed.report
      ? normalizeReportPresentation(parsed.reportPresentation, fallbackPresentation, parsed.report.topicStats || [])
      : undefined;

    return {
      testTitle: parsed.testTitle || "MCQ + PDF Assessment",
      assessmentType: parsed.assessmentType === "simple-assignment" ? "simple-assignment" : "mock-test",
      attemptCount: attempts.length > 0 ? attempts.length : 1,
      latestAttemptNumber: Number(parsed.latestAttemptNumber) || Number(latestAttempt?.attemptNumber) || 1,
      answeredCount: Number(latestSummary.answeredCount) || 0,
      totalQuestions: Number(latestSummary.totalQuestions) || 0,
      maxScore: Number(latestSummary.maxScore) || 0,
      attempts: normalizedAttempts,
      hasReport: Boolean(parsed.report),
      reportPdf: parsed.reportPdf,
      report: parsed.report,
      reportPresentation,
    };
  } catch {
    return null;
  }
};

export default function SubmissionReviewer({ teacherEmail }: SubmissionReviewerProps) {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportSubmission, setSelectedReportSubmission] = useState<Submission | null>(null);
  const [selectedReportData, setSelectedReportData] = useState<ParsedMcqSubmission | null>(null);
  const [selectedReportPresentation, setSelectedReportPresentation] = useState<McqReportPresentation | null>(null);
  const [attemptSelectionBySubmissionId, setAttemptSelectionBySubmissionId] = useState<Record<number, string>>({});
  const [gradeData, setGradeData] = useState({ grade: '' });
  const [isSavingGrade, setIsSavingGrade] = useState(false);
  const [reportActionSubmissionId, setReportActionSubmissionId] = useState<number | null>(null);
  const gradeSubmitInFlightRef = useRef(false);
  const autoRecommendationInFlightRef = useRef<Set<number>>(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    assignment: 'all',
    student: 'all',
    search: ''
  });

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await fetch(`/api/teacher/submissions?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch submissions');
      }

      setSubmissions(data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setLoadError(error instanceof Error ? error.message : "Failed to load submissions");
      toast({
        variant: "destructive",
        title: "Failed to load submissions",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...submissions];

    // Filter by status
    if (filters.status !== 'all') {
      if (filters.status === 'pending') {
        filtered = filtered.filter(s => s.grade === null);
      } else if (filters.status === 'graded') {
        filtered = filtered.filter(s => s.grade !== null);
      } else {
        filtered = filtered.filter(s => s.status === filters.status);
      }
    }

    // Filter by assignment
    if (filters.assignment !== 'all') {
      filtered = filtered.filter(s => s.assignment.id.toString() === filters.assignment);
    }

    // Filter by student
    if (filters.student !== 'all') {
      filtered = filtered.filter(s => s.student.id.toString() === filters.student);
    }

    // Filter by search (student name or assignment title)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.student.name.toLowerCase().includes(search) ||
        s.assignment.title.toLowerCase().includes(search)
      );
    }

    setFilteredSubmissions(filtered);
  };

  useEffect(() => {
    if (teacherEmail) {
      fetchSubmissions();
    }
  }, [teacherEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyFilters();
  }, [submissions, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGrade = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      grade: submission.grade?.toString() || ''
    });
    setIsGradeDialogOpen(true);
  };

  const submitGrade = async () => {
    if (gradeSubmitInFlightRef.current || isSavingGrade) return;
    if (!selectedSubmission) return;

    try {
      gradeSubmitInFlightRef.current = true;
      setIsSavingGrade(true);
      const response = await fetch('/api/teacher/submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          grade: gradeData.grade ? parseInt(gradeData.grade) : null,
          teacherEmail
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to grade submission');
      }

      // Update local state
      setSubmissions(prev => prev.map(s => 
        s.id === selectedSubmission.id 
          ? { ...s, grade: data.submission.grade, feedback: data.submission.feedback, status: data.submission.status }
          : s
      ));

      setIsGradeDialogOpen(false);
      setSelectedSubmission(null);
      toast({
        title: "Submission graded",
        description: "Grade saved successfully.",
        className: "border-green-500 bg-green-50 text-green-900",
      });

    } catch (error) {
      console.error('Error grading submission:', error);
      toast({
        variant: "destructive",
        title: "Failed to grade submission",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSavingGrade(false);
      gradeSubmitInFlightRef.current = false;
    }
  };

  const handleReportAction = async (
    submission: Submission,
    action: "generate" | "saveDraft" | "confirm" | "send" | "generateTeacherRecommendation",
    presentation?: McqReportPresentation,
    attemptNumber?: number
  ) => {
    if (reportActionSubmissionId !== null) return;
    try {
      setReportActionSubmissionId(submission.id);
      const response = await fetch('/api/teacher/submissions/mcq-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          teacherEmail,
          action,
          presentation,
          attemptNumber: action === "generate" ? attemptNumber : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate MCQ report');
      }

      setSubmissions((prev) => prev.map((item) => (
        item.id === submission.id ? data.submission : item
      )));
      if (selectedReportSubmission?.id === submission.id) {
        const refreshedReport = parseMcqSubmission(data.submission?.content || null);
        setSelectedReportSubmission(data.submission);
        setSelectedReportData(refreshedReport);
        setSelectedReportPresentation(refreshedReport?.reportPresentation || null);
      }

      toast({
        title: action === "generate"
          ? "Report generated"
          : action === "generateTeacherRecommendation"
            ? "Teacher recommendation generated"
          : action === "saveDraft"
            ? "Draft saved"
            : action === "confirm"
              ? "Report confirmed"
              : "Report sent",
        description: action === "generate"
          ? "Auto-check completed. Open mentor workspace to refine the narrative."
          : action === "saveDraft"
            ? "Mentor draft updated successfully."
            : action === "confirm"
              ? "Final version confirmed. PDF is ready for review and sending."
              : "Final report PDF has been shared with the student and parent dashboards.",
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Report action failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setReportActionSubmissionId(null);
    }
  };

  useEffect(() => {
    if (!isReportDialogOpen) return;
    if (!selectedReportSubmission || !selectedReportData?.report || !selectedReportPresentation) return;
    if (selectedReportPresentation.teacherRecommendation.trim()) return;
    if (reportActionSubmissionId !== null) return;
    if (autoRecommendationInFlightRef.current.has(selectedReportSubmission.id)) return;

    autoRecommendationInFlightRef.current.add(selectedReportSubmission.id);
    handleReportAction(selectedReportSubmission, "generateTeacherRecommendation", selectedReportPresentation);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isReportDialogOpen,
    selectedReportSubmission,
    selectedReportData,
    selectedReportPresentation,
    reportActionSubmissionId,
  ]);

  const createPresentationSeed = (submission: Submission, parsed: ParsedMcqSubmission) => {
    const fallback = createDefaultReportPresentation({
      studentName: submission.student.name,
      assignmentTitle: submission.assignment.title,
      testTitle: parsed.testTitle,
      topicStats: parsed.report?.topicStats || [],
    });
    return normalizeReportPresentation(parsed.reportPresentation, fallback, parsed.report?.topicStats || []);
  };

  const openReportDialog = (submission: Submission) => {
    const parsed = parseMcqSubmission(submission.content);
    if (!parsed?.hasReport || !parsed.report) {
      toast({
        title: "No report yet",
        description: "Run Check Marks first to generate a report.",
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      return;
    }
    setSelectedReportSubmission(submission);
    setSelectedReportData(parsed);
    setSelectedReportPresentation(createPresentationSeed(submission, parsed));
    if (!attemptSelectionBySubmissionId[submission.id]) {
      setAttemptSelectionBySubmissionId((prev) => ({
        ...prev,
        [submission.id]: String(parsed.latestAttemptNumber || 1),
      }));
    }
    setIsReportDialogOpen(true);
  };

  const updatePresentationField = (field: keyof McqReportPresentation, value: string) => {
    setSelectedReportPresentation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
        updatedAt: new Date().toISOString(),
        mode: prev.mode === "confirmed" ? "draft" : prev.mode,
        confirmedAt: prev.mode === "confirmed" ? null : prev.confirmedAt,
        confirmedByTeacherId: prev.mode === "confirmed" ? null : prev.confirmedByTeacherId,
      };
    });
  };

  const updateMasteryLabel = (sectionId: string, value: string) => {
    setSelectedReportPresentation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        masteryLabels: {
          ...prev.masteryLabels,
          [sectionId]: value,
        },
        updatedAt: new Date().toISOString(),
        mode: prev.mode === "confirmed" ? "draft" : prev.mode,
        confirmedAt: prev.mode === "confirmed" ? null : prev.confirmedAt,
        confirmedByTeacherId: prev.mode === "confirmed" ? null : prev.confirmedByTeacherId,
      };
    });
  };

  const formatDate = (dateString: string) => {
    return formatDateTz(new Date(dateString), getUserTimezone());
  };

  const formatTime = (dateString: string) => {
    return formatDateTime(new Date(dateString), getUserTimezone());
  };

  const formatDurationMs = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isLate = (submittedAt: string, dueDate: string) => {
    return new Date(submittedAt) > new Date(dueDate);
  };

  const getStatusBadge = (submission: Submission) => {
    if (submission.grade !== null) {
      return <Badge variant="default">Graded</Badge>;
    }
    if (isLate(submission.submittedAt, submission.assignment.dueDate)) {
      return <Badge variant="destructive">Late</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const getGradeColor = (grade: number, totalPoints: number) => {
    const percentage = (grade / totalPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeMaxPoints = (submission: Submission | null) => {
    if (!submission) return 100;
    const parsed = parseMcqSubmission(submission.content);
    return parsed ? 100 : submission.assignment.totalPoints;
  };

  // Get unique assignments for filter
  const uniqueAssignments = Array.from(
    new Set(submissions.map(s => s.assignment.id))
  ).map(id => submissions.find(s => s.assignment.id === id)?.assignment).filter(Boolean);

  // Get unique students for filter
  const uniqueStudents = Array.from(
    new Set(submissions.map(s => s.student.id))
  ).map(id => submissions.find(s => s.student.id === id)?.student).filter(Boolean);

  if (loading) {
    return (
      <div className="space-y-4 p-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`submission-reviewer-loading-${index}`}>
            <CardHeader className="space-y-3">
              <ShimmerSkeleton className="h-5 w-1/3" />
              <ShimmerSkeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-5/6" />
              <ShimmerSkeleton className="h-24 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Student Submissions</h2>
        <Button onClick={fetchSubmissions} variant="outline" size="sm" className="h-9 text-xs sm:text-sm border-slate-300" disabled={loading || isSavingGrade}>
          Refresh
        </Button>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-red-700">{loadError}</p>
              <Button size="sm" variant="outline" onClick={fetchSubmissions}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="resubmitted">Resubmitted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assignment</Label>
              <Select value={filters.assignment} onValueChange={(value) => setFilters({...filters, assignment: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignments</SelectItem>
                  {uniqueAssignments.map((assignment) => (
                    <SelectItem key={assignment!.id} value={assignment!.id.toString()}>
                      {assignment!.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Student</Label>
              <Select value={filters.student} onValueChange={(value) => setFilters({...filters, student: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {uniqueStudents.map((student) => (
                    <SelectItem key={student!.id} value={student!.id.toString()}>
                      {student!.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search by student name or assignment..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="grid gap-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No submissions found</h3>
              <p className="text-gray-600">No submissions match your current filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => {
            const parsedMcqSubmission = parseMcqSubmission(submission.content);
            const isMcqSubmission = Boolean(parsedMcqSubmission);
            const reportBusy = reportActionSubmissionId === submission.id;
            const gradeMaxPoints = isMcqSubmission ? 100 : submission.assignment.totalPoints;
            const attemptOptions = parsedMcqSubmission?.attempts || [];
            const selectedAttemptValue = attemptSelectionBySubmissionId[submission.id]
              || String(parsedMcqSubmission?.latestAttemptNumber || 1);
            return (
            <Card key={submission.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg break-words">{submission.assignment.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-gray-600 truncate text-xs sm:text-sm">{submission.student.name}</span>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">{submission.student.grade}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {getStatusBadge(submission)}
                    {submission.submissionNumber > 1 && (
                      <Badge variant="outline" className="text-xs">Resubmission #{submission.submissionNumber}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">Submitted</p>
                      <p className="font-medium text-xs sm:text-sm truncate">{formatDate(submission.submittedAt)}</p>
                      <p className="text-xs text-gray-500">{formatTime(submission.submittedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">Due Date</p>
                      <p className="font-medium text-xs sm:text-sm truncate">{formatDate(submission.assignment.dueDate)}</p>
                      {isLate(submission.submittedAt, submission.assignment.dueDate) && (
                        <p className="text-xs text-red-500 font-medium">Late submission</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <Star className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">Grade</p>
                      {submission.grade !== null ? (
                        <p className={`font-medium text-base sm:text-lg ${getGradeColor(submission.grade, gradeMaxPoints)}`}>
                          {submission.grade}/{gradeMaxPoints}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-xs sm:text-sm">Not graded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission Content */}
                <div className="space-y-3">
                  {isMcqSubmission ? (
                    <div className="rounded border bg-slate-50 p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                        <p className="text-xs sm:text-sm font-medium text-slate-800 break-words">{parsedMcqSubmission?.testTitle}</p>
                        <Badge variant="outline" className="w-fit text-xs">MCQ Attempt</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Attempt #{parsedMcqSubmission?.latestAttemptNumber} of {parsedMcqSubmission?.attemptCount} •{" "}
                        {parsedMcqSubmission?.answeredCount}/{parsedMcqSubmission?.totalQuestions} answered
                      </p>
                      <p className="text-xs text-slate-600">
                        Max score: {parsedMcqSubmission?.maxScore}
                      </p>
                      {parsedMcqSubmission?.hasReport && (
                        <div className="mt-2 space-y-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-700">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="font-medium">Report Workspace Ready</span>
                            <Badge
                              className={parsedMcqSubmission?.reportPresentation?.mode === "confirmed"
                                ? "border-emerald-200 bg-emerald-100 text-emerald-800 text-[10px]"
                                : "border-amber-200 bg-amber-100 text-amber-800 text-[10px]"}
                            >
                              {parsedMcqSubmission?.reportPresentation?.mode === "confirmed" ? "Confirmed" : "Draft"}
                            </Badge>
                          </div>
                          <p>
                            Checked: {parsedMcqSubmission?.report?.scoreSummary?.finalScore ?? 0}/{parsedMcqSubmission?.maxScore}
                            {" "}({parsedMcqSubmission?.report?.scoreSummary?.percentage ?? 0}%)
                          </p>
                          <p>
                            Correct {parsedMcqSubmission?.report?.scoreSummary?.correctCount ?? 0} •
                            Partial {parsedMcqSubmission?.report?.scoreSummary?.partialCount ?? 0} •
                            Wrong {parsedMcqSubmission?.report?.scoreSummary?.wrongCount ?? 0}
                          </p>
                          {(parsedMcqSubmission?.report?.topicStats || []).slice(0, 3).map((topic, index) => (
                            <div key={topic.topicId || index} className="flex items-center justify-between gap-2">
                              <span className="truncate text-slate-600">{topic.topicName || "Topic"}</span>
                              <span className="font-medium text-slate-900 shrink-0">{topic.score}/{topic.maxScore}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : submission.content ? (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Text Submission:</p>
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{submission.content}</p>
                      </div>
                    </div>
                  ) : null}

                  {submission.fileUrl && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">File Submission:</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 bg-gray-50 rounded border">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                          <span className="text-xs sm:text-sm truncate">{submission.fileName}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(submission.fileUrl!, '_blank')}
                          className="w-full sm:w-auto shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Teacher feedback display removed from teacher dashboard */}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-2">
                  {isMcqSubmission && (
                    <>
                      {attemptOptions.length > 1 && (
                        <Select
                          value={selectedAttemptValue}
                          onValueChange={(value) =>
                            setAttemptSelectionBySubmissionId((prev) => ({
                              ...prev,
                              [submission.id]: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full sm:w-[200px] text-xs sm:text-sm">
                            <SelectValue placeholder="Select attempt" />
                          </SelectTrigger>
                          <SelectContent>
                            {attemptOptions.map((attempt) => (
                              <SelectItem key={`attempt-${submission.id}-${attempt.attemptNumber}`} value={String(attempt.attemptNumber)}>
                                Attempt #{attempt.attemptNumber} • {attempt.answeredCount}/{attempt.totalQuestions}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReportAction(submission, "generate", undefined, Number(selectedAttemptValue))}
                        disabled={reportActionSubmissionId !== null || isSavingGrade}
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        <BarChart3 className="mr-2 h-4 w-4 shrink-0" />
                        {reportBusy ? "Generating..." : "Generate Draft"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReportDialog(submission)}
                        disabled={reportActionSubmissionId !== null}
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        <PencilLine className="mr-2 h-4 w-4 shrink-0" />
                        Mentor Workspace
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleGrade(submission)}
                    disabled={isSavingGrade || reportBusy}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    {submission.grade !== null ? 'Update Grade' : 'Grade Submission'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })
        )}
      </div>

      <Dialog
        open={isReportDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsReportDialogOpen(nextOpen);
          if (!nextOpen) {
            setSelectedReportSubmission(null);
            setSelectedReportData(null);
            setSelectedReportPresentation(null);
          }
        }}
      >
        <DialogContent className="flex h-[95vh] sm:h-[92vh] max-h-[95vh] sm:max-h-[92vh] w-[98vw] max-w-[96vw] flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-slate-200 p-4 sm:px-6 sm:py-4 pr-10">
            <DialogTitle className="text-base sm:text-lg break-words">
              Mentor Report Workspace: {selectedReportSubmission?.assignment.title || "Submission"}
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-none">
              Student: {selectedReportSubmission?.student.name || "N/A"} • Assessment: {selectedReportData?.testTitle || "MCQ + PDF Assessment"} • Edit live preview before confirmation
            </p>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden p-3 sm:px-4 sm:py-3">
            {!selectedReportData?.report || !selectedReportPresentation || !selectedReportSubmission ? (
              <div className="py-8 text-center text-sm text-slate-600">
                No report data available.
              </div>
            ) : (
              <div className="flex flex-col lg:grid lg:grid-cols-[360px_minmax(0,1fr)] gap-4 h-full min-h-0">
                <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Draft Controls</h3>
                    <Badge className={selectedReportPresentation.mode === "confirmed"
                      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                      : "border-amber-200 bg-amber-100 text-amber-800"}
                    >
                      {selectedReportPresentation.mode === "confirmed" ? "Confirmed" : "Draft"}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attempt History</p>
                        {selectedReportSubmission && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleReportAction(
                                selectedReportSubmission,
                                "generate",
                                undefined,
                                Number(attemptSelectionBySubmissionId[selectedReportSubmission.id] || selectedReportData.latestAttemptNumber)
                              )
                            }
                            disabled={reportActionSubmissionId !== null}
                          >
                            {reportActionSubmissionId === selectedReportSubmission.id ? "Generating..." : "Generate for Attempt"}
                          </Button>
                        )}
                      </div>
                      <Select
                        value={
                          selectedReportSubmission
                            ? (attemptSelectionBySubmissionId[selectedReportSubmission.id]
                              || String(selectedReportData.latestAttemptNumber))
                            : ""
                        }
                        onValueChange={(value) => {
                          if (!selectedReportSubmission) return;
                          setAttemptSelectionBySubmissionId((prev) => ({
                            ...prev,
                            [selectedReportSubmission.id]: value,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select attempt" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedReportData.attempts.map((attempt) => (
                            <SelectItem key={`attempt-select-${attempt.attemptNumber}`} value={String(attempt.attemptNumber)}>
                              Attempt #{attempt.attemptNumber} • {attempt.answeredCount}/{attempt.totalQuestions}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="space-y-2">
                        {selectedReportData.attempts.map((attempt) => {
                          const isReported =
                            attempt.attemptNumber === (selectedReportData.report?.attemptPolicy?.consideredAttemptNumber || 0);
                          return (
                            <div key={`attempt-row-${attempt.attemptNumber}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                              <div className="space-y-0.5">
                                <div className="font-semibold">Attempt #{attempt.attemptNumber}</div>
                                <div>{attempt.answeredCount}/{attempt.totalQuestions} answered • {formatDurationMs(attempt.elapsedMs)} elapsed</div>
                                <div>
                                  {attempt.submittedAt ? formatTime(attempt.submittedAt) : "Draft"} • {attempt.timerMode}
                                </div>
                              </div>
                              {isReported && (
                                <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Reported</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="report-title">Report Title</Label>
                      <Input
                        id="report-title"
                        value={selectedReportPresentation.reportTitle}
                        onChange={(e) => updatePresentationField("reportTitle", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="report-type">Report Type</Label>
                      <Input
                        id="report-type"
                        value={selectedReportPresentation.reportType}
                        onChange={(e) => updatePresentationField("reportType", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ai-narrative">AI Narrative</Label>
                      <Textarea
                        id="ai-narrative"
                        value={selectedReportPresentation.aiNarrative}
                        onChange={(e) => updatePresentationField("aiNarrative", e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="strengths">Strengths (one per line)</Label>
                      <Textarea
                        id="strengths"
                        value={selectedReportPresentation.strengths}
                        onChange={(e) => updatePresentationField("strengths", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="weaknesses">Weaknesses (one per line)</Label>
                      <Textarea
                        id="weaknesses"
                        value={selectedReportPresentation.weaknesses}
                        onChange={(e) => updatePresentationField("weaknesses", e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teacher&apos;s Recommendation</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!selectedReportSubmission || !selectedReportPresentation) return;
                            handleReportAction(selectedReportSubmission, "generateTeacherRecommendation", {
                              ...selectedReportPresentation,
                              teacherRecommendation: "",
                            });
                          }}
                          disabled={reportActionSubmissionId !== null}
                        >
                          {reportActionSubmissionId === selectedReportSubmission.id ? "Generating..." : "Regenerate"}
                        </Button>
                      </div>
                      <Textarea
                        id="teacher-recommendation"
                        value={selectedReportPresentation.teacherRecommendation}
                        onChange={(e) => updatePresentationField("teacherRecommendation", e.target.value)}
                        rows={5}
                        placeholder="Gemini-generated teacher recommendation for mentor editing"
                      />
                    </div>
                    {selectedReportData.assessmentType === "simple-assignment" && (
                      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gap Analysis and Next Steps</p>
                        <div>
                          <Label htmlFor="concept-gaps">Conceptual Gaps</Label>
                          <Textarea
                            id="concept-gaps"
                            value={selectedReportPresentation.conceptualGaps}
                            onChange={(e) => updatePresentationField("conceptualGaps", e.target.value)}
                            rows={3}
                            placeholder="Gemini-generated conceptual gap summary"
                          />
                        </div>
                        <div>
                          <Label htmlFor="recommendations">Recommendations</Label>
                          <Textarea
                            id="recommendations"
                            value={selectedReportPresentation.recommendations}
                            onChange={(e) => updatePresentationField("recommendations", e.target.value)}
                            rows={3}
                            placeholder="Gemini-generated recommendations"
                          />
                        </div>
                        <div>
                          <Label htmlFor="next-action">Next Action</Label>
                          <Textarea
                            id="next-action"
                            value={selectedReportPresentation.nextAction}
                            onChange={(e) => updatePresentationField("nextAction", e.target.value)}
                            rows={2}
                            placeholder="Gemini-generated next action"
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topic Insights</p>
                      {(selectedReportData.report.topicStats || []).map((topic, index) => {
                        const topicId = topic.topicId || `topic-${index + 1}`;
                        return (
                          <div key={`ai-topic-${topicId}`}>
                            <Label htmlFor={`ai-topic-${topicId}`}>{topic.topicName || `Topic ${index + 1}`}</Label>
                            <Textarea
                              id={`ai-topic-${topicId}`}
                              value={selectedReportPresentation.aiTopicInsights?.[topicId] || ""}
                              onChange={(e) => {
                                setSelectedReportPresentation((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    aiTopicInsights: {
                                      ...(prev.aiTopicInsights || {}),
                                      [topicId]: e.target.value,
                                    },
                                    updatedAt: new Date().toISOString(),
                                    mode: prev.mode === "confirmed" ? "draft" : prev.mode,
                                    confirmedAt: prev.mode === "confirmed" ? null : prev.confirmedAt,
                                    confirmedByTeacherId: prev.mode === "confirmed" ? null : prev.confirmedByTeacherId,
                                  };
                                });
                              }}
                              rows={2}
                              placeholder="one-line insight for this topic"
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* <div>
                      <Label htmlFor="concept-gaps">Conceptual Gaps</Label>
                      <Textarea
                        id="concept-gaps"
                        value={selectedReportPresentation.conceptualGaps}
                        onChange={(e) => updatePresentationField("conceptualGaps", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="topic-insights">Topic Insights</Label>
                      <Textarea
                        id="topic-insights"
                        value={selectedReportPresentation.topicInsights}
                        onChange={(e) => updatePresentationField("topicInsights", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="interpretation">Interpretation</Label>
                      <Textarea
                        id="interpretation"
                        value={selectedReportPresentation.interpretationText}
                        onChange={(e) => updatePresentationField("interpretationText", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="recommendations">Recommendations</Label>
                      <Textarea
                        id="recommendations"
                        value={selectedReportPresentation.recommendations}
                        onChange={(e) => updatePresentationField("recommendations", e.target.value)}
                        rows={3}
                      />
                    </div> */}

                    {/* <div>
                      <Label htmlFor="next-action">Next Action</Label>
                      <Textarea
                        id="next-action"
                        value={selectedReportPresentation.nextAction}
                        onChange={(e) => updatePresentationField("nextAction", e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="mentor-comments">Mentor Comments</Label>
                      <Textarea
                        id="mentor-comments"
                        value={selectedReportPresentation.mentorComments}
                        onChange={(e) => updatePresentationField("mentorComments", e.target.value)}
                        rows={2}
                      />
                    </div> */}
                    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proficiency Labels</p>
                      {(selectedReportData.report.topicStats || []).map((topic, index) => {
                        const topicId = topic.topicId || `topic-${index + 1}`;
                        return (
                          <div key={`label-${topicId}`}>
                            <Label htmlFor={`mastery-${topicId}`}>{topic.topicName || `Topic ${index + 1}`}</Label>
                            <Input
                              id={`mastery-${topicId}`}
                              value={selectedReportPresentation.masteryLabels[topicId] || ""}
                              onChange={(e) => updateMasteryLabel(topicId, e.target.value)}
                              placeholder="Advanced / Developing / Needs Support"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Difficulty Reviews</p>
                      {([
                        { key: "easy", label: "Easy Tier Review" },
                        { key: "medium", label: "Medium Tier Review" },
                        { key: "hard", label: "Hard Tier Review" },
                      ] as const).map((tier) => (
                        <div key={tier.key}>
                          <Label htmlFor={`ai-difficulty-${tier.key}`}>{tier.label}</Label>
                          <Textarea
                            id={`ai-difficulty-${tier.key}`}
                            value={selectedReportPresentation.aiDifficultyReviews?.[tier.key] || ""}
                            onChange={(e) => {
                              setSelectedReportPresentation((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  aiDifficultyReviews: {
                                    ...(prev.aiDifficultyReviews || { easy: "", medium: "", hard: "" }),
                                    [tier.key]: e.target.value,
                                  },
                                  updatedAt: new Date().toISOString(),
                                  mode: prev.mode === "confirmed" ? "draft" : prev.mode,
                                  confirmedAt: prev.mode === "confirmed" ? null : prev.confirmedAt,
                                  confirmedByTeacherId: prev.mode === "confirmed" ? null : prev.confirmedByTeacherId,
                                };
                              });
                            }}
                            rows={3}
                            placeholder="Gemini-generated review text for this tier"
                          />
                        </div>
                      ))}
                    </div>

                    

                    
                  </div>
                </div>

                <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-2 sm:p-4 overflow-x-auto">
                  <PremiumMcqReport
                    report={{ ...selectedReportData.report, assessmentType: selectedReportData.assessmentType }}
                    presentation={selectedReportPresentation}
                    studentName={selectedReportSubmission.student.name}
                    assignmentTitle={selectedReportSubmission.assignment.title}
                    testTitle={selectedReportData.testTitle}
                    attemptsLabel={`${selectedReportData.attemptCount} (latest #${selectedReportData.latestAttemptNumber})`}
                    consideredAttemptLabel={`#${selectedReportData.report.attemptPolicy?.consideredAttemptNumber ?? selectedReportData.latestAttemptNumber}`}
                    showModeBadge
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row shrink-0 justify-end gap-2 border-t border-slate-200 p-3 sm:px-6 sm:py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReportDialogOpen(false)}
              disabled={reportActionSubmissionId !== null}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Close
            </Button>
            {selectedReportSubmission && selectedReportPresentation && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReportAction(selectedReportSubmission, "saveDraft", selectedReportPresentation)}
                  disabled={reportActionSubmissionId !== null}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  <Save className="mr-2 h-4 w-4 shrink-0" />
                  {reportActionSubmissionId === selectedReportSubmission.id ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReportAction(selectedReportSubmission, "confirm", selectedReportPresentation)}
                  disabled={reportActionSubmissionId !== null}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 shrink-0" />
                  {reportActionSubmissionId === selectedReportSubmission.id ? "Confirming..." : "Confirm Report"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleReportAction(selectedReportSubmission, "send", selectedReportPresentation)}
                  disabled={
                    reportActionSubmissionId !== null ||
                    selectedReportPresentation.mode !== "confirmed"
                  }
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  <Send className="mr-2 h-4 w-4 shrink-0" />
                  {reportActionSubmissionId === selectedReportSubmission.id ? "Sending..." : "Send Report"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg break-words">
              Grade Submission: {selectedSubmission?.assignment.title}
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              Student: {selectedSubmission?.student.name}
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="grade">Grade (out of {getGradeMaxPoints(selectedSubmission)})</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max={getGradeMaxPoints(selectedSubmission)}
                value={gradeData.grade}
                onChange={(e) => setGradeData({...gradeData, grade: e.target.value})}
                placeholder="Enter grade"
              />
            </div>

            {/* Feedback removed: not displayed/collected in dashboard */}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)} disabled={isSavingGrade} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={submitGrade} disabled={isSavingGrade} className="w-full sm:w-auto">
              {isSavingGrade ? "Saving..." : "Save Grade"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
