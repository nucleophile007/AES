"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "../../contexts/AuthContext";
import "../components/chat-no-spinner.css";
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
} from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import AssignmentManager from "@/components/teacher/AssignmentManager";
import SubmissionReviewer from "@/components/teacher/SubmissionReviewer";
import CustomChatDialog from "../../components/CustomChatDialog";
import StudentProgressModal from "../../components/teacher/StudentProgressModal";
import { 
  User, 
  BookOpen, 
  GraduationCap, 
  Search, 
  Users, 
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  Mail,
  Phone,
  School,
  Award,
  Plus,
  CheckCircle,
  AlertCircle,
  LogOut,
  RefreshCw,
  MessageCircle,
  Send,
  Eye,
  Download,
  ExternalLink
} from "lucide-react";

type ResourceCategory = "assignment" | "personal" | "general";

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
  mainProgram: string;
  enrollments: Array<{
    program: string;
    subject: string;
    isActive: boolean;
  }>;
  recentSubmissions: Array<{
    id: number;
    submittedAt: string;
    grade: number | null;
    status: string;
    assignment: {
      title: string;
      subject: string;
    };
  }>;
  assignedAt: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  programs: string[];
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  program: string;
  subject: string;
  grade: string;
  dueDate: string;
  totalPoints: number;
  isActive: boolean;
  createdAt: string;
  instructions: string;
  allowLateSubmission: boolean;
  submissions: Array<{
    id: number;
    studentName?: string;
    studentEmail?: string;
    submittedAt: string;
    grade: number | null;
    status: string;
    feedback: string | null;
    student?: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  resources: Array<{
    id: number;
    name: string;
    url: string;
    resource?: any;
  }>;
  _count?: {
    submissions: number;
  };
}

