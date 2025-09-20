"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plus
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
  submissionStats: {
    total: number;
    graded: number;
    pending: number;
    submissions: Array<{
      id: number;
      studentName: string;
      studentEmail: string;
      submittedAt: string;
      grade: number | null;
      status: string;
      feedback: string | null;
    }>;
  };
}

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, using a teacher email. In real app, this would come from authentication
  const teacherEmail = "sarah.johnson@acharya.edu"; // You can change this to test different teachers

  useEffect(() => {
    fetchTeacherData();
    fetchAssignments();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch teacher data');
      }
      
      setTeacher(data.teacher);
      setStudents(data.students);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/teacher/assignments?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assignments');
      }
      
      setAssignments(data.assignments);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                  <p className="text-2xl font-bold text-green-600">{assignments.filter(a => a.isActive).length}</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Programs</p>
                  <p className="text-2xl font-bold text-purple-600">{teacher.programs.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {assignments.reduce((sum, a) => sum + a.submissionStats.pending, 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          {/* Program Filter Tabs */}
          <Tabs value={selectedProgram || "all"} onValueChange={v => setSelectedProgram(v === "all" ? null : v)} className="mb-6">
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="all">All Programs</TabsTrigger>
              {teacher.programs.map((program) => (
                <TabsTrigger key={program} value={program}>{program}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Assignments</h2>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAssignments.length === 0 && (
                  <div className="col-span-full text-center text-gray-400 py-12">
                    No assignments found.
                  </div>
                )}
                {filteredAssignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          {assignment.title}
                        </span>
                        <Badge variant={assignment.isActive ? "default" : "secondary"}>
                          {assignment.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <div className="text-sm text-gray-600">{assignment.description}</div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Assignment Info */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            {assignment.program}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {assignment.subject}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {assignment.grade}
                          </Badge>
                        </div>
                        
                        {/* Due Date and Points */}
                        <div className="flex justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {assignment.totalPoints} pts
                          </div>
                        </div>
                        
                        {/* Submission Stats */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 mb-2">Submission Stats:</div>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{assignment.submissionStats.total}</div>
                              <div className="text-gray-500">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600">{assignment.submissionStats.graded}</div>
                              <div className="text-gray-500">Graded</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-orange-600">{assignment.submissionStats.pending}</div>
                              <div className="text-gray-500">Pending</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            View Submissions
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Edit Assignment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
