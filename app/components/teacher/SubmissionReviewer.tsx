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
import { 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Star,
  ExternalLink,
  BarChart3,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserTimezone, formatDate as formatDateTz, formatDateTime } from "@/lib/timezone";

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
  attemptCount: number;
  latestAttemptNumber: number;
  answeredCount: number;
  totalQuestions: number;
  maxScore: number;
  hasReport: boolean;
  report?: {
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
    sectionStats?: Array<{
      sectionId?: string;
      sectionName?: string;
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
      summary?: {
        answeredCount?: number;
        totalQuestions?: number;
        maxScore?: number;
      };
      attempts?: Array<{
        attemptNumber?: number;
        summary?: {
          answeredCount?: number;
          totalQuestions?: number;
          maxScore?: number;
        };
      }>;
      latestAttemptNumber?: number;
      report?: ParsedMcqSubmission["report"];
    };
    if (parsed.submissionType !== "mcq_test_attempt") return null;
    const attempts = Array.isArray(parsed.attempts) ? parsed.attempts : [];
    const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
    const latestSummary = latestAttempt?.summary || parsed.summary || {};
    return {
      testTitle: parsed.testTitle || "MCQ Test",
      attemptCount: attempts.length > 0 ? attempts.length : 1,
      latestAttemptNumber: Number(parsed.latestAttemptNumber) || Number(latestAttempt?.attemptNumber) || 1,
      answeredCount: Number(latestSummary.answeredCount) || 0,
      totalQuestions: Number(latestSummary.totalQuestions) || 0,
      maxScore: Number(latestSummary.maxScore) || 0,
      hasReport: Boolean(parsed.report),
      report: parsed.report,
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
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });
  const [isSavingGrade, setIsSavingGrade] = useState(false);
  const [reportActionSubmissionId, setReportActionSubmissionId] = useState<number | null>(null);
  const gradeSubmitInFlightRef = useRef(false);
  const [filters, setFilters] = useState({
    status: 'all',
    assignment: 'all',
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
      grade: submission.grade?.toString() || '',
      feedback: submission.feedback || ''
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
          feedback: gradeData.feedback,
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
        description: "Your feedback has been saved successfully.",
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

  const handleGenerateReport = async (submission: Submission, sendToStudent: boolean) => {
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
          sendToStudent,
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
      }

      toast({
        title: sendToStudent ? "Report sent to student" : "Report generated",
        description: sendToStudent
          ? "MCQ report has been added to student feedback."
          : "Auto-check completed with section and difficulty analytics.",
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
    setIsReportDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return formatDateTz(new Date(dateString), getUserTimezone());
  };

  const formatTime = (dateString: string) => {
    return formatDateTime(new Date(dateString), getUserTimezone());
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

  // Get unique assignments for filter
  const uniqueAssignments = Array.from(
    new Set(submissions.map(s => s.assignment.id))
  ).map(id => submissions.find(s => s.assignment.id === id)?.assignment).filter(Boolean);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Submissions</h2>
        <Button onClick={fetchSubmissions} variant="outline" disabled={loading || isSavingGrade}>
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
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div className="md:col-span-2">
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
            return (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{submission.assignment.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{submission.student.name}</span>
                      <Badge variant="outline">{submission.student.grade}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(submission)}
                    {submission.submissionNumber > 1 && (
                      <Badge variant="outline">Resubmission #{submission.submissionNumber}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="font-medium">{formatDate(submission.submittedAt)}</p>
                      <p className="text-sm text-gray-500">{formatTime(submission.submittedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">{formatDate(submission.assignment.dueDate)}</p>
                      {isLate(submission.submittedAt, submission.assignment.dueDate) && (
                        <p className="text-sm text-red-500">Late submission</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Grade</p>
                      {submission.grade !== null ? (
                        <p className={`font-medium text-lg ${getGradeColor(submission.grade, submission.assignment.totalPoints)}`}>
                          {submission.grade}/{submission.assignment.totalPoints}
                        </p>
                      ) : (
                        <p className="text-gray-400">Not graded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission Content */}
                <div className="space-y-3">
                  {isMcqSubmission ? (
                    <div className="rounded border bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800">{parsedMcqSubmission?.testTitle}</p>
                        <Badge variant="outline">MCQ Attempt</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Attempt #{parsedMcqSubmission?.latestAttemptNumber} of {parsedMcqSubmission?.attemptCount} •{" "}
                        {parsedMcqSubmission?.answeredCount}/{parsedMcqSubmission?.totalQuestions} answered
                      </p>
                      <p className="text-xs text-slate-600">
                        Max score: {parsedMcqSubmission?.maxScore}
                      </p>
                      {parsedMcqSubmission?.hasReport && (
                        <div className="mt-2 space-y-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                          <p>
                            Checked: {parsedMcqSubmission?.report?.scoreSummary?.finalScore ?? 0}/{parsedMcqSubmission?.maxScore}
                            {" "}({parsedMcqSubmission?.report?.scoreSummary?.percentage ?? 0}%)
                          </p>
                          <p>
                            Correct {parsedMcqSubmission?.report?.scoreSummary?.correctCount ?? 0} •
                            Partial {parsedMcqSubmission?.report?.scoreSummary?.partialCount ?? 0} •
                            Wrong {parsedMcqSubmission?.report?.scoreSummary?.wrongCount ?? 0}
                          </p>
                          {(parsedMcqSubmission?.report?.sectionStats || []).slice(0, 3).map((section, index) => (
                            <p key={`section-stat-${submission.id}-${index}`}>
                              {section.sectionName || "Section"}: {section.score ?? 0}/{section.maxScore ?? 0} ({section.percentage ?? 0}%)
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : submission.content ? (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Text Submission:</p>
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-sm whitespace-pre-wrap">{submission.content}</p>
                      </div>
                    </div>
                  ) : null}

                  {submission.fileUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">File Submission:</p>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{submission.fileName}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(submission.fileUrl!, '_blank')}
                          className="ml-auto"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  )}

                  {submission.feedback && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Feedback:</p>
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm">{submission.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {isMcqSubmission && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleGenerateReport(submission, false)}
                        disabled={reportActionSubmissionId !== null || isSavingGrade}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        {reportBusy ? "Checking..." : "Check Marks"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleGenerateReport(submission, true)}
                        disabled={reportActionSubmissionId !== null || isSavingGrade}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {reportBusy ? "Sending..." : "Send Report"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openReportDialog(submission)}
                        disabled={reportActionSubmissionId !== null}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Report
                      </Button>
                    </>
                  )}
                  <Button onClick={() => handleGrade(submission)} disabled={isSavingGrade || reportBusy}>
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
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              MCQ Report: {selectedReportSubmission?.assignment.title || "Submission"}
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Student: {selectedReportSubmission?.student.name || "N/A"} • Test: {selectedReportData?.testTitle || "MCQ Test"}
            </p>
          </DialogHeader>

          {!selectedReportData?.report ? (
            <div className="py-8 text-center text-sm text-slate-600">
              No report data available.
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="rounded border bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Score</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedReportData.report.scoreSummary?.finalScore ?? 0}/{selectedReportData.report.scoreSummary?.maxScore ?? selectedReportData.maxScore}
                  </p>
                </div>
                <div className="rounded border bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Percentage</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedReportData.report.scoreSummary?.percentage ?? 0}%
                  </p>
                </div>
                <div className="rounded border bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Attempts</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedReportData.attemptCount} (latest #{selectedReportData.latestAttemptNumber})
                  </p>
                </div>
                <div className="rounded border bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Considered Attempt</p>
                  <p className="text-lg font-semibold text-slate-900">
                    #{selectedReportData.report.attemptPolicy?.consideredAttemptNumber ?? selectedReportData.latestAttemptNumber}
                  </p>
                </div>
              </div>

              <div className="rounded border">
                <div className="border-b bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">Section Statistics</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-white text-left text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Section</th>
                        <th className="px-3 py-2">Questions</th>
                        <th className="px-3 py-2">Answered</th>
                        <th className="px-3 py-2">Correct</th>
                        <th className="px-3 py-2">Partial</th>
                        <th className="px-3 py-2">Wrong</th>
                        <th className="px-3 py-2">Score</th>
                        <th className="px-3 py-2">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedReportData.report.sectionStats || []).map((section, index) => (
                        <tr key={`report-section-${index}`} className="border-t">
                          <td className="px-3 py-2">{section.sectionName || "Section"}</td>
                          <td className="px-3 py-2">{section.questionCount ?? 0}</td>
                          <td className="px-3 py-2">{section.answeredCount ?? 0}</td>
                          <td className="px-3 py-2">{section.correctCount ?? 0}</td>
                          <td className="px-3 py-2">{section.partialCount ?? 0}</td>
                          <td className="px-3 py-2">{section.wrongCount ?? 0}</td>
                          <td className="px-3 py-2">{section.score ?? 0}/{section.maxScore ?? 0}</td>
                          <td className="px-3 py-2">{section.percentage ?? 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded border">
                <div className="border-b bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">Difficulty Statistics</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead className="bg-white text-left text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Difficulty</th>
                        <th className="px-3 py-2">Questions</th>
                        <th className="px-3 py-2">Answered</th>
                        <th className="px-3 py-2">Correct</th>
                        <th className="px-3 py-2">Partial</th>
                        <th className="px-3 py-2">Wrong</th>
                        <th className="px-3 py-2">Score</th>
                        <th className="px-3 py-2">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedReportData.report.difficultyStats || []).map((difficulty, index) => (
                        <tr key={`report-difficulty-${index}`} className="border-t">
                          <td className="px-3 py-2 capitalize">{difficulty.difficulty || "medium"}</td>
                          <td className="px-3 py-2">{difficulty.questionCount ?? 0}</td>
                          <td className="px-3 py-2">{difficulty.answeredCount ?? 0}</td>
                          <td className="px-3 py-2">{difficulty.correctCount ?? 0}</td>
                          <td className="px-3 py-2">{difficulty.partialCount ?? 0}</td>
                          <td className="px-3 py-2">{difficulty.wrongCount ?? 0}</td>
                          <td className="px-3 py-2">{difficulty.score ?? 0}/{difficulty.maxScore ?? 0}</td>
                          <td className="px-3 py-2">{difficulty.percentage ?? 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded border">
                <div className="border-b bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">Per-Question Evaluation</p>
                </div>
                <div className="max-h-[320px] overflow-auto">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="sticky top-0 bg-white text-left text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Q No.</th>
                        <th className="px-3 py-2">Section</th>
                        <th className="px-3 py-2">Difficulty</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Correct Answers</th>
                        <th className="px-3 py-2">Student Answers</th>
                        <th className="px-3 py-2">Score</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedReportData.report.questionStats || []).map((question, index) => (
                        <tr key={`report-question-${index}`} className="border-t align-top">
                          <td className="px-3 py-2 font-medium">{question.questionNumber || index + 1}</td>
                          <td className="px-3 py-2">{question.sectionName || "Section"}</td>
                          <td className="px-3 py-2 capitalize">{question.difficulty || "medium"}</td>
                          <td className="px-3 py-2 capitalize">{question.type || "single"}</td>
                          <td className="px-3 py-2">{(question.correctAnswers || []).join(", ") || "-"}</td>
                          <td className="px-3 py-2">{(question.selectedAnswers || []).join(", ") || "-"}</td>
                          <td className="px-3 py-2">{question.scoreAwarded ?? 0}</td>
                          <td className="px-3 py-2 capitalize">{question.status || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(false)}
              disabled={reportActionSubmissionId !== null}
            >
              Close
            </Button>
            {selectedReportSubmission && (
              <Button
                onClick={() => handleGenerateReport(selectedReportSubmission, true)}
                disabled={reportActionSubmissionId !== null}
              >
                <Send className="mr-2 h-4 w-4" />
                {reportActionSubmissionId === selectedReportSubmission.id ? "Sending..." : "Send Report to Student"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Grade Submission: {selectedSubmission?.assignment.title}
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Student: {selectedSubmission?.student.name}
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="grade">Grade (out of {selectedSubmission?.assignment.totalPoints})</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max={selectedSubmission?.assignment.totalPoints}
                value={gradeData.grade}
                onChange={(e) => setGradeData({...gradeData, grade: e.target.value})}
                placeholder="Enter grade"
              />
            </div>

            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={gradeData.feedback}
                onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                placeholder="Provide feedback to the student..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)} disabled={isSavingGrade}>
              Cancel
            </Button>
            <Button onClick={submitGrade} disabled={isSavingGrade}>
              {isSavingGrade ? "Saving..." : "Save Grade"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
