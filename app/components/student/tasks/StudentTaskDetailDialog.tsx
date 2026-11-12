"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChecklistView } from "@/components/tasks/Checklist";
import { CommentThread } from "@/components/tasks/CommentThread";
import { ActivityLog } from "@/components/tasks/ActivityLog";
import { LinkedItems } from "@/components/tasks/LinkedItems";
import type { TaskItem } from "@/components/tasks/types";
import {
  TASK_PRIORITIES,
  TASK_RECURRENCES,
  TASK_STATUSES,
  canStudentPerform,
  formatTaskKey,
  getDeadlineLabel,
  isTaskOverdue,
  isTaskRecurrence,
  readChecklist,
  readChecklistDone,
  type StudentTaskAction,
} from "@/lib/tasks";
import { AlertCircle, AlertTriangle, CheckCircle2, History, Loader2, MessageSquare, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubmissionForm } from "./SubmissionForm";
import { fetchStudentTaskDetail, patchStudentTask, type SubmissionPayload } from "./studentTaskApi";

interface StudentTaskDetailDialogProps {
  /** studentTask id to show; null closes the dialog. */
  studentTaskId: number | null;
  /** List copy of the item, shown immediately while the full detail loads. */
  summary?: TaskItem | null;
  studentName?: string;
  /** Bump to reload the detail (e.g. on a realtime event). */
  reloadSignal: number;
  onClose: () => void;
  /** Called after any change so the list / board can refresh. */
  onChanged: () => void;
}

const SUCCESS_MESSAGES: Record<string, { title: string; description: string }> = {
  START: { title: "Task started", description: "Status changed to In Progress." },
  SAVE_DRAFT: { title: "Draft saved", description: "Your responses have been saved." },
  SUBMITTED: { title: "Task submitted!", description: "Your work has been sent to your mentor for review." },
  COMPLETED: { title: "Task completed!", description: "Great job! The task is marked as completed." },
};

