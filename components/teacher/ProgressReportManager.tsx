"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ShimmerSkeleton } from "@/components/ui/dashboard-loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Eye, Trash2, Send, FileText, Calendar, User, BarChart3, CheckCircle, Clock, XCircle } from "lucide-react";

interface ProgressReport {
  id: number;
  studentId: number;
  reportDate: string;
  reportPeriod?: string;
  subject?: string;
  overallProgress: string;
  progressRating?: number;
  attendanceRate?: number;
  homeworkCompletion?: number;
  milestonesAchieved?: string;
  publications?: string;
  skillsImproved?: string;
  strengthsAreas?: string;
  improvementAreas?: string;
  nextSteps?: string;
  recommendations?: string;
  parentNotes?: string;
  classParticipation?: string;
  status: string;
  isVisible: boolean;
  student: {
    id: number;
    name: string;
    email: string;
    grade: string;
    program: string;
  };
}

interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
  program: string;
}

interface ProgressReportManagerProps {
  teacherEmail: string;
}

export default function ProgressReportManager({ teacherEmail }: ProgressReportManagerProps) {
  const { toast } = useToast();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    reportPeriod: "",
    subject: "",
    overallProgress: "",
    progressRating: "",
    attendanceRate: "",
    homeworkCompletion: "",
    milestonesAchieved: "",
    publications: "",
    skillsImproved: "",
    strengthsAreas: "",
    improvementAreas: "",
    nextSteps: "",
    recommendations: "",
    parentNotes: "",
    classParticipation: "",
  });

  useEffect(() => {
    fetchData();
  }, [teacherEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    if (!teacherEmail) return;

    try {
      setLoading(true);
      
      // Fetch progress reports
      const reportsRes = await fetch('/api/teacher/progress-report');
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }

      // Fetch students
      const studentsRes = await fetch(`/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        const normalizedStudents: Student[] = (studentsData.students || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          grade: s.grade,
          program: (s.mainProgram || s.program || "").trim(),
        }));
        setStudents(normalizedStudents);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load progress reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      reportPeriod: "",
      subject: "",
      overallProgress: "",
      progressRating: "",
      attendanceRate: "",
      homeworkCompletion: "",
      milestonesAchieved: "",
      publications: "",
      skillsImproved: "",
      strengthsAreas: "",
      improvementAreas: "",
      nextSteps: "",
      recommendations: "",
      parentNotes: "",
      classParticipation: "",
    });
  };

  const handleCreateReport = async () => {
    if (!formData.studentId || !formData.overallProgress) {
      toast({
        title: "Validation Error",
        description: "Please select a student and provide overall progress",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/teacher/progress-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          studentId: parseInt(formData.studentId),
          progressRating: formData.progressRating ? parseInt(formData.progressRating) : null,
          attendanceRate: formData.attendanceRate ? parseFloat(formData.attendanceRate) : null,
          homeworkCompletion: formData.homeworkCompletion ? parseFloat(formData.homeworkCompletion) : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Progress report created successfully",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create report');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create progress report",
        variant: "destructive",
      });
    }
  };

  const handleEditReport = async () => {
    if (!selectedReport) return;

    try {
      const response = await fetch('/api/teacher/progress-report', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          ...formData,
          progressRating: formData.progressRating ? parseInt(formData.progressRating) : null,
          attendanceRate: formData.attendanceRate ? parseFloat(formData.attendanceRate) : null,
          homeworkCompletion: formData.homeworkCompletion ? parseFloat(formData.homeworkCompletion) : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Progress report updated successfully",
        });
        setIsEditDialogOpen(false);
        setSelectedReport(null);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update report');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update progress report",
        variant: "destructive",
      });
    }
  };

  const handlePublishReport = async (reportId: number) => {
    try {
      const response = await fetch('/api/teacher/progress-report', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          action: 'publish',
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Report published! Student can now view it.",
        });
        fetchData();
      } else {
        throw new Error('Failed to publish report');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish report",
        variant: "destructive",
      });
    }
  };

  const handleUnpublishReport = async (reportId: number) => {
    try {
      const response = await fetch('/api/teacher/progress-report', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          action: 'unpublish',
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Report unpublished and saved as draft",
        });
        fetchData();
      } else {
        throw new Error('Failed to unpublish report');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unpublish report",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this progress report? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/teacher/progress-report', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Progress report deleted successfully",
        });
        fetchData();
      } else {
        throw new Error('Failed to delete report');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (report: ProgressReport) => {
    setSelectedReport(report);
    setFormData({
      studentId: report.studentId.toString(),
      reportPeriod: report.reportPeriod || "",
      subject: report.subject || "",
      overallProgress: report.overallProgress || "",
      progressRating: report.progressRating?.toString() || "",
      attendanceRate: report.attendanceRate?.toString() || "",
      homeworkCompletion: report.homeworkCompletion?.toString() || "",
      milestonesAchieved: report.milestonesAchieved || "",
      publications: report.publications || "",
      skillsImproved: report.skillsImproved || "",
      strengthsAreas: report.strengthsAreas || "",
      improvementAreas: report.improvementAreas || "",
      nextSteps: report.nextSteps || "",
      recommendations: report.recommendations || "",
      parentNotes: report.parentNotes || "",
      classParticipation: report.classParticipation || "",
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Published" },
      draft: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Draft" },
      archived: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: XCircle, label: "Archived" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`progress-manager-loading-${index}`}>
            <CardHeader className="space-y-3">
              <ShimmerSkeleton className="h-5 w-1/3" />
              <ShimmerSkeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-5/6" />
              <ShimmerSkeleton className="h-20 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Progress Reports</h2>
          <p className="text-gray-500 mt-1">Create, manage, and publish student progress reports</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Progress Report</DialogTitle>
              <DialogDescription>
                Create a new progress report for a student. Reports are saved as drafts until you publish them.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student">Student *</Label>
                <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name} - Grade {student.grade} ({student.program})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportPeriod">Report Period</Label>
                  <Input
                    id="reportPeriod"
                    placeholder="e.g., January 2026, Q1 2026"
                    value={formData.reportPeriod}
                    onChange={(e) => setFormData({ ...formData, reportPeriod: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject/Program</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics, SAT Prep"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
              </div>

              {/* Overall Progress */}
              <div className="space-y-2">
                <Label htmlFor="overallProgress">Overall Progress Summary *</Label>
                <Textarea
                  id="overallProgress"
                  placeholder="Describe the student's overall progress during this period..."
                  value={formData.overallProgress}
                  onChange={(e) => setFormData({ ...formData, overallProgress: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="progressRating">Progress Rating (1-10)</Label>
                  <Input
                    id="progressRating"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="8"
                    value={formData.progressRating}
                    onChange={(e) => setFormData({ ...formData, progressRating: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendanceRate">Attendance Rate (%)</Label>
                  <Input
                    id="attendanceRate"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="95"
                    value={formData.attendanceRate}
                    onChange={(e) => setFormData({ ...formData, attendanceRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeworkCompletion">Homework Completion (%)</Label>
                  <Input
                    id="homeworkCompletion"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="90"
                    value={formData.homeworkCompletion}
                    onChange={(e) => setFormData({ ...formData, homeworkCompletion: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strengthsAreas">Strengths & Areas of Excellence</Label>
                <Textarea
                  id="strengthsAreas"
                  placeholder="What does the student excel at?"
                  value={formData.strengthsAreas}
                  onChange={(e) => setFormData({ ...formData, strengthsAreas: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvementAreas">Areas for Improvement</Label>
                <Textarea
                  id="improvementAreas"
                  placeholder="What areas need attention?"
                  value={formData.improvementAreas}
                  onChange={(e) => setFormData({ ...formData, improvementAreas: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations & Next Steps</Label>
                <Textarea
                  id="recommendations"
                  placeholder="What are your recommendations for continued growth?"
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentNotes">Notes for Parents</Label>
                <Textarea
                  id="parentNotes"
                  placeholder="Special notes or messages for parents..."
                  value={formData.parentNotes}
                  onChange={(e) => setFormData({ ...formData, parentNotes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport}>
                Create Draft
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Progress Reports Yet</h3>
              <p className="text-gray-500 mb-4">Create your first progress report to track student progress</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">
                        {report.student.name}
                      </CardTitle>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Grade {report.student.grade}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.reportDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      {report.reportPeriod && (
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          {report.reportPeriod}
                        </div>
                      )}
                      {report.progressRating && (
                        <Badge variant="outline" className="bg-blue-50">
                          Rating: {report.progressRating}/10
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(report)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {report.status === 'draft' ? (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handlePublishReport(report.id)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnpublishReport(report.id)}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Unpublish
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Overall Progress</h4>
                    <p className="text-gray-600 text-sm">{report.overallProgress}</p>
                  </div>
                  {report.strengthsAreas && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Strengths</h4>
                      <p className="text-gray-600 text-sm">{report.strengthsAreas}</p>
                    </div>
                  )}
                  {report.improvementAreas && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Areas for Improvement</h4>
                      <p className="text-gray-600 text-sm">{report.improvementAreas}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Progress Report</DialogTitle>
            <DialogDescription>
              Update the progress report. Changes will be saved as a draft.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Same form fields as create, but without student selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-reportPeriod">Report Period</Label>
                <Input
                  id="edit-reportPeriod"
                  placeholder="e.g., January 2026, Q1 2026"
                  value={formData.reportPeriod}
                  onChange={(e) => setFormData({ ...formData, reportPeriod: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject/Program</Label>
                <Input
                  id="edit-subject"
                  placeholder="e.g., Mathematics, SAT Prep"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-overallProgress">Overall Progress Summary *</Label>
              <Textarea
                id="edit-overallProgress"
                placeholder="Describe the student's overall progress..."
                value={formData.overallProgress}
                onChange={(e) => setFormData({ ...formData, overallProgress: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-progressRating">Progress Rating (1-10)</Label>
                <Input
                  id="edit-progressRating"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.progressRating}
                  onChange={(e) => setFormData({ ...formData, progressRating: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-attendanceRate">Attendance Rate (%)</Label>
                <Input
                  id="edit-attendanceRate"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendanceRate}
                  onChange={(e) => setFormData({ ...formData, attendanceRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-homeworkCompletion">Homework Completion (%)</Label>
                <Input
                  id="edit-homeworkCompletion"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.homeworkCompletion}
                  onChange={(e) => setFormData({ ...formData, homeworkCompletion: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-strengthsAreas">Strengths & Areas of Excellence</Label>
              <Textarea
                id="edit-strengthsAreas"
                value={formData.strengthsAreas}
                onChange={(e) => setFormData({ ...formData, strengthsAreas: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-improvementAreas">Areas for Improvement</Label>
              <Textarea
                id="edit-improvementAreas"
                value={formData.improvementAreas}
                onChange={(e) => setFormData({ ...formData, improvementAreas: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-recommendations">Recommendations & Next Steps</Label>
              <Textarea
                id="edit-recommendations"
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-parentNotes">Notes for Parents</Label>
              <Textarea
                id="edit-parentNotes"
                value={formData.parentNotes}
                onChange={(e) => setFormData({ ...formData, parentNotes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditReport}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
