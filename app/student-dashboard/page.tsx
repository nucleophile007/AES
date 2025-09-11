"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - replace with actual API calls
const mockStudent = {
  id: 1,
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  grade: "10th Grade",
  school: "Granite Bay High School",
  program: "Academic Tutoring",
  profileImage: null,
  gpa: 3.8,
  overallGrade: "A-",
};

const mockAssignments = [
  {
    id: 1,
    title: "Algebra II Problem Set #12",
    subject: "Mathematics",
    description: "Complete problems 1-25 from Chapter 8, focusing on quadratic equations and factoring.",
    dueDate: "2025-09-15",
    totalPoints: 100,
    status: "pending",
    program: "Academic Tutoring",
  },
  {
    id: 2,
    title: "Essay: Impact of Climate Change",
    subject: "Science",
    description: "Write a 3-page essay discussing the effects of climate change on marine ecosystems.",
    dueDate: "2025-09-18",
    totalPoints: 150,
    status: "submitted",
    program: "Academic Tutoring",
  },
  {
    id: 3,
    title: "SAT Practice Test #3",
    subject: "SAT Prep",
    description: "Complete the full-length practice test and submit your answers for review.",
    dueDate: "2025-09-12",
    totalPoints: 200,
    status: "overdue",
    program: "SAT Coaching",
  },
];

const mockSubmissions = [
  {
    id: 1,
    assignmentId: 2,
    assignmentTitle: "Essay: Impact of Climate Change",
    submittedAt: "2025-09-08",
    grade: 142,
    totalPoints: 150,
    feedback: "Excellent work! Your analysis of marine ecosystem impacts was thorough and well-researched. Consider adding more specific examples in future essays.",
    status: "graded",
    teacherName: "Dr. Sarah Wilson",
  },
  {
    id: 2,
    assignmentId: 5,
    assignmentTitle: "Geometry Proofs Worksheet",
    submittedAt: "2025-09-05",
    grade: 88,
    totalPoints: 100,
    feedback: "Good understanding of geometric principles. Work on clarity in your proof explanations.",
    status: "graded",
    teacherName: "Mr. John Davis",
  },
];

const mockUpcomingEvents = [
  { id: 1, title: "Math Tutoring Session", date: "2025-09-10", time: "3:00 PM", type: "tutoring" },
  { id: 2, title: "SAT Practice Test", date: "2025-09-12", time: "9:00 AM", type: "test" },
  { id: 3, title: "Science Fair Project Review", date: "2025-09-15", time: "2:00 PM", type: "review" },
];

interface Assignment {
  id: number;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  status: string;
  program: string;
}

interface Submission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  submittedAt: string;
  grade?: number;
  totalPoints: number;
  feedback?: string;
  status: string;
  teacherName: string;
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Mock student ID - in real app, get from authentication
  const studentId = 1;

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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch assignments
        const assignmentsResponse = await fetch(`/api/assignments?studentId=${studentId}`);
        const assignmentsData = await assignmentsResponse.json();
        
        if (assignmentsData.success) {
          setAssignments(assignmentsData.assignments);
        }

        // Fetch submissions
        const submissionsResponse = await fetch(`/api/submissions?studentId=${studentId}`);
        const submissionsData = await submissionsResponse.json();
        
        if (submissionsData.success) {
          setSubmissions(submissionsData.submissions);
        }
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleSubmission = async () => {
    if (!selectedAssignment) return;
    
    setIsSubmitting(true);
    
    try {
      let fileUrl = null;
      
      // Upload file if provided
      if (submissionFile) {
        const formData = new FormData();
        formData.append('file', submissionFile);
        formData.append('studentId', studentId.toString());
        formData.append('assignmentId', selectedAssignment.id.toString());
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadResponse.json();
        
        if (uploadData.success) {
          fileUrl = uploadData.fileUrl;
        } else {
          throw new Error(uploadData.error || 'File upload failed');
        }
      }
      
      // Submit assignment
      const submissionResponse = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          assignmentId: selectedAssignment.id,
          assignmentTitle: selectedAssignment.title,
          content: submissionText,
          fileUrl,
        }),
      });
      
      const submissionData = await submissionResponse.json();
      
      if (submissionData.success) {
        // Update assignments list
        const updatedAssignments = assignments.map(assignment =>
          assignment.id === selectedAssignment.id
            ? { ...assignment, status: "submitted" }
            : assignment
        );
        setAssignments(updatedAssignments);
        
        // Add to submissions list
        setSubmissions([...submissions, submissionData.submission]);
        
        // Reset form
        setSelectedAssignment(null);
        setSubmissionText("");
        setSubmissionFile(null);
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
      badge: assignments.filter(a => a.status === "pending").length,
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

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar variant="inset">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {mockStudent.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {mockStudent.name}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {mockStudent.grade} • {mockStudent.school}
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
                            <p className="text-sm text-gray-600">Pending Assignments</p>
                            <p className="text-2xl font-bold">{assignments.filter(a => a.status === "pending").length}</p>
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
                            <p className="text-sm text-gray-600">Overall Grade</p>
                            <p className="text-2xl font-bold">{mockStudent.overallGrade}</p>
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
                            <p className="text-sm text-gray-600">Current GPA</p>
                            <p className="text-2xl font-bold">{mockStudent.gpa}</p>
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
                          {mockUpcomingEvents.map((event) => (
                            <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{event.title}</p>
                                <p className="text-xs text-gray-600">{event.date} at {event.time}</p>
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
                    {assignments.map((assignment) => (
                      <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{assignment.title}</h3>
                                {getStatusBadge(assignment.status)}
                              </div>
                              <p className="text-gray-600 mb-3">{assignment.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
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
                            </div>
                            {assignment.status === "pending" && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button onClick={() => setSelectedAssignment(assignment)}>
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
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "submissions" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">My Submissions</h2>
                  </div>

                  <div className="grid gap-4">
                    {submissions.map((submission) => (
                      <Card key={submission.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{submission.assignmentTitle}</h3>
                              <p className="text-sm text-gray-600">
                                Submitted on {submission.submittedAt} • Teacher: {submission.teacherName}
                              </p>
                            </div>
                            {getStatusBadge(submission.status)}
                          </div>
                          
                          {submission.grade !== undefined && (
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
                          
                          {submission.feedback && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 mb-1">Teacher Feedback:</p>
                              <p className="text-sm text-blue-800">{submission.feedback}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Upcoming Sessions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {mockUpcomingEvents.map((event) => (
                            <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Assignment Deadlines</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {assignments.filter(a => a.status === "pending").map((assignment) => (
                            <div key={assignment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{assignment.title}</p>
                                <p className="text-sm text-gray-600">Due: {assignment.dueDate}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "progress" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Academic Progress</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Learning Goals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { goal: "Master Quadratic Equations", progress: 85, target: "End of Month" },
                            { goal: "Improve SAT Math Score", progress: 60, target: "Test Date" },
                            { goal: "Complete Research Project", progress: 40, target: "Next Week" },
                          ].map((item, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">{item.goal}</span>
                                <span className="text-sm text-gray-600">{item.progress}%</span>
                              </div>
                              <Progress value={item.progress} className="h-2" />
                              <div className="text-xs text-gray-500">Target: {item.target}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Study Streak</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div className="text-4xl font-bold text-green-600">12</div>
                          <div className="text-lg text-gray-600">Days in a row!</div>
                          <div className="flex justify-center gap-1">
                            {[...Array(7)].map((_, i) => (
                              <div key={i} className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">Keep up the great work!</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Learning Resources</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Math Formula Sheet", type: "PDF", size: "2.3 MB", subject: "Mathematics" },
                      { title: "Science Lab Manual", type: "PDF", size: "5.1 MB", subject: "Science" },
                      { title: "SAT Practice Questions", type: "PDF", size: "1.8 MB", subject: "SAT Prep" },
                      { title: "Study Guide Templates", type: "DOCX", size: "0.9 MB", subject: "General" },
                      { title: "Video Tutorials Playlist", type: "Link", size: "Online", subject: "All Subjects" },
                      { title: "Previous Assignments", type: "Folder", size: "Multiple", subject: "All Subjects" },
                    ].map((resource, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Download className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{resource.title}</p>
                              <p className="text-xs text-gray-600">{resource.subject}</p>
                              <p className="text-xs text-gray-500">{resource.type} • {resource.size}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "messages" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Messages</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1">
                      <CardHeader>
                        <CardTitle className="text-lg">Conversations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {[
                            { name: "Dr. Sarah Wilson", subject: "Science", lastMessage: "Great work on your essay!", time: "2 hours ago", unread: true },
                            { name: "Mr. John Davis", subject: "Mathematics", lastMessage: "Let's review the geometry proofs", time: "1 day ago", unread: false },
                            { name: "Academic Support", subject: "General", lastMessage: "Study group this Friday", time: "2 days ago", unread: true },
                          ].map((conversation, index) => (
                            <div key={index} className={cn("p-3 rounded-lg cursor-pointer hover:bg-gray-50", conversation.unread && "bg-blue-50")}>
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {conversation.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">{conversation.name}</p>
                                    {conversation.unread && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                                  </div>
                                  <p className="text-xs text-gray-600">{conversation.subject}</p>
                                  <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                                  <p className="text-xs text-gray-400">{conversation.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">Chat with Dr. Sarah Wilson</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96 w-full p-4 border rounded-lg">
                          <div className="space-y-4">
                            <div className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">SW</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                  <p className="text-sm">Hi Alex! I&apos;ve reviewed your climate change essay. Excellent work on the research and analysis!</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Dr. Sarah Wilson • 2 hours ago</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-3 justify-end">
                              <div className="flex-1 flex justify-end">
                                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">
                                  <p className="text-sm">Thank you so much! I really enjoyed researching this topic. Do you have any suggestions for my next assignment?</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                        <div className="flex gap-2 mt-4">
                          <Input placeholder="Type your message..." className="flex-1" />
                          <Button>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
