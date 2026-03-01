import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  User,
  BookOpen,
  TrendingUp,
  Target,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ProgressReport {
  id: number;
  reportDate: string;
  reportPeriod?: string;
  subject?: string;
  overallProgress: string;
  progressRating?: number;
  attendanceRate?: number;
  homeworkCompletion?: number;
  milestonesAchieved?: string | null;
  publications?: string | null;
  skillsImproved?: string | null;
  strengthsAreas?: string | null;
  improvementAreas?: string | null;
  nextSteps?: string | null;
  recommendations?: string;
  parentNotes?: string;
  classParticipation?: string;
  status?: string;
  teacher?: {
    name: string;
  };
  student?: {
    name: string;
  };
}

interface ProgressReportListProps {
  reports: ProgressReport[];
  emptyMessage?: string;
  showStudentName?: boolean;
}

const safeParse = (str: string | null | undefined) => {
  if (!str) return null;
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    return str;
  }
};

const ProgressReportList: React.FC<ProgressReportListProps> = ({
  reports,
  emptyMessage = "No progress reports available yet.",
  showStudentName = false,
}) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
        {emptyMessage}
      </div>
    );
  }

  const renderArraySection = (
    title: string,
    data: string | null | undefined,
    icon: React.ReactNode
  ) => {
    const items = safeParse(data);
    if (!items || (Array.isArray(items) && items.length === 0)) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          {icon}
          <span>{title}</span>
        </div>
        <ul className="list-disc list-inside space-y-1 ml-6 text-gray-600">
          {Array.isArray(items) ? (
            items.map((item, idx) => <li key={idx}>{item}</li>)
          ) : (
            <li>{items}</li>
          )}
        </ul>
      </div>
    );
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      published: { color: "bg-green-100 text-green-800", label: "Published" },
      draft: { color: "bg-yellow-100 text-yellow-800", label: "Draft" },
      archived: { color: "bg-gray-100 text-gray-800", label: "Archived" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.published;
    return (
      <Badge className={`${config.color} border-0`}>{config.label}</Badge>
    );
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return "bg-gray-200";
    if (rating >= 8) return "bg-green-500";
    if (rating >= 6) return "bg-blue-500";
    if (rating >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <Card
          key={report.id}
          className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600"
        >
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div className="space-y-1">
                <CardTitle className="text-lg text-gray-900">
                  Progress Report
                  {report.reportPeriod && ` - ${report.reportPeriod}`}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(report.reportDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  {report.teacher && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {report.teacher.name}
                    </div>
                  )}
                  {showStudentName && report.student && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Student: {report.student.name}
                    </div>
                  )}
                  {report.subject && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {report.subject}
                    </div>
                  )}
                </div>
              </div>
              {report.status && getStatusBadge(report.status)}
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Metrics Overview */}
            {(report.progressRating ||
              report.attendanceRate !== null ||
              report.homeworkCompletion !== null) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                {report.progressRating && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      Progress Rating
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`text-3xl font-bold ${
                          report.progressRating >= 8
                            ? "text-green-600"
                            : report.progressRating >= 6
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {report.progressRating}
                      </div>
                      <div className="text-gray-500">/10</div>
                    </div>
                    <Progress
                      value={report.progressRating * 10}
                      className={`h-2 mt-2 ${getRatingColor(report.progressRating)}`}
                    />
                  </div>
                )}

                {report.attendanceRate !== null && report.attendanceRate !== undefined && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Attendance</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {report.attendanceRate.toFixed(0)}%
                    </div>
                    <Progress value={report.attendanceRate} className="h-2 mt-2" />
                  </div>
                )}

                {report.homeworkCompletion !== null && report.homeworkCompletion !== undefined && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      Homework Completion
                    </div>
                    <div className="text-3xl font-bold text-purple-600">
                      {report.homeworkCompletion.toFixed(0)}%
                    </div>
                    <Progress
                      value={report.homeworkCompletion}
                      className="h-2 mt-2"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-800">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Overall Progress Summary</span>
              </div>
              <p className="text-gray-700 leading-relaxed ml-7">
                {report.overallProgress}
              </p>
            </div>

            {/* Array Sections */}
            {renderArraySection(
              "Milestones Achieved",
              report.milestonesAchieved,
              <Award className="h-5 w-5 text-yellow-600" />
            )}

            {renderArraySection(
              "Publications & Work",
              report.publications,
              <FileText className="h-5 w-5 text-green-600" />
            )}

            {renderArraySection(
              "Skills Improved",
              report.skillsImproved,
              <TrendingUp className="h-5 w-5 text-blue-600" />
            )}

            {renderArraySection(
              "Strength Areas",
              report.strengthsAreas,
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}

            {renderArraySection(
              "Areas for Improvement",
              report.improvementAreas,
              <AlertCircle className="h-5 w-5 text-orange-600" />
            )}

            {renderArraySection(
              "Next Steps & Goals",
              report.nextSteps,
              <Target className="h-5 w-5 text-purple-600" />
            )}

            {/* Text Sections */}
            {report.classParticipation && (
              <div className="space-y-2">
                <div className="font-semibold text-gray-800">
                  Class Participation
                </div>
                <p className="text-gray-600 ml-4">{report.classParticipation}</p>
              </div>
            )}

            {report.recommendations && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="font-semibold text-blue-900">
                  Teacher&apos;s Recommendations
                </div>
                <p className="text-blue-800">{report.recommendations}</p>
              </div>
            )}

            {report.parentNotes && (
              <div className="space-y-2 bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="font-semibold text-purple-900">
                  Notes for Parents
                </div>
                <p className="text-purple-800">{report.parentNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProgressReportList;
