"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Eye,
  Send,
  ChevronRight,
  TrendingUp,
  Target,
  Award,
  Bookmark,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ResourceLibrary from "@/components/student/ResourceLibrary";
import MentorMessages from "../../components/student/MentorMessages";
import ProgressReportList from "@/components/common/ProgressReportList";
import DashboardLoadingSkeleton, { ShimmerSkeleton } from "@/components/ui/dashboard-loading-skeleton";
import { getUserTimezone, formatDateTime, formatDate } from "@/lib/timezone";

// Mock data - replace with actual API calls
const mockUpcomingEvents = [
  { id: 1, title: "Math Tutoring Session", date: "2025-09-10", time: "3:00 PM", type: "tutoring" },
  { id: 2, title: "SAT Practice Test", date: "2025-09-12", time: "9:00 AM", type: "test" },
  { id: 3, title: "Science Fair Project Review", date: "2025-09-15", time: "2:00 PM", type: "review" },
];

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
  program: string;
  grade: string;
  dueDate: string;
  totalPoints: number;
  status: string;
  submissionId?: number | null;
  resources?: Array<any>; // Add this line to allow resources property
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

export default function StudentDashboard() {
  // Authentication - require student role
  const { user: authUser, isLoading: authLoading } = useRequireAuth('student');

  const [activeTab, setActiveTab] = useState("overview");
  const [student, setStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progressReports, setProgressReports] = useState<any[]>([]);
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

  // Fetch data function
  const fetchData = async () => {
    if (!studentEmail) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "Dashboard load timed out. Please retry."
          : err instanceof Error
            ? err.message
            : 'Failed to load dashboard data';
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
    if (!authLoading && authUser && studentEmail) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authUser, studentEmail]);

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
    const allowedTabs = new Set(["overview", "assignments", "submissions", "grades", "schedule", "progress", "resources", "messages"]);
    if (tab && allowedTabs.has(tab)) {
      setActiveTab(tab);
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
      badge: student ? student.stats.pendingAssignments : 0,
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
    return Math.round((grade / total) * 100);
  };

  // Check if assignment deadline has passed
  const isDeadlinePassed = (dueDate: string): boolean => {
    const deadline = new Date(dueDate);
    const now = new Date();
    return now > deadline;
  };

  // Check if submission can be resubmitted
  const canResubmit = (submission: Submission): boolean => {
    // Find the corresponding assignment
    const assignment = assignments.find(a => a.id === submission.assignmentId);
    if (!assignment) return false;

    // Can resubmit if deadline hasn't passed and submission is submitted (but not graded yet)
    return !isDeadlinePassed(assignment.dueDate) &&
      submission.status === 'submitted' &&
      submission.grade === null;
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
  const gradedSubmissions = submissions.filter((submission) => submission.grade !== null && submission.grade !== undefined).length;
  const quickMetrics = [
    { label: "Active Assignments", value: assignments.filter((assignment) => assignment.status === "active").length, icon: FileText },
    { label: "Pending", value: student?.stats?.pendingAssignments ?? 0, icon: Clock },
    { label: "Graded", value: gradedSubmissions, icon: Trophy },
    { label: "Unread Messages", value: messageUnreadCount, icon: MessageCircle },
  ];

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
                          value: assignments.filter((assignment) => assignment.status === "active").length,
                          helper: "Needs submission",
                          icon: FileText,
                        },
                        {
                          label: "Completed",
                          value: submissions.filter((submission) => submission.grade !== null && submission.grade !== undefined).length,
                          helper: "Already graded",
                          icon: CheckCircle,
                        },
                        {
                          label: "Average Grade",
                          value: submissions.filter((submission) => submission.grade !== null && submission.grade !== undefined).length > 0
                            ? `${Math.round(submissions
                              .filter((submission) => submission.grade !== null && submission.grade !== undefined)
                              .reduce((acc, submission) => acc + (submission.grade || 0), 0) /
                              submissions.filter((submission) => submission.grade !== null && submission.grade !== undefined).length)}%`
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
                          <CardDescription>What is coming next in your schedule.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {mockUpcomingEvents.map((event) => (
                            <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {new Date(event.date).toLocaleDateString()} at {event.time}
                                  </p>
                                </div>
                                <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700">
                                  {event.type}
                                </Badge>
                              </div>
                            </div>
                          ))}
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
                        const deadlinePassed = isDeadlinePassed(assignment.dueDate);
                        const canResubmitAssignment = existingSubmission &&
                          !deadlinePassed &&
                          existingSubmission.grade === null;

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
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-lg font-semibold">{assignment.title}</h3>
                                      {existingSubmission ? getStatusBadge(existingSubmission.status) : getStatusBadge("pending")}
                                    </div>
                                    <p className="text-gray-600 mb-3">{assignment.description}</p>

                                    {/* Resource indicator */}
                                    {assignment.resources && assignment.resources.length > 0 && (
                                      <div className="flex items-center gap-2 mb-3">
                                        <BookOpen className="h-4 w-4 text-slate-500" />
                                        <span className="text-sm text-slate-600">
                                          {assignment.resources.length} resource{assignment.resources.length !== 1 ? 's' : ''} available
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2 text-xs"
                                          onClick={() => setActiveTab("resources")}
                                        >
                                          View Resources
                                        </Button>
                                      </div>
                                    )}
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
                                        <span className="flex items-center gap-1 text-red-600">
                                          <AlertCircle className="h-4 w-4" />
                                          Deadline passed
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 text-slate-700">
                                          <CheckCircle className="h-4 w-4" />
                                          Still accepting submissions
                                        </span>
                                      )}

                                      {existingSubmission && (
                                        <span className="text-gray-500">
                                          • Submitted on {existingSubmission.submittedAt}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    {/* Submit button for new assignments */}
                                    {!existingSubmission && !deadlinePassed && (
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
                                    {canResubmitAssignment && (
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
                                    {existingSubmission && existingSubmission.grade !== undefined && (
                                      <div className="text-center">
                                        <Badge variant="secondary" className="bg-slate-200 text-slate-800">
                                          <Trophy className="h-3 w-3 mr-1" />
                                          Graded: {existingSubmission.grade}/{assignment.totalPoints}
                                        </Badge>
                                      </div>
                                    )}

                                    {deadlinePassed && existingSubmission && existingSubmission.grade === undefined && (
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
                        const deadlinePassed = assignment ? isDeadlinePassed(assignment.dueDate) : true;

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
                                        {deadlinePassed && <span className="text-red-500 ml-2">(Submitted after deadline)</span>}
                                        {!deadlinePassed && <span className="text-slate-500 ml-2">(Submitted on time)</span>}
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
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Written Response:</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{submission.content}</p>
                                    </div>
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
                                      <span className={cn("text-lg font-bold", getGradeColor(calculateGradePercentage(submission.grade, assignment.totalPoints)))}>
                                        {submission.grade}/{assignment.totalPoints} ({calculateGradePercentage(submission.grade, assignment.totalPoints)}%)
                                      </span>
                                    </div>
                                    <Progress
                                      value={calculateGradePercentage(submission.grade, assignment.totalPoints)}
                                      className="h-2"
                                    />
                                  </div>
                                )}

                                {/* Teacher Feedback */}
                                {submission.feedback && (
                                  <div className="bg-slate-100 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-slate-900 mb-1">Teacher Feedback:</p>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{submission.feedback}</p>
                                  </div>
                                )}

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
                                {student?.stats?.averageGrade
                                  ? student.stats.averageGrade >= 90 ? 'A'
                                    : student.stats.averageGrade >= 80 ? 'B'
                                      : student.stats.averageGrade >= 70 ? 'C'
                                        : student.stats.averageGrade >= 60 ? 'D'
                                          : 'F'
                                  : 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Current Grade</div>
                              <Progress value={student?.stats?.averageGrade || 0} className="h-3" />
                              <div className="text-xs text-gray-500">
                                {student?.stats?.averageGrade ? `${student.stats.averageGrade}% Average` : 'No grades yet'}
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
                                {student?.stats?.gradedSubmissions || 0}/{student?.stats?.totalSubmissions || 0}
                              </div>
                              <div className="text-sm text-gray-600">Graded Assignments</div>
                              <Progress
                                value={student?.stats?.totalSubmissions
                                  ? (student.stats.gradedSubmissions / student.stats.totalSubmissions) * 100
                                  : 0
                                }
                                className="h-3"
                              />
                              <div className="text-xs text-gray-500">
                                {student?.stats?.totalSubmissions
                                  ? Math.round((student.stats.gradedSubmissions / student.stats.totalSubmissions) * 100)
                                  : 0}% Graded
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
                                {student?.stats?.pendingAssignments || 0}
                              </div>
                              <div className="text-sm text-gray-600">Due Soon</div>
                              <div className={cn(
                                "text-xs font-medium",
                                (student?.stats?.pendingAssignments || 0) > 0 ? "text-slate-700" : "text-slate-600"
                              )}>
                                {(student?.stats?.pendingAssignments || 0) > 0
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
                                      <Progress value={item.percentage} className="h-2" />
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
                      <Button className="bg-slate-900 text-white hover:bg-slate-800">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Session
                      </Button>
                    </div>

                    {/* StudentScheduleView Component */}
                    {studentEmail && (() => {
                      const StudentScheduleView = require("../../components/student/StudentScheduleView").default;
                      return <StudentScheduleView studentEmail={studentEmail} />;
                    })()}
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
                                    value={counts.total > 0 ? (counts.completed / counts.total) * 100 : 0}
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
                                {submissions.length > 0
                                  ? `Last submission: ${new Date(
                                    submissions.sort((a, b) =>
                                      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                                    )[0]?.submittedAt
                                  ).toLocaleDateString()}`
                                  : 'No submissions yet'
                                }
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
                      <CardDescription>Browse teacher-shared materials for your coursework.</CardDescription>
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
              </motion.div>
            )}
          </div>
        </SidebarInset>
      </div>

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
