import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  LayoutDashboard,
  FileSpreadsheet
} from "lucide-react";

interface StudentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
  studentEmail: string;
}

interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: string;
}

interface Submission {
  id: number;
  assignmentId: number;
  submittedAt: string;
  status: string;
}

const StudentProgressModal: React.FC<StudentProgressModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentEmail,
}) => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Progress Report State (view-only)
  const [activeTab, setActiveTab] = useState("overview");
  const [progressReports, setProgressReports] = useState<any[]>([]);

  // Parse JSON helper safely
  const safeParse = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  };

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);

      // Fetch Assignments Stats
      const statsResponse = await fetch(`/api/teacher/student-progress?studentEmail=${encodeURIComponent(studentEmail)}`);
      const statsData = await statsResponse.json();

      if (statsResponse.ok) {
        setAssignments(statsData.assignments || []);
        setSubmissions(statsData.submissions || []);
      }

      // Fetch Progress Reports
      const reportsResponse = await fetch(`/api/teacher/progress-report?studentId=${studentId}`);
      const reportsData = await reportsResponse.json();

      if (reportsResponse.ok) {
        setProgressReports(reportsData.reports || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching student progress:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && studentEmail) {
      fetchStudentProgress();
    }
  }, [isOpen, studentEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4 text-red-600">
            {studentName}&apos;s Progress
          </DialogTitle>
          <div className="flex gap-2 border-b mb-4 pb-2">
            <button
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard className="h-4 w-4" />
              Assignments Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'reports' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('reports')}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Progress Reports
            </button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Assignment Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                    }, {} as Record<string, { total: number, completed: number }>);

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

            {/* Assignment Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Assignment counts */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  {assignments.slice(0, 5).map((assignment) => {
                    const submission = submissions.find(s => s.assignmentId === assignment.id);
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{assignment.title}</p>
                          <p className="text-xs text-gray-600">{assignment.subject} • Due {new Date(assignment.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {submission ? (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Submitted
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {assignments.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No assignments found for this student.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Progress Reports (view only)</h3>

            <div className="space-y-4">
              {progressReports.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  No progress reports issued yet.
                </div>
              ) : (
                progressReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow border-2">
                    <CardHeader className="bg-gray-50/50 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base text-gray-900">Progress Report</CardTitle>
                            {report.status === 'draft' && (
                              <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                                ⚠ Draft - Not Visible to Student
                              </span>
                            )}
                            {report.status === 'published' && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full font-semibold">
                                ✓ Published
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">Issued on {new Date(report.reportDate).toLocaleDateString()} by {report.teacher?.name || 'Mentor'}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {report.overallProgress && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Progress Summary</h4>
                          <p className="text-sm text-gray-800 bg-white p-3 border rounded-md">{report.overallProgress}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.milestonesAchieved && (
                          <div>
                            <h4 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Milestones Achieved</h4>
                            <div className="text-sm text-gray-700 bg-green-50/50 p-2 rounded border border-green-100 whitespace-pre-wrap">
                              {safeParse(report.milestonesAchieved)}
                            </div>
                          </div>
                        )}
                        {report.publications && (
                          <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Publications</h4>
                            <div className="text-sm text-gray-700 bg-blue-50/50 p-2 rounded border border-blue-100 whitespace-pre-wrap">
                              {safeParse(report.publications)}
                            </div>
                          </div>
                        )}
                      </div>

                      {report.nextSteps && (
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Next Steps & Timeline</h4>
                          <div className="text-sm text-gray-700 bg-purple-50/50 p-3 rounded border border-purple-100 whitespace-pre-wrap">
                            {safeParse(report.nextSteps)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentProgressModal;