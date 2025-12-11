"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "../../contexts/AuthContext";
import "../components/chat-no-spinner.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
      setResourceError("Teacher email not available.");
      return;
    }

    if (!newResource.title.trim()) {
      setResourceError("Title is required.");
      return;
    }

    if (!newResource.type) {
      setResourceError("Type is required.");
      return;
    }

    if (!newResource.program || !newResource.subject || !newResource.grade) {
      setResourceError("Program, subject, and grade are required.");
      return;
    }

    if (newResource.studentIds.length === 0) {
      setResourceError("Select at least one student.");
      return;
    }

    if (newResource.category === "assignment" && !newResource.assignmentId) {
      setResourceError("Select an assignment for this category.");
      return;
    }

    if (newResource.type === "link" && !newResource.linkUrl) {
      setResourceError("Provide a link URL for link type resources.");
      return;
    }

    if (["document", "video", "image"].includes(newResource.type) && !newResourceFile && !newResource.linkUrl) {
      setResourceError("Upload a file or provide a link for this resource.");
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
    } catch (err) {
      setResourceError(err instanceof Error ? err.message : "Failed to send resource");
      console.error("Send resource error:", err);
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
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading teacher dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 text-xl mb-4">Error: {error}</div>
            <Button onClick={fetchTeacherData}>Try Again</Button>
          </div>
        </div>
      </main>
    );
  }

  if (!teacher) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-600 text-xl">Teacher not found</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 teacher-chat-no-spinner">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
              <Users className="h-7 w-7 text-blue-600" /> Teacher Dashboard
            </h1>
            <p className="text-gray-600 text-sm">
              Welcome, <span className="font-semibold">{teacher.name}</span>! Manage your students and assignments below.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button
              variant="outline"
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
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Program Filter */}
              <Tabs value={selectedProgram || "all"} onValueChange={v => setSelectedProgram(v === "all" ? null : v)}>
                <TabsList className="flex flex-wrap gap-2">
                  <TabsTrigger value="all">All Programs</TabsTrigger>
                  {teacher?.programs.map((program) => (
                    <TabsTrigger key={program} value={program}>{program}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Recent Student Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {students.slice(0, 5).map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.program}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {student.recentSubmissions.length} submissions
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Assignment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assignments.slice(0, 5).map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{assignment.title}</p>
                            <p className="text-xs text-gray-500">{assignment.subject}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-xs">{assignment.submissions?.filter(s => s.grade !== null).length || 0}</span>
                              <AlertCircle className="h-3 w-3 text-orange-500" />
                              <span className="text-xs">{assignment.submissions?.filter(s => s.grade === null).length || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            {/* Parent Conversations Section */}
            {parentConversations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Parent Conversations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {parentConversations.map((parent) => (
                    <Card key={parent.recipientId} className="hover:shadow-lg transition-shadow border-purple-200">
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

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              Students
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  No students found.
                </div>
              )}
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      {student.name}
                    </CardTitle>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Program Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {student.program}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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
                          className="text-blue-600 hover:bg-blue-50"
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
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <AssignmentManager 
              teacherEmail={teacherEmail}
              assignments={assignments}
              onAssignmentCreated={fetchAssignments}
              onAssignmentUpdated={fetchAssignments}
            />
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <SubmissionReviewer teacherEmail={teacherEmail} />
          </TabsContent>

          {/* Resources Tab - Send resources to students + review their submissions */}
          <TabsContent value="resources">
            <div className="space-y-6">
              {/* Send resource to students */}
              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="h-5 w-5 text-blue-600" />
                    Send Resource to Students
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Choose a category (assignment / personal / general), attach a file or link, and target students.
                  </p>
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
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <div className="space-y-6">
              {/* Import StudentScheduler */}
              <div className="w-full">
                {activeTab === "schedule" && (
                  <div className="w-full">
                    {/* Using dynamic import pattern for client components */}
                    {(() => {
                      const StudentScheduler = require("../../components/teacher/StudentScheduler").default;
                      return <StudentScheduler teacherEmail={teacherEmail} />;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
    </main>
  );
}
