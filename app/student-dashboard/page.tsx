"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  BookOpen,
  FileText,
  Trophy,
  Calendar,
  Upload,
  Star,
  MessageCircle,
  Bell,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Send,
  TrendingUp,
  Target,
  Award,
  RefreshCw,
  LogOut,
  Sparkles,
  Zap,
  Rocket,
  Heart,
  Clock,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ResourceLibrary from "@/components/student/ResourceLibrary";
import MentorMessages from "../../components/student/MentorMessages";

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
  resources?: Array<any>;
}

interface Submission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  assignmentSubject: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  submittedAt: string;
  grade?: number | null;
  totalPoints: number;
  feedback?: string;
  status: string;
}

export default function StudentDashboard() {
  const { user: authUser, isLoading: authLoading } = useRequireAuth('student');
  const [activeTab, setActiveTab] = useState("overview");
  const [student, setStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  
  const studentEmail = authUser?.email || "";

  const fetchData = async () => {
    if (!studentEmail) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/student/dashboard?studentEmail=${encodeURIComponent(studentEmail)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch student data');
      }
      
      setStudent(data.student);
      setAssignments(data.assignments);
      setSubmissions(data.submissions);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({
        variant: "destructive",
        title: "Failed to load dashboard",
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && authUser && studentEmail) {
      fetchData();
    }
  }, [authLoading, authUser, studentEmail]);

  if (authLoading || !authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-purple-600 font-semibold">Loading your learning space...</p>
        </motion.div>
      </div>
    );
  }

  const sidebarItems = [
    {
      title: "Home",
      icon: Home,
      tab: "overview",
      color: "from-purple-500 to-pink-500",
      emoji: "🏠",
    },
    {
      title: "Assignments",
      icon: FileText,
      tab: "assignments",
      color: "from-blue-500 to-cyan-500",
      badge: student?.stats.pendingAssignments || 0,
      emoji: "📝",
    },
    {
      title: "Submissions",
      icon: Upload,
      tab: "submissions",
      color: "from-green-500 to-emerald-500",
      emoji: "✅",
    },
    {
      title: "Grades",
      icon: Trophy,
      tab: "grades",
      color: "from-yellow-500 to-orange-500",
      emoji: "🏆",
    },
    {
      title: "Schedule",
      icon: Calendar,
      tab: "schedule",
      color: "from-red-500 to-pink-500",
      emoji: "📅",
    },
    {
      title: "Resources",
      icon: BookOpen,
      tab: "resources",
      color: "from-indigo-500 to-purple-500",
      emoji: "📚",
    },
    {
      title: "Messages",
      icon: MessageCircle,
      tab: "messages",
      color: "from-teal-500 to-green-500",
      badge: messageUnreadCount,
      emoji: "💬",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-x-hidden">
      {/* Top Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo & Welcome */}
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Hey, {student?.name?.split(' ')[0] || 'Student'}! 👋
                </h1>
                <p className="text-xs text-gray-500">Ready to learn something amazing?</p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg"
              >
                <Bell className="w-5 h-5" />
                {messageUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                    {messageUnreadCount}
                  </span>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg"
              >
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">{student?.stats.averageGrade || 0}%</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="flex max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 gap-3 sm:gap-6 min-h-[calc(100vh-6rem)] overflow-x-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="fixed lg:sticky top-20 left-0 h-[calc(100vh-6rem)] w-64 sm:w-72 bg-white/80 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-2xl border border-purple-100 z-40 lg:z-auto overflow-y-auto flex-shrink-0 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100 hover:scrollbar-thumb-purple-500"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgb(192, 132, 252) rgb(243, 232, 255)'
              }}
            >
              <div className="space-y-2">
                {sidebarItems.map((item, index) => (
                  <motion.button
                    key={item.tab}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveTab(item.tab);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group",
                      activeTab === item.tab
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity",
                      `bg-gradient-to-r ${item.color}`
                    )} />
                    
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-semibold relative z-10">{item.title}</span>
                    
                    {item.badge && item.badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold relative z-10"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                    
                    {activeTab === item.tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute right-2 w-2 h-2 rounded-full bg-white"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main 
          className="flex-1 min-w-0 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-pink-100 hover:scrollbar-thumb-pink-500 overflow-x-hidden"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(244, 114, 182) rgb(252, 231, 243)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <OverviewTab student={student} assignments={assignments} submissions={submissions} />
              )}
              {activeTab === "assignments" && (
                <AssignmentsTab
                  assignments={assignments}
                  submissions={submissions}
                  onSelectAssignment={(assignment: Assignment) => {
                    setSelectedAssignment(assignment);
                    setSubmissionText("");
                    setSubmissionFile(null);
                  }}
                  selectedAssignment={selectedAssignment}
                  submissionText={submissionText}
                  setSubmissionText={setSubmissionText}
                  submissionFile={submissionFile}
                  setSubmissionFile={setSubmissionFile}
                  isSubmitting={isSubmitting}
                  onSubmit={async () => {
                    // Handle submission logic here
                    toast({
                      title: "Assignment submitted!",
                      description: "Your work has been submitted successfully.",
                    });
                  }}
                />
              )}
              {activeTab === "submissions" && (
                <SubmissionsTab submissions={submissions} />
              )}
              {activeTab === "grades" && (
                <GradesTab submissions={submissions} student={student} />
              )}
              {activeTab === "schedule" && (
                <ScheduleTab studentEmail={studentEmail} />
              )}
              {activeTab === "resources" && (
                <ResourcesTab studentEmail={studentEmail} />
              )}
              {activeTab === "messages" && student && (
                <MessagesTab student={student} onUnreadCountChange={setMessageUnreadCount} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ student, assignments, submissions }: { student: Student | null, assignments: Assignment[], submissions: Submission[] }) {
  const pendingAssignments = assignments.filter(a => !a.submissionId);
  const recentSubmissions = submissions.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-8 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Welcome Back!</h2>
          </div>
          <p className="text-white/90 text-lg mb-6">
            You&apos;re doing amazing! Keep up the great work and let&apos;s achieve something incredible today! 🌟
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <div className="text-sm opacity-90">Grade</div>
              <div className="text-2xl font-bold">{student?.grade}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <div className="text-sm opacity-90">Program</div>
              <div className="text-2xl font-bold">{student?.program}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <div className="text-sm opacity-90">School</div>
              <div className="text-lg font-bold">{student?.schoolName}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Tasks", value: student?.stats.pendingAssignments || 0, icon: Clock, color: "from-blue-500 to-cyan-500", emoji: "⏰" },
          { label: "Completed", value: student?.stats.totalSubmissions || 0, icon: CheckCircle, color: "from-green-500 to-emerald-500", emoji: "✅" },
          { label: "Average Score", value: `${student?.stats.averageGrade || 0}%`, icon: Trophy, color: "from-yellow-500 to-orange-500", emoji: "🏆" },
          { label: "Graded", value: student?.stats.gradedSubmissions || 0, icon: Star, color: "from-purple-500 to-pink-500", emoji: "⭐" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={cn(
              "relative overflow-hidden rounded-2xl p-6 text-white shadow-xl",
              `bg-gradient-to-br ${stat.color}`
            )}
          >
            <div className="absolute top-0 right-0 text-6xl opacity-20">{stat.emoji}</div>
            <stat.icon className="w-8 h-8 mb-3 relative z-10" />
            <div className="text-3xl font-bold mb-1 relative z-10">{stat.value}</div>
            <div className="text-sm opacity-90 relative z-10">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Assignments & Recent Work */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Upcoming Tasks</h3>
          </div>
          
          <ScrollArea className="h-64">
            {pendingAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <CheckCircle className="w-16 h-16 mb-2" />
                <p>All caught up! Great job! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 5).map((assignment) => (
                  <motion.div
                    key={assignment.id}
                    whileHover={{ x: 4 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                        <p className="text-sm text-gray-600">{assignment.subject}</p>
                      </div>
                      <Badge className="bg-blue-500 text-white">
                        {assignment.totalPoints} pts
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </motion.div>

        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Recent Work</h3>
          </div>
          
          <ScrollArea className="h-64">
            {recentSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Upload className="w-16 h-16 mb-2" />
                <p>No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <motion.div
                    key={submission.id}
                    whileHover={{ x: 4 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{submission.assignmentTitle}</h4>
                        <p className="text-sm text-gray-600">{submission.assignmentSubject}</p>
                      </div>
                      {submission.grade !== null && submission.grade !== undefined ? (
                        <div className="flex flex-col items-end">
                          <div className="text-2xl font-bold text-green-600">
                            {submission.grade}
                          </div>
                          <div className="text-xs text-gray-500">
                            /{submission.totalPoints}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
}

// Placeholder components for other tabs (you can expand these)
function AssignmentsTab({
  assignments,
  submissions,
  onSelectAssignment,
  selectedAssignment,
  submissionText,
  setSubmissionText,
  submissionFile,
  setSubmissionFile,
  isSubmitting,
  onSubmit
}: {
  assignments: Assignment[];
  submissions: Submission[];
  onSelectAssignment?: (assignment: Assignment) => void;
  selectedAssignment?: Assignment | null;
  submissionText?: string;
  setSubmissionText?: (text: string) => void;
  submissionFile?: File | null;
  setSubmissionFile?: (file: File | null) => void;
  isSubmitting?: boolean;
  onSubmit?: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [isResubmitting, setIsResubmitting] = React.useState(false);
  const [resubmissionId, setResubmissionId] = React.useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-gradient-to-r from-yellow-200 to-orange-200 text-yellow-800 border-2 border-yellow-400 font-bold shadow-md">⏳ Pending</Badge>;
      case "submitted":
        return <Badge variant="outline" className="bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-800 border-2 border-blue-400 font-bold shadow-md">✅ Submitted</Badge>;
      case "graded":
        return <Badge variant="outline" className="bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border-2 border-green-400 font-bold shadow-md">🎉 Graded</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-gradient-to-r from-red-200 to-pink-200 text-red-800 border-2 border-red-400 font-bold shadow-md">⚠️ Overdue</Badge>;
      default:
        return <Badge variant="outline" className="bg-gradient-to-r from-gray-200 to-slate-200 text-gray-800 border-2 border-gray-400 font-bold">{status}</Badge>;
    }
  };

  const isDeadlinePassed = (dueDate: string): boolean => {
    const deadline = new Date(dueDate);
    const now = new Date();
    return now > deadline;
  };

  return (
    <div className="space-y-6">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2"
      >
        📚 My Assignments
      </motion.h2>

      <div className="grid gap-4">
        {assignments.map((assignment, index) => {
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
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-purple-200 hover:shadow-2xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{assignment.title}</h3>
                    {existingSubmission ? getStatusBadge(existingSubmission.status) : getStatusBadge("pending")}
                  </div>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {assignment.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {assignment.dueDate}
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
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Still accepting submissions
                      </span>
                    )}
                    
                    {existingSubmission && (
                      <span className="text-gray-500">
                        • Submitted on {new Date(existingSubmission.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {/* Submit button for new assignments */}
                  {!existingSubmission && !deadlinePassed && onSelectAssignment && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => onSelectAssignment(assignment)}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition-all"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit 🚀
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
                              onChange={(e) => setSubmissionText?.(e.target.value)}
                              rows={6}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="file">File Upload (Optional)</Label>
                            <Input
                              id="file"
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                              onChange={(e) => setSubmissionFile?.(e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-gray-500">
                              Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={onSubmit}
                            disabled={isSubmitting || (!submissionText?.trim() && !submissionFile)}
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
                  
                  {/* Status indicators for completed/graded submissions */}
                  {existingSubmission && existingSubmission.grade !== undefined && existingSubmission.grade !== null && (
                    <div className="text-center">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Trophy className="h-3 w-3 mr-1" />
                        Graded: {existingSubmission.grade}/{assignment.totalPoints}
                      </Badge>
                    </div>
                  )}
                  
                  {deadlinePassed && existingSubmission && (existingSubmission.grade === undefined || existingSubmission.grade === null) && (
                    <div className="text-center">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Awaiting Grade
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {assignments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center shadow-xl border-2 border-purple-200"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-purple-800 mb-2">No Assignments Yet</h3>
            <p className="text-purple-600 text-lg">
              Your mentor will assign tasks soon. Stay tuned! 🌟
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SubmissionsTab({ submissions }: { submissions: Submission[] }) {
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-gradient-to-r from-yellow-200 to-orange-200 text-yellow-800 border-2 border-yellow-400 font-bold shadow-md">⏳ Pending</Badge>;
      case "submitted":
        return <Badge variant="outline" className="bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-800 border-2 border-blue-400 font-bold shadow-md">✅ Submitted</Badge>;
      case "graded":
        return <Badge variant="outline" className="bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border-2 border-green-400 font-bold shadow-md">🎉 Graded</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-gradient-to-r from-red-200 to-pink-200 text-red-800 border-2 border-red-400 font-bold shadow-md">⚠️ Overdue</Badge>;
      default:
        return <Badge variant="outline" className="bg-gradient-to-r from-gray-200 to-slate-200 text-gray-800 border-2 border-gray-400 font-bold">{status}</Badge>;
    }
  };

  const calculateGradePercentage = (grade: number, total: number) => {
    return Math.round((grade / total) * 100);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2"
      >
        ✨ My Submissions
      </motion.h2>

      <div className="grid gap-4">
        {submissions.map((submission, index) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-green-200 hover:shadow-2xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{submission.assignmentTitle}</h3>
                <p className="text-sm text-gray-600">
                  Submitted on {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {submission.assignmentSubject}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {submission.totalPoints} points
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Submission #{submission.id}
                  </span>
                </div>
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
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">{submission.fileName}</p>
                        {submission.fileSize && (
                          <p className="text-xs text-blue-700">
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
            {submission.grade !== null && submission.grade !== undefined && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Grade:</span>
                  <span className={cn("text-lg font-bold", getGradeColor(calculateGradePercentage(submission.grade, submission.totalPoints)))}>
                    {submission.grade}/{submission.totalPoints} ({calculateGradePercentage(submission.grade, submission.totalPoints)}%)
                  </span>
                </div>
                <Progress 
                  value={calculateGradePercentage(submission.grade, submission.totalPoints)} 
                  className="h-2"
                />
              </div>
            )}

            {/* Teacher Feedback */}
            {submission.feedback && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Teacher Feedback:</p>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{submission.feedback}</p>
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
          </motion.div>
        ))}

        {submissions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center shadow-xl border-2 border-purple-200"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-purple-800 mb-2">No Submissions Yet</h3>
            <p className="text-purple-600 mb-6 text-lg">
              You haven&apos;t submitted any assignments yet. Let&apos;s get started! 🚀
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function GradesTab({ submissions, student }: { submissions: Submission[], student: Student | null }) {
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
    }, {} as Record<string, {total: number, count: number, totalPoints: number, earnedPoints: number}>);

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

  return (
    <div className="space-y-6">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2"
      >
        🏆 Grades & Performance
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50"
        >
          <div className="flex items-center gap-2 mb-4 text-orange-800">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <h3 className="font-bold">Overall Performance</h3>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-green-600">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50"
        >
          <div className="flex items-center gap-2 mb-4 text-blue-800">
            <Target className="h-6 w-6 text-blue-600" />
            <h3 className="font-bold">Assignments Completed</h3>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-blue-600">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50"
        >
          <div className="flex items-center gap-2 mb-4 text-purple-800">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <h3 className="font-bold">Pending Assignments</h3>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-purple-600">
              {student?.stats?.pendingAssignments || 0}
            </div>
            <div className="text-sm text-gray-600">Due Soon</div>
            <div className={cn(
              "text-xs font-medium",
              (student?.stats?.pendingAssignments || 0) > 0 ? "text-orange-600" : "text-green-600"
            )}>
              {(student?.stats?.pendingAssignments || 0) > 0 
                ? '⚠ Action Required' 
                : '✓ All Caught Up'}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-indigo-200"
      >
        <h3 className="text-xl font-bold mb-6">Grade Breakdown by Subject</h3>
        <div className="space-y-4">
          {subjectArray.length > 0 ? (
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
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ScheduleTab({ studentEmail }: { studentEmail: string }) {
  const StudentScheduleView = require("../../components/student/StudentScheduleView").default;
  
  return (
    <div className="space-y-6">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2"
      >
        📅 My Schedule
      </motion.h2>
      <StudentScheduleView studentEmail={studentEmail} />
    </div>
  );
}

function ResourcesTab({ studentEmail }: { studentEmail: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-100">
      <h2 className="text-2xl font-bold mb-4">Learning Resources</h2>
      <ResourceLibrary studentEmail={studentEmail} />
    </div>
  );
}

function MessagesTab({ student, onUnreadCountChange }: { student: Student, onUnreadCountChange: (count: number) => void }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-100">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      <MentorMessages 
        studentId={student.id} 
        studentEmail={student.email} 
        studentName={student.name}
        onUnreadCountChange={onUnreadCountChange} 
      />
    </div>
  );
}
