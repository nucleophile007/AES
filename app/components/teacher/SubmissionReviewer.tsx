"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  Star,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";

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

export default function SubmissionReviewer({ teacherEmail }: SubmissionReviewerProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });
  const [filters, setFilters] = useState({
    status: 'all',
    assignment: 'all',
    search: ''
  });

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/submissions?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch submissions');
      }

      setSubmissions(data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert(error instanceof Error ? error.message : 'Failed to fetch submissions');
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
    if (!selectedSubmission) return;

    try {
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
      alert('Submission graded successfully');

    } catch (error) {
      console.error('Error grading submission:', error);
      alert(error instanceof Error ? error.message : 'Failed to grade submission');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
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
    return <div className="flex justify-center p-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Submissions</h2>
        <Button onClick={fetchSubmissions} variant="outline">
          Refresh
        </Button>
      </div>

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
          filteredSubmissions.map((submission) => (
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
                  {submission.content && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Text Submission:</p>
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-sm whitespace-pre-wrap">{submission.content}</p>
                      </div>
                    </div>
                  )}

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
                <div className="flex justify-end mt-4">
                  <Button onClick={() => handleGrade(submission)}>
                    {submission.grade !== null ? 'Update Grade' : 'Grade Submission'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitGrade}>
              Save Grade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}