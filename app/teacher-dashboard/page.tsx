"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "../../contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AssignmentManager from "@/components/teacher/AssignmentManager";
import SubmissionReviewer from "@/components/teacher/SubmissionReviewer";
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
  RefreshCw
} from "lucide-react";

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

  // Get teacher email from authenticated user
  const teacherEmail = authUser?.email || "";

  // All useEffect hooks must be declared before any conditional returns
  useEffect(() => {
    if (authUser && teacherEmail) {
      fetchTeacherData();
      fetchAssignments();
    }
  }, [authUser, teacherEmail]); // Remove function deps to avoid infinite loop

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
    <main className="min-h-screen bg-gray-50 p-8">
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
                      
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        View Details
                      </Button>
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
        </Tabs>
      </div>
    </main>
  );
}
