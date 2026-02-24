"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProgressReportDebug() {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [studentInfo, setStudentInfo] = useState<any>(null);

  const checkProgressReports = async () => {
    setLoading(true);
    setError("");
    try {
      // Test the API endpoint
      const response = await fetch('/api/student/progress-report');
      const data = await response.json();
      
      console.log('API Response:', response.status, data);
      setApiResponse({
        status: response.status,
        ok: response.ok,
        data: data
      });

      // Also get student info
      const studentRes = await fetch('/api/student/dashboard');
      if (studentRes.ok) {
        const studentData = await studentRes.json();
        setStudentInfo(studentData.student);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProgressReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Progress Report Debug Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkProgressReports} disabled={loading}>
              {loading ? "Checking..." : "Refresh Check"}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
                <strong>Error:</strong> {error}
              </div>
            )}

            {studentInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-bold mb-2">Student Info:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(studentInfo, null, 2)}
                </pre>
              </div>
            )}

            {apiResponse && (
              <div className="space-y-4">
                <div className="bg-white border rounded p-4">
                  <h3 className="font-bold mb-2">API Response Status:</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>HTTP Status:</strong> {apiResponse.status}</p>
                    <p><strong>OK:</strong> {apiResponse.ok ? 'Yes' : 'No'}</p>
                    <p><strong>Success:</strong> {apiResponse.data.success ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {apiResponse.data.error && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <h3 className="font-bold mb-2 text-yellow-800">API Error:</h3>
                    <p className="text-sm text-yellow-700">{apiResponse.data.error}</p>
                  </div>
                )}

                {apiResponse.data.reports && (
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h3 className="font-bold mb-2 text-green-800">
                      Progress Reports Found: {apiResponse.data.reports.length}
                    </h3>
                    {apiResponse.data.reports.length === 0 ? (
                      <p className="text-sm text-green-700">
                        No published progress reports found for this student.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {apiResponse.data.reports.map((report: any, idx: number) => (
                          <div key={idx} className="bg-white rounded p-3 text-sm">
                            <p><strong>Report #{idx + 1}</strong></p>
                            <p>ID: {report.id}</p>
                            <p>Period: {report.reportPeriod || 'N/A'}</p>
                            <p>Subject: {report.subject || 'N/A'}</p>
                            <p>Status: {report.status}</p>
                            <p>Visible: {report.isVisible ? 'Yes' : 'No'}</p>
                            <p>Teacher: {report.teacher?.name || 'N/A'}</p>
                            <p>Rating: {report.progressRating || 'N/A'}/10</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-gray-100 border rounded p-4">
                  <h3 className="font-bold mb-2">Full Response:</h3>
                  <pre className="text-xs overflow-auto max-h-96 bg-white p-2 rounded">
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <p>API endpoint exists at <code>/api/student/progress-report</code></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <p>Component imported in student dashboard</p>
              </div>
              <div className="flex items-start gap-2">
                <span className={apiResponse?.ok ? "text-green-600" : "text-gray-400"}>
                  {apiResponse?.ok ? "✓" : "○"}
                </span>
                <p>API responds successfully</p>
              </div>
              <div className="flex items-start gap-2">
                <span className={apiResponse?.data?.reports?.length > 0 ? "text-green-600" : "text-yellow-600"}>
                  {apiResponse?.data?.reports?.length > 0 ? "✓" : "⚠"}
                </span>
                <p>
                  Reports exist in database 
                  {apiResponse?.data?.reports?.length === 0 && " (No published reports found)"}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded">
              <h4 className="font-bold mb-2">If no reports showing:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Check if Supabase is online (not under maintenance)</li>
                <li>Verify a teacher has created a report for this student</li>
                <li>Ensure report status is &quot;published&quot; (not &quot;draft&quot;)</li>
                <li>Ensure report isVisible is true</li>
                <li>Check browser console for errors</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