export default function TeacherDashboard() {
  // Authentication - require teacher role
  const { user: authUser, isLoading: authLoading } = useRequireAuth('teacher');
  const { toast } = useToast();

  // All state hooks must be declared first
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resource sending state
  const [newResource, setNewResource] = useState<{
    title: string;
    description: string;
    type: string;
    linkUrl: string;
    program: string;
    subject: string;
    grade: string;
    category: ResourceCategory;
    assignmentId: number | null;
    studentIds: number[];
  }>({
    title: "",
    description: "",
    type: "document",
    linkUrl: "",
    program: "",
    subject: "",
    grade: "",
    category: "personal",
    assignmentId: null,
    studentIds: []
  });
  const [newResourceFile, setNewResourceFile] = useState<File | null>(null);
  const [sendingResource, setSendingResource] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);

  // Student submissions state
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [remarkText, setRemarkText] = useState("");
  const [isAddingRemark, setIsAddingRemark] = useState(false);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatStudent, setSelectedChatStudent] = useState<Student | null>(null);
  const [selectedChatParent, setSelectedChatParent] = useState<{id: number, name: string} | null>(null);
  
  // Parent conversations state
  const [parentConversations, setParentConversations] = useState<any[]>([]);
  const [loadingParentConversations, setLoadingParentConversations] = useState(false);
  
  // Progress modal state
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedProgressStudent, setSelectedProgressStudent] = useState<Student | null>(null);

  // Get teacher email from authenticated user
  const teacherEmail = authUser?.email || "";

  // Prefill defaults once teacher data is available
  useEffect(() => {
    if (teacher?.programs?.length) {
      setNewResource((prev) => ({
        ...prev,
        program: prev.program || teacher.programs[0]
      }));
    }
  }, [teacher]);

  // Fetch functions
  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();
      
      if (response.ok && data.teacher) {
        setTeacher(data.teacher);
        setStudents(data.students || []);
      } else {
        setError(data.error || 'Failed to fetch teacher data');
      }
    } catch (err) {
      setError('Failed to fetch teacher data');
      console.error('Error fetching teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/teacher/assignments?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();
      
      if (data.success) {
        setAssignments(data.assignments);
      } else {
        console.error('Failed to fetch assignments:', data.error);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const resetResourceForm = () => {
    setNewResource({
      title: "",
      description: "",
      type: "document",
      linkUrl: "",
      program: teacher?.programs?.[0] || "",
      subject: "",
      grade: "",
      category: "personal",
      assignmentId: null,
      studentIds: []
    });
    setNewResourceFile(null);
    setResourceError(null);
  };

  const handleSendResource = async () => {
    setResourceError(null);

    if (!teacherEmail) {
      const message = "Teacher email not available.";
      setResourceError(message);
      toast({
        variant: "destructive",
        title: "Cannot send resource",
        description: message,
      });
      return;
    }

    if (!newResource.title.trim()) {
      const message = "Title is required.";
      setResourceError(message);
      toast({
        title: "Missing title",
        description: message,
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    if (!newResource.type) {
      const message = "Type is required.";
      setResourceError(message);
      toast({
        title: "Missing type",
        description: message,
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    if (!newResource.program || !newResource.subject || !newResource.grade) {
      const message = "Program, subject, and grade are required.";
      setResourceError(message);
      toast({
        title: "Missing details",
        description: message,
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    if (newResource.studentIds.length === 0) {
      const message = "Select at least one student.";
      setResourceError(message);
      toast({
        title: "No students selected",
        description: message,
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    if (newResource.category === "assignment" && !newResource.assignmentId) {
      const message = "Select an assignment for this category.";
      setResourceError(message);
      toast({
        title: "Assignment required",
        description: message,
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    if (newResource.type === "link" && !newResource.linkUrl) {
      const message = "Provide a link URL for link type resources.";
      setResourceError(message);
      toast({
        title: "Link URL required",
        description: message,
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    if (["document", "video", "image"].includes(newResource.type) && !newResourceFile && !newResource.linkUrl) {
      const message = "Upload a file or provide a link for this resource.";
      setResourceError(message);
      toast({
        title: "File or link required",
        description: message,
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    setSendingResource(true);
    try {
      let fileUrl: string | null = null;

      if (newResourceFile) {
        const formData = new FormData();
        formData.append("file", newResourceFile);
        formData.append("studentId", "0");
        formData.append("assignmentId", newResource.assignmentId ? newResource.assignmentId.toString() : "0");

        const uploadResponse = await fetch("/api/upload-r2", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || "Upload failed");
        }
        fileUrl = uploadData.fileUrl;
      }

      const payload = {
        title: newResource.title,
        description: newResource.description,
        type: newResource.type,
        fileUrl,
        linkUrl: newResource.linkUrl || null,
        fileName: newResourceFile?.name,
        fileSize: newResourceFile?.size,
        program: newResource.program,
        subject: newResource.subject,
        grade: newResource.grade,
        teacherEmail,
        isPublic: newResource.category === "general",
        assignmentIds: newResource.category === "assignment" && newResource.assignmentId ? [newResource.assignmentId] : [],
        studentIds: newResource.studentIds,
      };

      const createResponse = await fetch("/api/teacher/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await createResponse.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to send resource");
      }

      resetResourceForm();
      toast({
        title: "Resource sent",
        description: "Your resource has been shared with the selected students.",
        className: "border-green-500 bg-green-50 text-green-900",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send resource";
      setResourceError(message);
      console.error("Send resource error:", err);
      toast({
        variant: "destructive",
        title: "Failed to send resource",
        description: message,
      });
    } finally {
      setSendingResource(false);
    }
  };

  const fetchStudentSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const response = await fetch(`/api/teacher/submissions/resources?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();
      
      if (data.success) {
        setStudentSubmissions(data.submissions);
      } else {
        console.error('Failed to fetch student submissions:', data.error);
      }
    } catch (err) {
      console.error('Error fetching student submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchParentConversations = async () => {
    if (!teacher?.id) return;
    
    try {
      setLoadingParentConversations(true);
      const response = await fetch(`/api/teacher/conversations?teacherId=${teacher.id}`);
      const data = await response.json();
      
      if (data.success) {
        // Filter to only show parent conversations
        const parents = data.conversations.filter((c: any) => c.recipientRole === 'parent');
        setParentConversations(parents);
      } else {
        console.error('Failed to fetch parent conversations:', data.error);
      }
    } catch (err) {
      console.error('Error fetching parent conversations:', err);
    } finally {
      setLoadingParentConversations(false);
    }
  };

  const handleAddRemark = async (submissionId: number) => {
    if (!remarkText.trim()) return;
    
    try {
      setIsAddingRemark(true);
      const response = await fetch('/api/teacher/submissions/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherEmail,
          submissionId,
          remark: remarkText,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh submissions
        await fetchStudentSubmissions();
        setSelectedSubmission(null);
        setRemarkText("");
      } else {
        console.error('Failed to add remark:', data.error);
      }
    } catch (err) {
      console.error('Error adding remark:', err);
    } finally {
      setIsAddingRemark(false);
    }
  };

  // useEffect hooks - must be after function declarations but before any conditional returns
  useEffect(() => {
    if (teacherEmail) {
      fetchAssignments();
      fetchTeacherData();
    }
  }, [teacherEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (teacherEmail) {
      fetchStudentSubmissions();
    }
  }, [teacherEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (teacher?.id) {
      fetchParentConversations();
    }
  }, [teacher?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Early return for authentication loading (AFTER all hooks)
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

  // Filter students by selected program and search
  const filteredStudents = students.filter(
    (student) =>
      (!selectedProgram || student.program === selectedProgram) &&
      (student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Filter assignments by selected program
  const filteredAssignments = assignments.filter(
    (assignment) =>
      (!selectedProgram || assignment.program === selectedProgram)
  );

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-brand-blue mx-auto mb-4" />
              <p className="text-gray-600">Loading teacher dashboard...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">Error: {error}</div>
              <Button onClick={fetchTeacherData}>Try Again</Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!teacher) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-600 text-xl">Teacher not found</div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Sidebar items
  const sidebarItems = [
    {
      title: "Students",
      icon: Users,
      value: "students",
    },
    {
      title: "Assignments",
      icon: BookOpen,
      value: "assignments",
    },
    {
      title: "Submissions",
      icon: FileText,
      value: "submissions",
    },
    {
      title: "Resources",
      icon: GraduationCap,
      value: "resources",
    },
    {
      title: "Schedule",
      icon: Calendar,
      value: "schedule",
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <Sidebar variant="inset" className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-brand-blue">
                <AvatarFallback className="bg-gradient-to-br from-brand-blue to-brand-teal text-white font-semibold">
                  {teacher?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {teacher?.name || "Teacher"}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {teacher?.email || ""}
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={activeTab === item.value}
                        onClick={() => setActiveTab(item.value)}
                        className="w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
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

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 flex-1">
              <h1 className="text-lg font-semibold bg-gradient-to-r from-brand-blue to-brand-teal bg-clip-text text-transparent">
                Teacher Dashboard
              </h1>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 teacher-chat-no-spinner">

            {/* Students Tab */}
            {activeTab === "students" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
            {/* Parent Conversations Section */}
            {parentConversations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-brand-blue">
                  <Users className="h-5 w-5" />
                  Parent Conversations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {parentConversations.map((parent) => (
                    <Card key={parent.recipientId} className="border-2 hover:shadow-xl transition-all hover:border-brand-teal">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{parent.recipientName}</p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{parent.lastMessage}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(parent.lastMessageTime).toLocaleDateString()}
                            </p>
                            {parent.unreadCount > 0 && (
                              <Badge className="mt-2 bg-purple-500 text-white">
                                {parent.unreadCount} unread
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-3 text-purple-600 hover:bg-purple-50 border-purple-200"
                            onClick={() => {
                              setSelectedChatParent({ id: parent.recipientId, name: parent.recipientName });
                              setSelectedChatStudent(null); // Clear student selection
                              setIsChatOpen(true);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="border-t border-gray-200 my-6"></div>
              </div>
            )}

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-brand-blue">
              <GraduationCap className="h-5 w-5" />
              Students
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  No students found.
                </div>
              )}
              {filteredStudents.map((student) => (
                <Card key={student.id} className="border-2 hover:shadow-xl transition-all hover:border-brand-blue">
                  <CardHeader className="bg-gradient-to-r from-brand-blue/5 to-brand-teal/5">
                    <CardTitle className="flex items-center gap-2 text-brand-blue">
                      <User className="h-5 w-5" />
                      {student.name}
                    </CardTitle>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Program Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue border-brand-blue/30">
                          {student.program}
                        </Badge>
                        <Badge variant="outline" className="bg-brand-teal/10 text-brand-teal border-brand-teal/30">
                          {student.grade}
                        </Badge>
                      </div>
                      
                      {/* School Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <School className="h-4 w-4" />
                        {student.schoolName}
                      </div>
                      
                      {/* Parent Info */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Parent: {student.parentName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {student.parentEmail}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {student.parentPhone}
                        </div>
                      </div>
                      
                      {/* Recent Submissions */}
                      {student.recentSubmissions.length > 0 && (
                        <div className="text-xs">
                          <div className="font-medium text-gray-700 mb-1">Recent Submissions:</div>
                          {student.recentSubmissions.slice(0, 2).map((submission, idx) => (
                            <div key={idx} className="text-gray-500 flex justify-between">
                              <span>{submission.assignment.title}</span>
                              <span className={submission.grade ? 'text-green-600' : 'text-orange-600'}>
                                {submission.grade ? `${submission.grade}%` : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedProgressStudent(student);
                            setIsProgressModalOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-brand-blue hover:bg-brand-blue/10"
                          onClick={() => {
                            setSelectedChatStudent(student);
                            setSelectedChatParent(null); // Clear parent selection
                            setIsChatOpen(true);
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
              </motion.div>
            )}

            {/* Assignments Tab */}
            {activeTab === "assignments" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
              <AssignmentManager 
              teacherEmail={teacherEmail}
              assignments={assignments}
              onAssignmentCreated={fetchAssignments}
              onAssignmentUpdated={fetchAssignments}
              />
              </motion.div>
            )}

            {/* Submissions Tab */}
            {activeTab === "submissions" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
              <SubmissionReviewer teacherEmail={teacherEmail} />
              </motion.div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
              {/* Send resource to students */}
              <Card className="border-2 border-brand-blue/30 bg-gradient-to-br from-white to-brand-blue/5 hover:shadow-xl transition-all">
                <CardHeader className="pb-3 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10">
                  <CardTitle className="text-lg flex items-center gap-2 text-brand-blue">
                    <Send className="h-5 w-5" />
                    Send Resource to Students
                  </CardTitle>
                  <CardDescription>
                    Choose a category (assignment / personal / general), attach a file or link, and target students.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        placeholder="Resource title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <select
                        value={newResource.category}
                        onChange={(e) => setNewResource({ ...newResource, category: e.target.value as ResourceCategory })}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="assignment">Assignment</option>
                        <option value="personal">Personal</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                        placeholder="Short description (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <select
                        value={newResource.type}
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="document">Document</option>
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                        <option value="link">Link</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Program *</Label>
                      <Input
                        value={newResource.program}
                        onChange={(e) => setNewResource({ ...newResource, program: e.target.value })}
                        placeholder="Program"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject *</Label>
                      <Input
                        value={newResource.subject}
                        onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                        placeholder="Subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grade *</Label>
                      <Input
                        value={newResource.grade}
                        onChange={(e) => setNewResource({ ...newResource, grade: e.target.value })}
                        placeholder="Grade"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newResource.category === "assignment" && (
                      <div className="space-y-2">
                        <Label>Link to Assignment *</Label>
                        <select
                          value={newResource.assignmentId ?? ""}
                          onChange={(e) =>
                            setNewResource({
                              ...newResource,
                              assignmentId: e.target.value ? Number(e.target.value) : null
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md bg-white"
                        >
                          <option value="">Select assignment</option>
                          {assignments.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Attach File (optional)</Label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.png,.ppt,.pptx,.xlsx,.mp4,.mov"
                        onChange={(e) => setNewResourceFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-gray-500">Or provide a link below.</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Link URL (optional)</Label>
                      <Input
                        placeholder="https://..."
                        value={newResource.linkUrl}
                        onChange={(e) => setNewResource({ ...newResource, linkUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Students *</Label>
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                      {students.map((student) => (
                        <label key={student.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={newResource.studentIds.includes(student.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewResource({
                                  ...newResource,
                                  studentIds: [...newResource.studentIds, student.id]
                                });
                              } else {
                                setNewResource({
                                  ...newResource,
                                  studentIds: newResource.studentIds.filter((id) => id !== student.id)
                                });
                              }
                            }}
                          />
                          <span className="flex-1">
                            {student.name} <span className="text-gray-500">({student.email})</span>
                          </span>
                        </label>
                      ))}
                      {students.length === 0 && (
                        <p className="text-sm text-gray-500">No students found.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    {resourceError && (
                      <span className="text-sm text-red-600 mr-auto">{resourceError}</span>
                    )}
                    <Button
                      onClick={handleSendResource}
                      disabled={sendingResource || !newResource.title || !newResource.type || newResource.studentIds.length === 0}
                    >
                      {sendingResource ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Resource
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Student Resource Submissions</h3>
                  <p className="text-gray-600">Review and provide feedback on work submitted by students</p>
                </div>
                <Button onClick={fetchStudentSubmissions} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {submissionsLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">Loading submissions...</p>
                </div>
              ) : studentSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Submissions</h3>
                  <p className="text-gray-600">
                    Students haven&apos;t submitted any resources for review yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {studentSubmissions.map((submission) => (
                    <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{submission.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {submission.student.name} ({submission.student.grade})
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {submission.allTeachers.length} teacher{submission.allTeachers.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {submission.description && (
                              <p className="text-gray-600 mt-2">{submission.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={submission.hasMyRemark ? 'default' : 'secondary'}>
                              {submission.hasMyRemark ? 'Reviewed' : 'Needs Review'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Content Preview */}
                        {submission.content && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Content:</p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-4">
                              {submission.content}
                            </p>
                          </div>
                        )}

                        {/* File Attachment */}
                        {submission.fileUrl && submission.fileName && (
                          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900">{submission.fileName}</p>
                              {submission.fileSize && (
                                <p className="text-xs text-blue-700">
                                  {(submission.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(submission.fileUrl, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = submission.fileUrl;
                                  link.download = submission.fileName;
                                  link.click();
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* All Teachers */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Sent to teachers:</p>
                          <div className="flex flex-wrap gap-2">
                            {submission.allTeachers.map((teacher: any) => (
                              <Badge 
                                key={teacher.id} 
                                variant="outline" 
                                className={teacher.email === teacherEmail ? 'bg-blue-50 border-blue-200' : ''}
                              >
                                {teacher.name} {teacher.email === teacherEmail && '(You)'}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Existing Remarks */}
                        {submission.teacherRemarks.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Your previous feedback:</p>
                            {submission.teacherRemarks.map((remark: any) => (
                              <div key={remark.id} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-200">
                                <div className="flex items-start justify-between mb-1">
                                  <p className="text-sm font-medium text-green-900">Your Feedback</p>
                                  <p className="text-xs text-green-600">
                                    {new Date(remark.updatedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <p className="text-sm text-green-800">{remark.remark}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add/Update Remark */}
                        <div className="pt-4 border-t">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant={submission.hasMyRemark ? "outline" : "default"}
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setRemarkText(submission.teacherRemarks[0]?.remark || "");
                                }}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                {submission.hasMyRemark ? 'Update Feedback' : 'Add Feedback'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {submission.hasMyRemark ? 'Update' : 'Add'} Feedback for &quot;{submission.title}&quot;
                                </DialogTitle>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="remark">Your Feedback</Label>
                                  <Textarea
                                    id="remark"
                                    placeholder="Provide constructive feedback for the student..."
                                    value={remarkText}
                                    onChange={(e) => setRemarkText(e.target.value)}
                                    rows={6}
                                  />
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button
                                  onClick={() => handleAddRemark(submission.id)}
                                  disabled={isAddingRemark || !remarkText.trim()}
                                >
                                  {isAddingRemark ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4 mr-2" />
                                      {submission.hasMyRemark ? 'Update' : 'Send'} Feedback
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              </motion.div>
            )}

            {/* Schedule Tab */}
            {activeTab === "schedule" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Import StudentScheduler */}
                <div className="w-full">
                  {(() => {
                    const StudentScheduler = require("../../components/teacher/StudentScheduler").default;
                    return <StudentScheduler teacherEmail={teacherEmail} />;
                  })()}
                </div>
              </motion.div>
            )}
          </div>
        </SidebarInset>
      </div>

      {/* Chat Dialog for Students */}
      {teacher && selectedChatStudent && (
        <CustomChatDialog
          open={isChatOpen && !!selectedChatStudent}
          onOpenChange={(open) => {
            setIsChatOpen(open);
            if (!open) {
              setSelectedChatStudent(null);
            }
          }}
          userRole="teacher"
          userId={teacher.id}
          userName={teacher.name}
          recipientId={selectedChatStudent.id}
          recipientName={selectedChatStudent.name}
          recipientRole="student"
        />
      )}

      {/* Chat Dialog for Parents */}
      {teacher && selectedChatParent && (
        <CustomChatDialog
          open={isChatOpen && !!selectedChatParent}
          onOpenChange={(open) => {
            setIsChatOpen(open);
            if (!open) {
              setSelectedChatParent(null);
            }
          }}
          userRole="teacher"
          userId={teacher.id}
          userName={teacher.name}
          recipientId={selectedChatParent.id}
          recipientName={selectedChatParent.name}
          recipientRole="parent"
        />
      )}

      {/* Progress Modal */}
      {selectedProgressStudent && (
        <StudentProgressModal
          isOpen={isProgressModalOpen}
          onClose={() => setIsProgressModalOpen(false)}
          studentId={selectedProgressStudent.id}
          studentName={selectedProgressStudent.name}
          studentEmail={selectedProgressStudent.email}
        />
      )}
    </SidebarProvider>
  );
}
