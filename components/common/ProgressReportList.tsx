import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressReport {
    id: number;
    reportDate: string;
    overallProgress: string;
    milestonesAchieved: string | null;
    publications: string | null;
    nextSteps: string | null;
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
}

const safeParse = (str: string | null) => {
    if (!str) return null;
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
};

const ProgressReportList: React.FC<ProgressReportListProps> = ({
    reports,
    emptyMessage = "No progress reports available yet."
}) => {
    if (reports.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow border-l-4 border-l-brand-blue">
                    <CardHeader className="bg-gray-50/50 pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg text-gray-900">
                                    Progress Report {report.student?.name ? `for ${report.student.name}` : ''}
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                    Issued on {new Date(report.reportDate).toLocaleDateString()} by {report.teacher?.name || 'Mentor'}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {report.overallProgress && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Progress Summary</h4>
                                <p className="text-sm text-gray-800 bg-white p-3 border rounded-md shadow-sm">{report.overallProgress}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {report.milestonesAchieved && (
                                <div>
                                    <h4 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Milestones Achieved</h4>
                                    <div className="text-sm text-gray-700 bg-green-50/50 p-3 rounded border border-green-100 whitespace-pre-wrap">
                                        {safeParse(report.milestonesAchieved)}
                                    </div>
                                </div>
                            )}
                            {report.publications && (
                                <div>
                                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Publications / Journals</h4>
                                    <div className="text-sm text-gray-700 bg-blue-50/50 p-3 rounded border border-blue-100 whitespace-pre-wrap">
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
            ))}
        </div>
    );
};

export default ProgressReportList;
