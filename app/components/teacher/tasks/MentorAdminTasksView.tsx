"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { taskApi } from "@/components/tasks/api";
import { useTaskFilters } from "@/components/tasks/hooks";
import { TaskListTable } from "@/components/tasks/TaskListTable";
import { TaskFilterBar } from "@/components/tasks/TaskFilterBar";
import { ChecklistView } from "@/components/tasks/Checklist";
import { ActivityLog } from "@/components/tasks/ActivityLog";
import type { StatusCounts, TaskItem } from "@/components/tasks/types";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  formatTaskKey,
  getDeadlineLabel,
  isSafeHttpUrl,
  isTaskOverdue,
  readChecklist,
  readChecklistDone,
  taskCreatorName,
} from "@/lib/tasks";
import { AlertCircle, Eye, Inbox, Info, Loader2, RefreshCw, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

interface FromAdminResponse {
  items: TaskItem[];
  truncated: boolean;
  columnCounts: StatusCounts;
}

/**
 * Tasks the ACHARYA admin team assigned to this mentor's students. Read-only:
 * the admin team reviews them, so mentors can follow progress but can't
 * review, edit or comment.
 */
export function MentorAdminTasksView() {
  const f = useTaskFilters("list");
  const [data, setData] = useState<FromAdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const requestSeq = useRef(0);

  const load = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const res = await taskApi<FromAdminResponse>(`/api/teacher/tasks/from-admin${f.apiQuery ? `?${f.apiQuery}` : ""}`);
      if (seq !== requestSeq.current) return;
      setData(res);
      setError(null);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError((err as Error).message || "Could not load tasks");
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [f.apiQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = useMemo(() => data?.items ?? [], [data]);
  const students = useMemo(() => {
    const map = new Map<number, { id: number; name: string; grade?: string | null }>();
    items.forEach((i) => i.student && map.set(i.student.id, { id: i.student.id, name: i.student.name, grade: i.student.grade }));
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);
  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.task.category))).sort(), [items]);
  const summary = openId != null ? items.find((i) => i.id === openId) ?? null : null;

  return (
    <div className="space-y-5">
      <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-900 flex items-start gap-2">
        <Eye className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
        <span>
          Tasks the ACHARYA admin team assigned to your students. You can follow progress here; the admin team reviews
          them, so this view is read-only.
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <TaskFilterBar
            f={f}
            categories={categories}
            students={students}
            perspective="mentor"
            reviewLabel="Awaiting admin review"
          />
        </div>
        <Button
          onClick={() => void load()}
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 shrink-0"
          title="Refresh"
          aria-label="Refresh tasks"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> Couldn&apos;t load tasks: {error}
          </span>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      {data?.truncated && (
        <div className="p-3 rounded-lg border border-sky-200 bg-sky-50 text-xs text-sky-900 flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-sky-600" />
          Showing the first {items.length} tasks. Use search or filters to narrow the list.
        </div>
      )}

      {!data ? (
        !error && (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        )
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 flex flex-col items-center text-center gap-2">
            {f.hasActiveFilters ? (
              <SearchX className="h-8 w-8 text-slate-400" />
            ) : (
              <Inbox className="h-8 w-8 text-indigo-400" />
            )}
            <h3 className="text-sm font-semibold text-slate-800">
              {f.hasActiveFilters ? "No tasks match these filters" : "No admin tasks for your students"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {f.hasActiveFilters
                ? "Try a different search, or reset the filters."
                : "When the admin team assigns a task to one of your students, it will show up here."}
            </p>
            {f.hasActiveFilters && (
              <Button size="sm" variant="outline" className="mt-2" onClick={f.resetFilters}>
                Reset filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TaskListTable items={items} perspective="mentor" onOpen={(item) => setOpenId(item.id)} />
      )}

      <ReadOnlyTaskDialog studentTaskId={openId} summary={summary} onClose={() => setOpenId(null)} />
    </div>
  );
}

function ReadOnlyTaskDialog({
  studentTaskId,
  summary,
  onClose,
}: {
  studentTaskId: number | null;
  summary: TaskItem | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<TaskItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDetail(null);
    setError(null);
    if (studentTaskId == null) return;
    let cancelled = false;
    taskApi<{ task: TaskItem }>(`/api/teacher/tasks/from-admin/${studentTaskId}`)
      .then((res) => !cancelled && setDetail(res.task))
      .catch((err) => !cancelled && setError((err as Error).message));
    return () => {
      cancelled = true;
    };
  }, [studentTaskId]);

  const item = detail ?? summary;
  return (
    <Dialog open={studentTaskId != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        {!item ? (
          <div className="py-12 flex flex-col items-center gap-2 text-sm text-slate-500">
            <DialogHeader className="sr-only">
              <DialogTitle>Task details</DialogTitle>
              <DialogDescription>Loading task details</DialogDescription>
            </DialogHeader>
            {error ? <p>{error}</p> : <Loader2 className="h-6 w-6 animate-spin" />}
          </div>
        ) : (
          <ReadOnlyTaskBody item={item} detailLoaded={Boolean(detail)} error={error} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReadOnlyTaskBody({ item, detailLoaded, error }: { item: TaskItem; detailLoaded: boolean; error: string | null }) {
  const { task } = item;
  const status = TASK_STATUSES[item.status] ?? TASK_STATUSES.TODO;
  const priority = TASK_PRIORITIES[task.priority] ?? TASK_PRIORITIES.MEDIUM;
  const overdue = isTaskOverdue(task.deadline, item.status);
  const checklist = readChecklist(task.checklist);
  const done = readChecklistDone(item.checklistDone, checklist);

  return (
    <div className="space-y-5">
      <DialogHeader className="space-y-1 text-left pb-3 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{formatTaskKey(task.id)}</span>
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", priority.color)}>{priority.label} priority</span>
          <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", status.color)}>{status.label}</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium border border-amber-200 bg-amber-50 text-amber-800 inline-flex items-center gap-1">
            <Eye className="h-3 w-3" /> View only
          </span>
        </div>
        <DialogTitle className="text-lg font-bold text-slate-900 pr-6">{task.title}</DialogTitle>
        <DialogDescription className="text-xs text-slate-500">
          {item.student?.name ?? "Student"} · {task.category} · Assigned by {taskCreatorName(task)} (admin team)
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deadline</p>
          <p className={cn("mt-0.5 font-medium", overdue ? "text-rose-600" : "text-slate-700")}>
            {task.deadline ? getDeadlineLabel(task.deadline).text : "No deadline"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last update</p>
          <p className="mt-0.5 text-slate-700">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}</p>
        </div>
      </div>

      <div className="p-3.5 bg-slate-50 rounded-lg border text-sm text-slate-800 whitespace-pre-wrap break-words">
        {task.description}
      </div>

      {checklist.length > 0 && (
        <div className="p-3.5 rounded-lg border bg-white">
          <ChecklistView items={checklist} done={done} />
        </div>
      )}

      {(item.submissionNote || item.submissionUrl || item.submissionFileUrl) && (
        <div className="p-3.5 rounded-lg border bg-white space-y-1.5 text-xs">
          <p className="font-bold uppercase tracking-wider text-slate-600">Submission</p>
          {item.submissionNote && <p className="whitespace-pre-wrap text-slate-800 break-words">{item.submissionNote}</p>}
          {item.submissionUrl && isSafeHttpUrl(item.submissionUrl) && (
            <a href={item.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-all">
              {item.submissionUrl}
            </a>
          )}
          {item.submissionFileUrl && isSafeHttpUrl(item.submissionFileUrl) && (
            <a href={item.submissionFileUrl} target="_blank" rel="noopener noreferrer" className="block text-indigo-600 underline break-all">
              {item.submissionFileName || "Attached file"}
            </a>
          )}
        </div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Activity</p>
        {detailLoaded ? (
          <ActivityLog activities={item.activities ?? []} />
        ) : error ? (
          <p className="text-xs text-slate-500">{error}</p>
        ) : (
          <div className="py-4 flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}
      </div>
    </div>
  );
}
