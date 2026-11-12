"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TASK_STATUSES, STUCK_AFTER_DAYS, formatTaskKey, type StudentInsight, type TaskStatus } from "@/lib/tasks";
import { AlertTriangle, Clock, Download, Loader2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { taskApi } from "@/components/tasks/api";

interface InsightsResponse {
  days: number;
  summary: { total: number; completed: number; completionRate: number; avgReviewHours: number | null; stuck: number };
  students: StudentInsight[];
  categories: { category: string; total: number; completed: number }[];
  stuck: { studentTaskId: number; taskId: number; title: string; studentName: string; status: string; since: string }[];
}

const pct = (n: number | null) => (n === null ? "—" : `${Math.round(n * 100)}%`);

function Bar({ value, tone = "indigo" }: { value: number; tone?: "indigo" | "emerald" | "amber" }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className={cn("h-full rounded-full", { indigo: "bg-indigo-500", emerald: "bg-emerald-500", amber: "bg-amber-500" }[tone])}
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
      />
    </div>
  );
}

interface TaskInsightsProps {
  exportQuery: string;
  onOpenItem: (taskId: number, studentTaskId: number) => void;
  onFilterStudent: (studentId: number) => void;
}

export function TaskInsights({ exportQuery, onOpenItem, onFilterStudent }: TaskInsightsProps) {
  const [days, setDays] = useState("90");
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await taskApi<InsightsResponse>(`/api/teacher/tasks/insights?days=${days}`));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [days]);
  useEffect(() => {
    setData(null);
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <TrendingUp className="h-4 w-4 text-indigo-500" /> Tasks created in the last
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="h-8 w-28 text-xs bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["30", "90", "180", "365"].map((d) => (
                <SelectItem key={d} value={d}>
                  {d} days
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <a href={`/api/teacher/tasks/export${exportQuery ? `?${exportQuery}` : ""}`} download>
            <Download className="h-3.5 w-3.5" /> Export CSV (current filters)
          </a>
        </Button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {!data && !error && (
        <div className="py-16 flex justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Student task items", value: String(data.summary.total) },
              { label: "Completion rate", value: pct(data.summary.completionRate) },
              {
                label: "Avg. review time",
                value: data.summary.avgReviewHours === null ? "—" : data.summary.avgReviewHours < 48 ? `${data.summary.avgReviewHours.toFixed(1)} h` : `${(data.summary.avgReviewHours / 24).toFixed(1)} days`,
              },
              { label: `Stuck > ${STUCK_AFTER_DAYS} days`, value: String(data.summary.stuck), warn: data.summary.stuck > 0 },
            ].map((t) => (
              <Card key={t.label} className={cn(t.warn && "border-amber-300")}>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">{t.label}</p>
                  <p className={cn("text-2xl font-bold mt-1", t.warn ? "text-amber-700" : "text-slate-900")}>{t.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">By student</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto [contain:inline-size]">
                {data.students.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No tasks in this period.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-[11px] uppercase text-slate-500 text-left">
                      <tr>
                        <th className="py-2 pr-3">Student</th>
                        <th className="py-2 pr-3 w-40">Completed</th>
                        <th className="py-2 pr-3">On time</th>
                        <th className="py-2 pr-3">Overdue</th>
                        <th className="py-2 pr-3">Stuck</th>
                        <th className="py-2">To review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.students.map((s) => (
                        <tr key={s.studentId} className="hover:bg-slate-50 cursor-pointer" onClick={() => onFilterStudent(s.studentId)} title="Show this student's tasks">
                          <td className="py-2 pr-3 font-medium text-slate-800">{s.studentName}</td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-2">
                              <Bar value={s.completionRate} tone="emerald" />
                              <span className="text-xs text-slate-600 whitespace-nowrap">
                                {s.completed}/{s.total}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 pr-3 text-xs">{pct(s.onTimeRate)}</td>
                          <td className={cn("py-2 pr-3 text-xs", s.overdue && "text-rose-600 font-semibold")}>{s.overdue}</td>
                          <td className={cn("py-2 pr-3 text-xs", s.stuck && "text-amber-700 font-semibold")}>{s.stuck}</td>
                          <td className="py-2 text-xs">{s.pendingReview}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Stuck items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {data.stuck.length === 0 ? (
                    <p className="text-xs text-slate-500">Nothing has been sitting in progress for more than {STUCK_AFTER_DAYS} days.</p>
                  ) : (
                    data.stuck.map((s) => (
                      <button key={s.studentTaskId} type="button" onClick={() => onOpenItem(s.taskId, s.studentTaskId)} className="w-full text-left rounded-md border px-2.5 py-1.5 hover:bg-slate-50">
                        <p className="text-xs font-medium text-slate-800 truncate">
                          <span className="font-mono text-slate-400">{formatTaskKey(s.taskId)}</span> {s.title}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          {s.studentName} · {TASK_STATUSES[s.status as TaskStatus]?.label ?? s.status} ·
                          <Clock className="h-3 w-3" /> since {new Date(s.since).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">By category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.categories.map((c) => (
                    <div key={c.category}>
                      <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                        <span>{c.category}</span>
                        <span>
                          {c.completed}/{c.total}
                        </span>
                      </div>
                      <Bar value={c.total ? c.completed / c.total : 0} />
                    </div>
                  ))}
                  {data.categories.length === 0 && <p className="text-xs text-slate-500">No data.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
