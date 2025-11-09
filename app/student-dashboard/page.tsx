"use client";

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "../../contexts/AuthContext";
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
  const [error, setError] = useState("");
  
  // Get student email from authenticated user
  const studentEmail = authUser?.email || "";

  // Fetch initial data - Move this hook before any conditional returns
  useEffect(() => {
    // Only fetch data if we have a student email and auth is complete
    if (!authLoading && authUser && studentEmail) {
      const fetchData = async () => {
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
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
          console.error("Error fetching data:", err);
        } finally {
          setLoading(false);
        }
      };

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
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "submitted":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Submitted</Badge>;
      case "graded":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Graded</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          // Method 1: Try direct upload with presigned URL
          const presignedResponse = await fetch('/api/r2-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studentId: student.id,
              assignmentId: selectedAssignment.id,
              fileName: submissionFile.name,
              fileType: submissionFile.type,
              fileSize: submissionFile.size,
            }),
          });
          
          const presignedData = await presignedResponse.json();
          
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
      } else {
        throw new Error(submissionData.error || 'Submission failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      console.error("Error submitting assignment:", err);
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
      badge: 3,
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
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar variant="inset">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {student.name}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
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
                  {sidebarItems.slice(0, 4).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={item.isActive}
                        onClick={item.onClick}
                        className="w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>Academic Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.slice(4, 7).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={item.isActive}
                        onClick={item.onClick}
                        className="w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>Communication</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.slice(7).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={item.isActive}
                        onClick={item.onClick}
                        className="w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Student Dashboard</h1>
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
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
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Active Assignments</p>
                            <p className="text-2xl font-bold">{assignments.filter(a => a.status === "active").length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Trophy className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-2xl font-bold">{submissions.filter(s => s.grade !== null && s.grade !== undefined).length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <GraduationCap className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Average Grade</p>
                            <p className="text-2xl font-bold">
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

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Next Session</p>
                            <p className="text-sm font-medium">Sep 10, 3:00 PM</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Assignments */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Recent Assignments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {assignments.slice(0, 3).map((assignment) => (
                            <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{assignment.title}</p>
                                <p className="text-xs text-gray-600">{assignment.subject} • Due {assignment.dueDate}</p>
                              </div>
                              {getStatusBadge(assignment.status)}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Upcoming Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {assignments.slice(0, 3).map((assignment) => (
                            <div key={assignment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{assignment.title}</p>
                                <p className="text-xs text-gray-600">Due {assignment.dueDate}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Assignments</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
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
                      <Card key={assignment.id} className="hover:shadow-md transition-shadow">
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
                                    <Button onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setIsResubmitting(false);
                                      setResubmissionId(null);
                                    }}>
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
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setSubmissionText(existingSubmission.content || "");
                                      setSubmissionFile(null);
                                      setIsResubmitting(true);
                                      setResubmissionId(existingSubmission.id);
                                    }}>
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Resubmit
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
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "submissions" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">My Submissions</h2>
                  </div>

                  <div className="grid gap-4">
                    {submissions.map((submission) => {
                      const assignment = assignments.find(a => a.id === submission.assignmentId);
                      const deadlinePassed = assignment ? isDeadlinePassed(assignment.dueDate) : true;
                      
                      return (
                        <Card key={submission.id}>
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
                      );
                    })}

                    {submissions.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                          <p className="text-gray-600 mb-4">
                            You haven&apos;t submitted any assignments yet. 
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab("assignments")}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Assignments
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "grades" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Grades & Performance</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5" />
                          Overall Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-green-600">A-</div>
                          <div className="text-sm text-gray-600">Current Grade</div>
                          <Progress value={92} className="h-3" />
                          <div className="text-xs text-gray-500">92% Average</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Assignments Completed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-blue-600">8/10</div>
                          <div className="text-sm text-gray-600">This Month</div>
                          <Progress value={80} className="h-3" />
                          <div className="text-xs text-gray-500">80% Completion Rate</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-purple-600">+12%</div>
                          <div className="text-sm text-gray-600">Since Last Month</div>
                          <div className="text-xs text-green-600 font-medium">↑ Trending Up</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Grade Breakdown by Subject</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { subject: "Mathematics", grade: "A-", percentage: 92, assignments: 5 },
                          { subject: "Science", grade: "A", percentage: 95, assignments: 3 },
                          { subject: "SAT Prep", grade: "B+", percentage: 88, assignments: 4 },
                        ].map((item) => (
                          <div key={item.subject} className="flex items-center gap-4">
                            <div className="w-20 text-sm font-medium">{item.subject}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">{item.assignments} assignments</span>
                                <span className="text-sm font-medium">{item.grade} ({item.percentage}%)</span>
                              </div>
                              <Progress value={item.percentage} className="h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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
                    
                    {/* Add debug button visible only in development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/debug/setup-chat', { method: 'POST' });
                              const data = await response.json();
                              if (data.success) {
                                alert('Chat system setup successfully! Please refresh the page.');
                              } else {
                                alert(`Setup failed: ${data.error}`);
                              }
                            } catch (err) {
                              alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                              console.error('Error setting up chat:', err);
                            }
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Setup Chat System
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/debug/messages?studentId=${student.id}&teacherId=18&debug=true`);
                              const data = await response.json();
                              console.log('Debug data:', data);
                              alert(`Debug info logged to console. Found ${data.filteredMessages?.length || 0} messages.`);
                            } catch (err) {
                              alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                              console.error('Error debugging messages:', err);
                            }
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Debug Messages
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Import and use our MentorMessages component */}
                  {student && (
                    <MentorMessages 
                      studentId={student.id}
                      studentEmail={student.email}
                      studentName={student.name}
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
