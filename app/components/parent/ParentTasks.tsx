"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShimmerSkeleton } from "@/components/ui/dashboard-loading-skeleton";
import { taskApi } from "@/components/tasks/api";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  formatTaskKey,
  getDeadlineLabel,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks";
import { AlertCircle, CheckCircle2, ClipboardList, Inbox, ListChecks, RefreshCw, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParentTask {
  id: number;
  taskId: number;
  studentId: number;
  studentName: string;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  deadline: string | null;
  mentorName: string;
  status: TaskStatus;
  isOverdue: boolean;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  mentorFeedback: string | null;
  checklist: { done: number; total: number };
}

type StatusFilter = "ALL" | "OPEN" | "OVERDUE" | "COMPLETED";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "COMPLETED", label: "Completed" },
];

function matchesStatus(t: ParentTask, filter: StatusFilter): boolean {
  if (filter === "OPEN") return t.status !== "COMPLETED";
  if (filter === "OVERDUE") return t.isOverdue;
  if (filter === "COMPLETED") return t.status === "COMPLETED";
  return true;
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";
}

/** Read-only overview of the tasks mentors have assigned to the parent's children. */
export default function ParentTasks() {
  const [tasks, setTasks] = useState<ParentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childFilter, setChildFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskApi<{ tasks: ParentTask[] }>("/api/parent/tasks");
      setTasks(data.tasks ?? []);
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Could not load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const children = useMemo(() => {
    const byId = new Map<number, { id: number; name: string; total: number; open: number; overdue: number; completed: number }>();
    tasks.forEach((t) => {
      const c = byId.get(t.studentId) ?? { id: t.studentId, name: t.studentName, total: 0, open: 0, overdue: 0, completed: 0 };
      c.total += 1;
      if (t.status === "COMPLETED") c.completed += 1;
      else c.open += 1;
      if (t.isOverdue) c.overdue += 1;
      byId.set(t.studentId, c);
    });
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  // Drop a child filter that no longer matches anyone (e.g. after a reload).
  useEffect(() => {
    if (childFilter !== "ALL" && !children.some((c) => String(c.id) === childFilter)) setChildFilter("ALL");
  }, [children, childFilter]);

  const childTasks = useMemo(
    () => (childFilter === "ALL" ? tasks : tasks.filter((t) => String(t.studentId) === childFilter)),
    [tasks, childFilter]
  );
  const visible = useMemo(() => childTasks.filter((t) => matchesStatus(t, statusFilter)), [childTasks, statusFilter]);
  const statusCounts = useMemo(
    () =>
      Object.fromEntries(STATUS_FILTERS.map((s) => [s.value, childTasks.filter((t) => matchesStatus(t, s.value)).length])) as Record<
        StatusFilter,
        number
      >,
    [childTasks]
  );
  const multipleChildren = children.length > 1;

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
          <p className="text-sm text-slate-500">Action items your child&apos;s mentors have assigned, and how they&apos;re progressing.</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="gap-1.5 self-start sm:self-auto">
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
      </Button>
    </div>
  );

  if (loading && !tasks.length && !error) {
    return (
      <div className="space-y-4">
        {header}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <ShimmerSkeleton key={`parent-task-summary-${i}`} className="h-28 rounded-xl" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerSkeleton key={`parent-task-row-${i}`} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error && !tasks.length) {
    return (
      <div className="space-y-4">
        {header}
        <Card className="border-rose-200">
          <CardContent className="py-10 flex flex-col items-center gap-2 text-center">
            <AlertCircle className="h-7 w-7 text-rose-500" />
            <p className="text-sm font-semibold text-slate-800">Couldn&apos;t load tasks</p>
            <p className="text-xs text-slate-500">{error}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => void load()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="space-y-4">
        {header}
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center gap-2 text-center">
            <Inbox className="h-8 w-8 text-indigo-400" />
            <p className="text-sm font-semibold text-slate-800">No tasks yet</p>
            <p className="text-xs text-slate-500 max-w-sm">When a mentor assigns your child a task, you&apos;ll be able to follow its progress here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {header}

      {error && (
        <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center justify-between gap-2">
          <span>Couldn&apos;t refresh tasks: {error}</span>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      {/* Per-child summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((c) => {
          const pct = c.total ? Math.round((c.completed / c.total) * 100) : 0;
          const selected = childFilter === String(c.id);
          return (
            <Card
              key={c.id}
              role={multipleChildren ? "button" : undefined}
              tabIndex={multipleChildren ? 0 : undefined}
              aria-pressed={multipleChildren ? selected : undefined}
              onClick={multipleChildren ? () => setChildFilter(selected ? "ALL" : String(c.id)) : undefined}
              onKeyDown={
                multipleChildren
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setChildFilter(selected ? "ALL" : String(c.id));
                      }
                    }
                  : undefined
              }
              className={cn(
                "border shadow-sm transition-all",
                multipleChildren && "cursor-pointer hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                selected && "ring-2 ring-indigo-500/30 border-indigo-300"
              )}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                    <User className="h-4 w-4 text-indigo-500 shrink-0" /> {c.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{pct}% complete</span>
                </div>
                <div
                  className="h-1.5 rounded-full bg-slate-100 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${c.name}: ${pct}% of tasks completed`}
                >
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <SummaryStat label="Open" value={c.open} tone="text-blue-700" />
                  <SummaryStat label="Overdue" value={c.overdue} tone={c.overdue ? "text-rose-600" : "text-slate-400"} />
                  <SummaryStat label="Completed" value={c.completed} tone="text-emerald-700" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
        {multipleChildren && (
          <div className="w-full sm:w-52">
            <Select value={childFilter} onValueChange={setChildFilter}>
              <SelectTrigger className="bg-white h-9 text-xs" aria-label="Filter by child">
                <SelectValue placeholder="All children" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All children</SelectItem>
                {children.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((s) => {
            const active = statusFilter === s.value;
            return (
              <button
                key={s.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(s.value)}
                className={cn(
                  "px-3 py-1 rounded-full border text-xs transition-colors flex items-center gap-1.5",
                  active
                    ? s.value === "OVERDUE"
                      ? "bg-rose-100 text-rose-800 border-rose-300 font-medium"
                      : "bg-indigo-100 text-indigo-800 border-indigo-300 font-medium"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                {s.label}
                <span className="text-[10px] text-slate-500">{statusCounts[s.value]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list */}
      {visible.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-slate-500">No tasks match these filters.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((t) => (
            <ParentTaskCard key={t.id} task={t} showChild={multipleChildren && childFilter === "ALL"} />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg bg-slate-50 py-1.5">
      <p className={cn("text-lg font-bold leading-tight", tone)}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</p>
    </div>
  );
}

function ParentTaskCard({ task: t, showChild }: { task: ParentTask; showChild: boolean }) {
  const statusMeta = TASK_STATUSES[t.status] ?? TASK_STATUSES.TODO;
  const priorityMeta = TASK_PRIORITIES[t.priority] ?? TASK_PRIORITIES.MEDIUM;
  const deadline = getDeadlineLabel(t.deadline);
  const pct = t.checklist.total ? Math.round((t.checklist.done / t.checklist.total) * 100) : 0;

  return (
    <Card className={cn("border shadow-sm", t.isOverdue && "border-rose-300 bg-rose-50/30")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-1">
              <span className="font-mono font-semibold text-slate-500">{formatTaskKey(t.taskId)}</span>
              <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600">{t.category}</span>
              <span className={cn("px-1.5 py-0.5 rounded font-medium border inline-flex items-center gap-1", priorityMeta.color)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", priorityMeta.dotColor)} />
                {priorityMeta.label}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 leading-snug break-words">{t.title}</h3>
            {t.description && <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 break-words">{t.description}</p>}
          </div>
          <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap self-start", statusMeta.color)}>
            {statusMeta.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          {showChild && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-slate-400" /> {t.studentName}
            </span>
          )}
          <span>
            Mentor: <span className="font-medium text-slate-800">{t.mentorName}</span>
          </span>
          {t.status === "COMPLETED" && t.completedAt ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed {formatDate(t.completedAt)}
            </span>
          ) : (
            <span
              className={cn(
                "flex items-center gap-1 font-medium",
                t.isOverdue ? "text-rose-600 font-bold" : deadline.isToday ? "text-blue-600" : "text-slate-600"
              )}
            >
              {t.isOverdue && <AlertCircle className="h-3.5 w-3.5" />}
              {deadline.text}
            </span>
          )}
          {t.status === "SUBMITTED" && t.submittedAt && (
            <span className="text-amber-700">Submitted {formatDate(t.submittedAt)}</span>
          )}
        </div>

        {t.checklist.total > 0 && (
          <div title={`${t.checklist.done} of ${t.checklist.total} checklist steps done`}>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <ListChecks className="h-3.5 w-3.5" /> Checklist
              </span>
              <span className="font-medium">
                {t.checklist.done}/{t.checklist.total}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn("h-full rounded-full", pct === 100 ? "bg-emerald-500" : "bg-indigo-500")}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {t.mentorFeedback && (
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-900">
            <p className="font-semibold flex items-center gap-1.5 mb-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Mentor&apos;s approval note
            </p>
            <p className="whitespace-pre-wrap break-words pl-5">{t.mentorFeedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
