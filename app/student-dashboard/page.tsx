"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmissionId, setResubmissionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const { toast } = useToast();
  
  // Get student email from authenticated user
  const studentEmail = authUser?.email || "";

  // Fetch data function
  const fetchData = async () => {
    if (!studentEmail) return;
    
    try {
      setLoading(true);
      
      // Fetch student dashboard data
      const response = await fetch(`/api/student/dashboard?studentEmail=${encodeURIComponent(studentEmail)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch student data');
      }
      
      setStudent(data.student);
      setAssignments(data.assignments);
      setSubmissions(data.submissions);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
      console.error("Error fetching data:", err);
      toast({
        variant: "destructive",
        title: "Failed to load dashboard",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data - Move this hook before any conditional returns
  useEffect(() => {
    // Only fetch data if we have a student email and auth is complete
    if (!authLoading && authUser && studentEmail) {
      fetchData();
    }
  }, [authLoading, authUser, studentEmail]);

  // Early return for authentication loading
  if (authLoading || !authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

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
      case "active":
        return <Badge variant="outline" className="bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800 border-2 border-purple-400 font-bold shadow-md">✨ Active</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-gradient-to-r from-green-200 to-teal-200 text-green-800 border-2 border-green-400 font-bold shadow-md">🏆 Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gradient-to-r from-gray-200 to-slate-200 text-gray-800 border-2 border-gray-400 font-bold">{status}</Badge>;
    }
  };

  const handleSubmission = async () => {
    if (!selectedAssignment || !student) return;
    
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

        // Reset form
        setSelectedAssignment(null);
        setSubmissionText("");
        setSubmissionFile(null);
        setIsResubmitting(false);
        setResubmissionId(null);

        toast({
          title: isResubmitting ? "Submission updated" : "Assignment submitted",
          description: isResubmitting
            ? "Your updated work has been sent to your mentor."
            : "Your assignment has been submitted successfully.",
          className: "border-green-500 bg-green-50 text-green-900",
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
    }
  };

  const handleResubmission = async (submission: Submission) => {
    if (!student) return;
    
    // Find the corresponding assignment
    const assignment = assignments.find(a => a.id === submission.assignmentId);
    if (!assignment) return;
    
    // Set up for resubmission
    setSelectedAssignment(assignment);
    setSubmissionText(submission.content || "");
    setSubmissionFile(null); // Reset file, user will need to reupload
    setIsResubmitting(true);
    setResubmissionId(submission.id);
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
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading student dashboard...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
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
      <div className="flex min-h-screen w-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <Sidebar variant="inset" className="border-r-2 border-purple-200 bg-gradient-to-b from-white via-pink-50/30 to-purple-50/30">
          <SidebarHeader className="border-b-2 border-purple-200 p-4 bg-gradient-to-r from-pink-100 to-purple-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-purple-300 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white font-bold text-lg">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-purple-900 truncate">
                  {student.name}
                </p>
                <p className="text-xs text-purple-700 truncate font-medium">
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
                  {sidebarItems.slice(0, 4).map((item, idx) => {
                    const colors = [
                      "from-pink-500 to-purple-500",
                      "from-purple-500 to-blue-500",
                      "from-blue-500 to-cyan-500",
                      "from-green-500 to-teal-500"
                    ];
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={item.isActive}
                          onClick={item.onClick}
                          className={cn(
                            "w-full transition-all hover:scale-105",
                            item.isActive 
                              ? `bg-gradient-to-r ${colors[idx]} text-white shadow-lg font-bold` 
                              : "hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 text-purple-700"
                          )}
                        >
                          <item.icon className={cn("h-5 w-5", item.isActive ? "text-white" : "text-purple-600")} />
                          <span className="font-semibold">{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge className={item.isActive ? "bg-white text-purple-600" : "bg-purple-200 text-purple-800"}>
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
                  {sidebarItems.slice(4, 7).map((item, idx) => {
                    const colors = [
                      "from-orange-500 to-red-500",
                      "from-teal-500 to-green-500",
                      "from-indigo-500 to-purple-500"
                    ];
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={item.isActive}
                          onClick={item.onClick}
                          className={cn(
                            "w-full transition-all hover:scale-105",
                            item.isActive 
                              ? `bg-gradient-to-r ${colors[idx]} text-white shadow-lg font-bold` 
                              : "hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 text-purple-700"
                          )}
                        >
                          <item.icon className={cn("h-5 w-5", item.isActive ? "text-white" : "text-orange-600")} />
                          <span className="font-semibold">{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge className={item.isActive ? "bg-white text-orange-600" : "bg-orange-200 text-orange-800"}>
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
                  {sidebarItems.slice(7).map((item, idx) => {
                    const colors = [
                      "from-cyan-500 to-blue-500",
                      "from-pink-500 to-rose-500"
                    ];
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={item.isActive}
                          onClick={item.onClick}
                          className={cn(
                            "w-full transition-all hover:scale-105",
                            item.isActive 
                              ? `bg-gradient-to-r ${colors[idx]} text-white shadow-lg font-bold` 
                              : "hover:bg-gradient-to-r hover:from-cyan-100 hover:to-blue-100 text-purple-700"
                          )}
                        >
                          <item.icon className={cn("h-5 w-5", item.isActive ? "text-white" : "text-cyan-600")} />
                          <span className="font-semibold">{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge className={item.isActive ? "bg-white text-cyan-600" : "bg-cyan-200 text-cyan-800"}>
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

          <SidebarFooter className="border-t-2 border-purple-200 p-4 bg-gradient-to-r from-pink-50/50 to-purple-50/50">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 text-purple-700 font-semibold transition-all hover:scale-105">
                  <Settings className="h-5 w-5 text-purple-600" />
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
                  className="text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 font-semibold transition-all hover:scale-105"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b-2 border-purple-200 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 px-4 shadow-sm">
            <SidebarTrigger className="-ml-1 text-purple-700 hover:text-purple-900" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-purple-300" />
            <div className="flex-1">
              <h1 className="text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                🎓 Student Dashboard
              </h1>
            </div>
            <Button variant="ghost" size="sm" className="hover:bg-purple-200 rounded-full">
              <Bell className="h-5 w-5 text-purple-600" />
            </Button>
          </header>

          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span>Loading dashboard...</span>
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
              >
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Welcome Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-6 text-white shadow-xl"
                  >
                    <div className="absolute top-0 right-0 text-6xl opacity-20">🎉</div>
                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold mb-2">Hey {student.name.split(' ')[0]}! 👋</h2>
                      <p className="text-pink-100">Ready to learn something awesome today?</p>
                    </div>
                  </motion.div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                    >
                      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-blue-700">Active Assignments</p>
                              <p className="text-3xl font-bold text-blue-900">{assignments.filter(a => a.status === "active").length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.05, rotate: -2 }}
                    >
                      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                              <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-green-700">Completed 🎉</p>
                              <p className="text-3xl font-bold text-green-900">{submissions.filter(s => s.grade !== null && s.grade !== undefined).length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                    >
                      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
                              <Star className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-purple-700">Average Grade</p>
                              <p className="text-3xl font-bold text-purple-900">
                                {submissions.filter(s => s.grade !== null && s.grade !== undefined).length > 0 
                                  ? Math.round(submissions.filter(s => s.grade !== null && s.grade !== undefined)
                                      .reduce((acc, s) => acc + (s.grade || 0), 0) / 
                                      submissions.filter(s => s.grade !== null && s.grade !== undefined).length) + '%'
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05, rotate: -2 }}
                    >
                      <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
                              <Award className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-orange-700">Achievements</p>
                              <p className="text-3xl font-bold text-orange-900">⭐</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Assignments */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white hover:shadow-xl transition-all">
                        <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-t-lg">
                          <CardTitle className="flex items-center gap-2 text-purple-800">
                            <FileText className="h-6 w-6 text-pink-600" />
                            📝 Recent Assignments
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {assignments.slice(0, 3).map((assignment, idx) => (
                              <motion.div
                                key={assignment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + idx * 0.1 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="flex items-center justify-between p-4 border-2 border-pink-200 rounded-xl bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all cursor-pointer"
                              >
                                <div className="flex-1">
                                  <p className="font-bold text-sm text-gray-800">{assignment.title}</p>
                                  <p className="text-xs text-gray-600 mt-1">{assignment.subject} • Due {assignment.dueDate}</p>
                                </div>
                                {getStatusBadge(assignment.status)}
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Upcoming Events */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all">
                        <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-t-lg">
                          <CardTitle className="flex items-center gap-2 text-blue-800">
                            <Calendar className="h-6 w-6 text-blue-600" />
                            📅 Upcoming Events
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {assignments.slice(0, 3).map((assignment, idx) => (
                              <motion.div
                                key={assignment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + idx * 0.1 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-xl bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all cursor-pointer"
                              >
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <Calendar className="h-7 w-7 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-sm text-gray-800">{assignment.title}</p>
                                  <p className="text-xs text-gray-600 mt-1">Due {assignment.dueDate}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      📚 Assignments
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
                        whileHover={{ scale: 1.02 }}
                      >
                      <Card className="border-2 border-purple-200 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30 hover:shadow-xl transition-all">
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
                                  <BookOpen className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm text-blue-600">
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
                                    • Submitted on {existingSubmission.submittedAt}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {/* Submit button for new assignments */}
                              {!existingSubmission && !deadlinePassed && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      onClick={() => {
                                        setSelectedAssignment(assignment);
                                        setIsResubmitting(false);
                                        setResubmissionId(null);
                                      }}
                                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition-all"
                                    >
                                      <Send className="h-4 w-4 mr-2" />
                                      Submit Assignment 🚀
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
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setSelectedAssignment(assignment);
                                        setSubmissionText(existingSubmission.content || "");
                                        setSubmissionFile(null);
                                        setIsResubmitting(true);
                                        setResubmissionId(existingSubmission.id);
                                      }}
                                      className="border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 text-orange-700 font-bold hover:scale-105 transition-all"
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Resubmit 🔄
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Resubmit Assignment: {selectedAssignment?.title}</DialogTitle>
                                      <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg mt-2">
                                        ⚠️ Your previous submission will be replaced with this new one.
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
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
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
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                      ✨ My Submissions
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
                          whileHover={{ scale: 1.01 }}
                        >
                        <Card className="border-2 border-green-200 bg-gradient-to-br from-white via-green-50/30 to-teal-50/30 hover:shadow-xl transition-all">
                        <CardContent className="p-6">
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
                              {assignment && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                  {deadlinePassed && <span className="text-red-500 ml-2">(Submitted after deadline)</span>}
                                  {!deadlinePassed && <span className="text-green-500 ml-2">(Submitted on time)</span>}
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
                        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                          <CardContent className="p-12 text-center">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-2xl font-bold text-purple-800 mb-2">No Submissions Yet</h3>
                            <p className="text-purple-600 mb-6 text-lg">
                              You haven&apos;t submitted any assignments yet. Let&apos;s get started! 🚀
                            </p>
                            <Button 
                              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition-all"
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
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                      🏆 Grades & Performance
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all">
                        <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-t-lg">
                          <CardTitle className="flex items-center gap-2 text-orange-800">
                            <Trophy className="h-6 w-6 text-yellow-600" />
                            Overall Performance
                          </CardTitle>
                        </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-green-600">
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
                      whileHover={{ scale: 1.05 }}
                    >
                    <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all">
                      <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                          <Target className="h-6 w-6 text-blue-600" />
                          Assignments Completed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-blue-600">
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
                      whileHover={{ scale: 1.05 }}
                    >
                    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all">
                      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-purple-800">
                          <TrendingUp className="h-6 w-6 text-purple-600" />
                          Pending Assignments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-purple-600">
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
                      </CardContent>
                    </Card>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                  <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white hover:shadow-xl transition-all">
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
                    <h2 className="text-2xl font-bold">Schedule & Events</h2>
                    <Button>
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
                  <h2 className="text-2xl font-bold">Academic Progress</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
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
                            }, {} as Record<string, {total: number, completed: number}>);
                            
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

                    <Card>
                      <CardHeader>
                        <CardTitle>Assignment Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Assignment counts */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                              <div className="text-3xl font-bold text-blue-600">
                                {submissions.length}
                              </div>
                              <div className="text-sm text-gray-600">
                                Submissions
                              </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                              <div className="text-3xl font-bold text-green-600">
                                {submissions.filter(s => s.status === "graded").length}
                              </div>
                              <div className="text-sm text-gray-600">
                                Completed
                              </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg text-center">
                              <div className="text-3xl font-bold text-yellow-600">
                                {assignments.filter(a => 
                                  !submissions.some(s => s.assignmentId === a.id)
                                ).length}
                              </div>
                              <div className="text-sm text-gray-600">
                                Pending
                              </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg text-center">
                              <div className="text-3xl font-bold text-purple-600">
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
                </div>
              )}

              {activeTab === "resources" && (
                <ResourceLibrary studentEmail={studentEmail} />
              )}

              {activeTab === "messages" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Messages</h2>
                  </div>
                  
                  {/* Import and use our MentorMessages component */}
                  {student && (
                    <MentorMessages 
                      studentId={student.id}
                      studentEmail={student.email}
                      studentName={student.name}
                      onUnreadCountChange={setMessageUnreadCount}
                    />
                  )}
                </div>
              )}
              </motion.div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