export function StudentTaskDetailDialog({
  studentTaskId,
  summary,
  studentName,
  reloadSignal,
  onClose,
  onChanged,
}: StudentTaskDetailDialogProps) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<TaskItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checklistBusy, setChecklistBusy] = useState<string | null>(null);
  const requestSeq = useRef(0);
  // Saves in flight: reload results are ignored meanwhile so they can't undo
  // what's on screen; the last save to finish reloads.
  const pendingWrites = useRef(0);

  const load = useCallback(async (id: number) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const data = await fetchStudentTaskDetail(id);
      if (seq !== requestSeq.current || pendingWrites.current > 0) return;
      setDetail(data.task);
      setError(null);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError((err as Error).message);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  // Reset when switching tasks, then load.
  useEffect(() => {
    setDetail(null);
    setError(null);
    if (studentTaskId != null) {
      void load(studentTaskId);
    } else {
      requestSeq.current++;
      setLoading(false);
    }
  }, [studentTaskId, load]);

  // Reload on external signals (realtime), keeping what's on screen meanwhile.
  const lastSignal = useRef(reloadSignal);
  useEffect(() => {
    if (lastSignal.current === reloadSignal) return;
    lastSignal.current = reloadSignal;
    if (studentTaskId != null) void load(studentTaskId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadSignal]);

  const item = detail && detail.id === studentTaskId ? detail : summary && summary.id === studentTaskId ? summary : null;

  const runAction = async (
    action: Exclude<StudentTaskAction, "TOGGLE_CHECKLIST">,
    payload?: SubmissionPayload
  ): Promise<boolean> => {
    if (!item) return false;
    // Show the result immediately; undo it if the server rejects the change.
    const before = item;
    const now = new Date().toISOString();
    const expected: Partial<TaskItem> =
      action === "START"
        ? { status: "IN_PROGRESS", startedAt: item.startedAt ?? now }
        : action === "SUBMIT"
          ? { ...payload, status: item.task.requireMentorApproval ? "SUBMITTED" : "COMPLETED", submittedAt: now }
          : action === "COMPLETE_DIRECT"
            ? { status: "COMPLETED", completedAt: now }
            : { ...payload, status: item.status === "TODO" ? "IN_PROGRESS" : item.status }; // SAVE_DRAFT
    pendingWrites.current += 1;
    setDetail({ ...item, ...expected });
    setBusy(true);
    try {
      const res = await patchStudentTask(item.id, action, payload ?? {});
      const newStatus = res.task?.status;
      const message =
        action === "SUBMIT" || action === "COMPLETE_DIRECT"
          ? SUCCESS_MESSAGES[newStatus === "SUBMITTED" ? "SUBMITTED" : "COMPLETED"]
          : SUCCESS_MESSAGES[action];
      if (message) toast(message);
      if (res.task) {
        const saved = res.task;
        setDetail((d) => (d && d.id === before.id ? { ...d, ...saved, task: d.task } : d));
      }
      onChanged();
      return true;
    } catch (err) {
      setDetail((d) => (d && d.id === before.id ? before : d));
      toast({ title: "Couldn't update task — change undone", description: (err as Error).message, variant: "destructive" });
      return false;
    } finally {
      setBusy(false);
      pendingWrites.current -= 1;
      if (pendingWrites.current === 0) void load(before.id);
    }
  };

  const toggleChecklist = async (itemId: string, done: boolean) => {
    if (!item) return;
    const previous = readChecklistDone(item.checklistDone, readChecklist(item.task.checklist));
    const optimistic = done ? Array.from(new Set([...previous, itemId])) : previous.filter((id) => id !== itemId);
    // Ticking a step on a To Do task starts it (the server does the same).
    setDetail((d) =>
      d && d.id === item.id
        ? { ...d, checklistDone: optimistic, status: d.status === "TODO" ? "IN_PROGRESS" : d.status }
        : d
    );
    setChecklistBusy(itemId);
    pendingWrites.current += 1;
    try {
      await patchStudentTask(item.id, "TOGGLE_CHECKLIST", { itemId, done });
      onChanged();
    } catch (err) {
      const previousStatus = item.status;
      setDetail((d) => (d && d.id === item.id ? { ...d, checklistDone: previous, status: previousStatus } : d));
      toast({ title: "Couldn't update checklist", description: (err as Error).message, variant: "destructive" });
    } finally {
      setChecklistBusy(null);
      pendingWrites.current -= 1;
      if (pendingWrites.current === 0) void load(item.id);
    }
  };

  const open = studentTaskId != null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
        {!item ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-sm text-slate-500">
            <DialogHeader className="sr-only">
              <DialogTitle>Task details</DialogTitle>
              <DialogDescription>Loading task details</DialogDescription>
            </DialogHeader>
            {error ? (
              <>
                <AlertCircle className="h-6 w-6 text-rose-500" />
                <p className="text-slate-700">{error}</p>
                <Button size="sm" variant="outline" onClick={() => studentTaskId != null && void load(studentTaskId)}>
                  Try again
                </Button>
              </>
            ) : (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                Loading task…
              </>
            )}
          </div>
        ) : (
          <TaskDetailBody
            item={item}
            detailLoaded={Boolean(detail)}
            loading={loading}
            error={error}
            busy={busy}
            checklistBusy={checklistBusy}
            studentName={studentName}
            onAction={runAction}
            onToggleChecklist={toggleChecklist}
            onReload={() => void load(item.id)}
            onCommentPosted={() => {
              void load(item.id);
              onChanged();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface TaskDetailBodyProps {
  item: TaskItem;
  detailLoaded: boolean;
  loading: boolean;
  error: string | null;
  busy: boolean;
  checklistBusy: string | null;
  studentName?: string;
  onAction: (action: Exclude<StudentTaskAction, "TOGGLE_CHECKLIST">, payload?: SubmissionPayload) => Promise<boolean>;
  onToggleChecklist: (itemId: string, done: boolean) => void;
  onReload: () => void;
  onCommentPosted: () => void;
}

function TaskDetailBody({
  item,
  detailLoaded,
  loading,
  error,
  busy,
  checklistBusy,
  studentName,
  onAction,
  onToggleChecklist,
  onReload,
  onCommentPosted,
}: TaskDetailBodyProps) {
  const { task } = item;
  const statusMeta = TASK_STATUSES[item.status] ?? TASK_STATUSES.TODO;
  const priorityMeta = TASK_PRIORITIES[task.priority] ?? TASK_PRIORITIES.MEDIUM;
  const deadline = getDeadlineLabel(task.deadline);
  const overdue = isTaskOverdue(task.deadline, item.status) && item.status !== "SUBMITTED";
  const checklist = readChecklist(task.checklist);
  const checklistDone = readChecklistDone(item.checklistDone, checklist);
  // Toggles are optimistic on the loaded detail, so wait for it before enabling them.
  const canToggle = detailLoaded && !task.isCancelled && canStudentPerform("TOGGLE_CHECKLIST", item.status);
  const mentorName = task.creator?.name || "Your mentor";
  const recurrenceLabel = task.recurrence
    ? isTaskRecurrence(task.recurrence)
      ? TASK_RECURRENCES[task.recurrence].label
      : "Recurring"
    : null;

  const participants: { name: string; role: "teacher" | "student" }[] = [
    { name: studentName?.trim() || "Student", role: "student" },
    ...(task.creator?.name ? [{ name: task.creator.name, role: "teacher" as const }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <DialogHeader className="space-y-0 text-left pb-3 border-b">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{formatTaskKey(task.id)}</span>
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium border inline-flex items-center gap-1", priorityMeta.color)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", priorityMeta.dotColor)} />
            {priorityMeta.label} priority
          </span>
          <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", statusMeta.color)}>{statusMeta.label}</span>
          {recurrenceLabel && (
            <span className="px-2 py-0.5 rounded text-xs font-medium border border-indigo-200 bg-indigo-50 text-indigo-700 inline-flex items-center gap-1">
              <Repeat className="h-3 w-3" /> {recurrenceLabel}
            </span>
          )}
          {task.deadline && (
            <span
              className={cn(
                "text-xs font-medium inline-flex items-center gap-1",
                overdue ? "text-rose-600 font-bold" : deadline.isToday ? "text-blue-600" : "text-slate-500"
              )}
            >
              {overdue && <AlertCircle className="h-3 w-3" />}
              {deadline.text}
            </span>
          )}
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" aria-label="Refreshing" />}
        </div>
        <DialogTitle className="text-xl font-bold text-slate-900 pr-6">{task.title}</DialogTitle>
        <DialogDescription className="text-xs text-slate-500">
          {task.category} · Assigned by {mentorName}
        </DialogDescription>
      </DialogHeader>

      {error && detailLoaded && (
        <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center justify-between gap-2">
          <span>Couldn&apos;t refresh this task: {error}</span>
          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={onReload}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5 min-w-0">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description & instructions</h4>
            <div className="p-3.5 bg-slate-50 rounded-lg border text-sm text-slate-800 whitespace-pre-wrap leading-relaxed break-words">
              {task.description || <span className="text-slate-400">No description provided.</span>}
            </div>
          </div>

          <LinkedItems links={task} dashboard="student-dashboard" />

          {item.mentorFeedback && (
            <div
              className={cn(
                "p-3.5 rounded-lg border text-xs space-y-1",
                item.status === "CHANGES_REQUESTED"
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : item.status === "COMPLETED"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
              )}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {item.status === "COMPLETED" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <span>
                  {item.status === "CHANGES_REQUESTED" ? "Changes requested by" : "Feedback from"} {mentorName}
                </span>
                {item.reviewedAt && (
                  <span className="font-normal opacity-70">· {new Date(item.reviewedAt).toLocaleDateString()}</span>
                )}
              </div>
              <p className="whitespace-pre-wrap pl-5 break-words">{item.mentorFeedback}</p>
            </div>
          )}

          {checklist.length > 0 && (
            <div className="p-3.5 rounded-lg border bg-white">
              <ChecklistView
                items={checklist}
                done={checklistDone}
                onToggle={canToggle ? (id, done) => void onToggleChecklist(id, done) : undefined}
                busyItemId={checklistBusy}
              />
            </div>
          )}

          <SubmissionForm key={item.id} item={item} busy={busy} onAction={onAction} />

          <Tabs defaultValue="comments">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments" className="text-xs gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Comments
                {detailLoaded ? ` (${item.comments?.length ?? 0})` : ""}
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs gap-1.5">
                <History className="h-3.5 w-3.5" /> Activity
              </TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="pt-3">
              {detailLoaded ? (
                <CommentThread
                  studentTaskId={item.id}
                  comments={item.comments ?? []}
                  participants={participants}
                  currentRole="student"
                  onPosted={onCommentPosted}
                  disabled={task.isCancelled}
                />
              ) : (
                <DetailPlaceholder error={error} onRetry={onReload} />
              )}
            </TabsContent>
            <TabsContent value="activity" className="pt-3">
              {detailLoaded ? <ActivityLog activities={item.activities ?? []} /> : <DetailPlaceholder error={error} onRetry={onReload} />}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200 text-xs h-fit">
          <MetaRow label="Status">
            <span className={cn("px-2.5 py-1 rounded-full font-semibold border inline-flex", statusMeta.color)}>{statusMeta.label}</span>
          </MetaRow>
          <MetaRow label="Priority">
            <span className={cn("px-2 py-0.5 rounded font-medium border inline-flex items-center gap-1", priorityMeta.color)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", priorityMeta.dotColor)} />
              {priorityMeta.label}
            </span>
          </MetaRow>
          <MetaRow label="Deadline">
            {task.deadline ? (
              <div className={cn("font-medium", overdue ? "text-rose-600 font-bold" : "text-slate-700")}>
                {deadline.text}
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                  {new Date(task.deadline).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            ) : (
              <span className="text-slate-400">No deadline set</span>
            )}
          </MetaRow>
          {recurrenceLabel && (
            <MetaRow label="Repeats">
              <span className="text-slate-700">{recurrenceLabel}</span>
              {task.recurrenceEndsAt && (
                <p className="text-[10px] text-slate-400">until {new Date(task.recurrenceEndsAt).toLocaleDateString()}</p>
              )}
            </MetaRow>
          )}
          <Separator />
          <MetaRow label="Mentor">
            <p className="font-semibold text-slate-800">{mentorName}</p>
            {task.creator?.email && <p className="text-[10px] text-slate-500 break-all">{task.creator.email}</p>}
          </MetaRow>
          <MetaRow label="Category">
            <span className="text-slate-700">{task.category}</span>
          </MetaRow>
          <MetaRow label="Assigned">
            <span className="text-slate-600">{new Date(task.createdAt).toLocaleDateString()}</span>
          </MetaRow>
          {item.startedAt && (
            <MetaRow label="Started">
              <span className="text-slate-600">{new Date(item.startedAt).toLocaleDateString()}</span>
            </MetaRow>
          )}
          {item.submittedAt && (
            <MetaRow label="Submitted">
              <span className="text-slate-600">{new Date(item.submittedAt).toLocaleDateString()}</span>
            </MetaRow>
          )}
          {item.completedAt && (
            <MetaRow label="Completed">
              <span className="text-emerald-700 font-semibold">{new Date(item.completedAt).toLocaleDateString()}</span>
            </MetaRow>
          )}
        </aside>
      </div>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</span>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function DetailPlaceholder({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  if (error) {
    return (
      <div className="py-6 text-center text-xs text-slate-500 space-y-2">
        <p>{error}</p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }
  return (
    <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
    </div>
  );
}
