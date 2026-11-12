"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  TASK_PRIORITIES,
  TASK_RECURRENCES,
  TASK_STATUSES,
  canMentorPerform,
  formatTaskKey,
  getChecklistProgress,
  isSafeHttpUrl,
  isTaskOverdue,
  readChecklist,
  readChecklistDone,
  requiresChecklistCompletion,
  type MentorReviewAction,
  type TaskRecurrence,
} from "@/lib/tasks";
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Paperclip,
  Pencil,
  Repeat,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { taskApi } from "@/components/tasks/api";
import { ChecklistView } from "@/components/tasks/Checklist";
import { CommentThread } from "@/components/tasks/CommentThread";
import { ActivityLog } from "@/components/tasks/ActivityLog";
import { LinkedItems } from "@/components/tasks/LinkedItems";
import type { TaskItem, TaskRecordBase } from "@/components/tasks/types";

export type DetailTask = TaskRecordBase & {
  studentTasks: Omit<TaskItem, "task">[];
  template?: { id: number; name: string } | null;
};

interface TaskDetailDialogProps {
  taskId: number | null;
  studentTaskId: number | null;
  /** What the board already knows about this task, shown instantly while the full detail loads. */
  initialTask?: DetailTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
  onEdit: (task: TaskRecordBase, assignedStudentIds: number[]) => void;
  onDuplicate: (task: TaskRecordBase) => void;
  /** Bumped by the parent on realtime events to reload the open task. */
  refreshKey?: number;
}

const REVIEW_TARGET: Record<MentorReviewAction, TaskItem["status"]> = {
  APPROVE: "COMPLETED",
  REQUEST_CHANGES: "CHANGES_REQUESTED",
  REOPEN: "IN_PROGRESS",
};

export function TaskDetailDialog({
  taskId,
  studentTaskId,
  initialTask,
  open,
  onOpenChange,
  onChanged,
  onEdit,
  onDuplicate,
  refreshKey,
}: TaskDetailDialogProps) {
  const { toast } = useToast();
  const [task, setTask] = useState<DetailTask | null>(null);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(studentTaskId);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Saves in flight. While > 0, reload results are ignored so they can't undo
  // what's on screen; each save reloads once it finishes.
  const pendingWrites = useRef(0);

  const load = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await taskApi<{ task: DetailTask }>(`/api/teacher/tasks/${taskId}`);
      if (pendingWrites.current > 0) return;
      setTask(data.task);
      setFullyLoaded(true);
    } catch (err) {
      toast({ title: "Couldn't load task", description: (err as Error).message, variant: "destructive" });
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  useEffect(() => {
    if (open && taskId) {
      setTask(initialTask ?? null);
      setFullyLoaded(false);
      setActiveId(studentTaskId);
      setFeedback("");
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId, studentTaskId]);

  useEffect(() => {
    if (open && refreshKey) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const active = task?.studentTasks.find((st) => st.id === activeId) ?? task?.studentTasks[0] ?? null;
  const checklist = readChecklist(task?.checklist);

  /** Applies a change on screen now, saves it, and undoes it if the save fails. */
  const saveOptimistically = async (
    apply: (t: DetailTask) => DetailTask,
    save: () => Promise<void>,
    messages: { done: string; failed: string }
  ): Promise<boolean> => {
    const before = task;
    if (!before) return false;
    pendingWrites.current += 1;
    setTask(apply(before));
    try {
      await save();
      toast({ title: messages.done });
      onChanged();
      return true;
    } catch (err) {
      setTask(before);
      toast({ title: messages.failed, description: (err as Error).message, variant: "destructive" });
      return false;
    } finally {
      pendingWrites.current -= 1;
      if (pendingWrites.current === 0) void load();
    }
  };

  const review = async (action: MentorReviewAction) => {
    if (!active) return;
    const note = feedback.trim();
    if (action === "REQUEST_CHANGES" && !note) {
      toast({ title: "Feedback needed", description: "Tell the student what to change.", variant: "destructive" });
      return;
    }
    const target = active.id;
    setFeedback("");
    setBusy(action);
    const ok = await saveOptimistically(
      (t) => ({
        ...t,
        studentTasks: t.studentTasks.map((st) =>
          st.id === target
            ? {
                ...st,
                status: REVIEW_TARGET[action],
                mentorFeedback: note || st.mentorFeedback,
                reviewedAt: new Date().toISOString(),
                completedAt: action === "APPROVE" ? st.completedAt || new Date().toISOString() : null,
              }
            : st
        ),
      }),
      async () => {
        await taskApi("/api/teacher/tasks/review", {
          method: "POST",
          json: { studentTaskId: target, action, feedback: note || undefined },
        });
      },
      {
        done: action === "APPROVE" ? "Approved" : action === "REQUEST_CHANGES" ? "Changes requested" : "Reopened",
        failed: "Review failed — change undone",
      }
    );
    // Put the feedback back if the save failed, so it isn't lost.
    if (!ok) setFeedback(note);
    setBusy(null);
  };

  const toggleCancelled = async () => {
    if (!task) return;
    const cancel = !task.isCancelled;
    setBusy("cancel");
    await saveOptimistically(
      (t) => ({ ...t, isCancelled: cancel }),
      async () => {
        await taskApi(`/api/teacher/tasks/${task.id}`, { method: "PATCH", json: { isCancelled: cancel } });
      },
      { done: cancel ? "Task cancelled" : "Task reactivated", failed: "Couldn't update task — change undone" }
    );
    setBusy(null);
  };

  const deleteTask = async () => {
    if (!task) return;
    setBusy("delete");
    try {
      await taskApi(`/api/teacher/tasks/${task.id}`, { method: "DELETE" });
      toast({ title: "Task deleted" });
      setConfirmDelete(false);
      onOpenChange(false);
      onChanged();
    } catch (err) {
      toast({ title: "Couldn't delete task", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const priority = task ? TASK_PRIORITIES[task.priority] ?? TASK_PRIORITIES.MEDIUM : null;
  const canReview = (a: MentorReviewAction) => Boolean(active && task && !task.isCancelled && canMentorPerform(a, active.status));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          {!task ? (
            <div className="py-24 flex flex-col items-center gap-2 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Loading task…</span>
              <DialogTitle className="sr-only">Loading task</DialogTitle>
            </div>
          ) : (
            <>
              <DialogHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-semibold text-slate-500">{formatTaskKey(task.id)}</span>
                  {priority && (
                    <span className={cn("px-1.5 py-0.5 rounded border font-medium flex items-center gap-1", priority.color)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", priority.dotColor)} /> {priority.label}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">{task.category}</span>
                  {task.recurrence && (
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 flex items-center gap-1">
                      <Repeat className="h-3 w-3" /> {TASK_RECURRENCES[task.recurrence as TaskRecurrence]?.label ?? task.recurrence}
                    </span>
                  )}
                  {task.template && <span className="px-2 py-0.5 rounded bg-slate-50 border text-slate-500">Template: {task.template.name}</span>}
                  {task.isCancelled && <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">Cancelled</span>}
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900">{task.title}</DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  {task.deadline ? `Due ${new Date(task.deadline).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : "No deadline"}
                  {" · "}
                  {task.studentTasks.length} student{task.studentTasks.length === 1 ? "" : "s"}
                </DialogDescription>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => onEdit(task, task.studentTasks.map((st) => st.studentId))}>
                    <Pencil className="h-3.5 w-3.5" /> Edit / assign more
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => onDuplicate(task)}>
                    <Copy className="h-3.5 w-3.5" /> Duplicate
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => void toggleCancelled()} disabled={busy === "cancel"}>
                    {task.isCancelled ? <RotateCcw className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    {task.isCancelled ? "Reactivate" : "Cancel task"}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs text-rose-700 border-rose-200 hover:bg-rose-50" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 pt-3">
                {/* Left: task definition + students */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <Label className="text-[11px] font-bold uppercase text-slate-500">Description</Label>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap mt-1">{task.description}</p>
                  </div>
                  <LinkedItems links={task} dashboard="teacher-dashboard" />
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {task.requireSubmissionNote && <span className="px-2 py-0.5 rounded-full bg-slate-100">Note required</span>}
                    {task.requireFileUpload && <span className="px-2 py-0.5 rounded-full bg-slate-100">File required</span>}
                    {task.requireUrl && <span className="px-2 py-0.5 rounded-full bg-slate-100">Link required</span>}
                    {task.requireExternalConfirmation && <span className="px-2 py-0.5 rounded-full bg-slate-100">External confirmation</span>}
                    {requiresChecklistCompletion(task) && <span className="px-2 py-0.5 rounded-full bg-slate-100">All steps required</span>}
                    {task.requireMentorApproval && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Needs approval</span>}
                  </div>

                  <div>
                    <Label className="text-[11px] font-bold uppercase text-slate-500">Students</Label>
                    <ul className="mt-1.5 space-y-1">
                      {task.studentTasks.map((st) => {
                        const meta = TASK_STATUSES[st.status] ?? TASK_STATUSES.TODO;
                        const prog = getChecklistProgress(task.checklist, st.checklistDone);
                        const overdue = isTaskOverdue(task.deadline, st.status);
                        return (
                          <li key={st.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveId(st.id);
                                setFeedback("");
                              }}
                              className={cn(
                                "w-full text-left flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition-colors",
                                active?.id === st.id ? "border-indigo-300 bg-indigo-50" : "hover:bg-slate-50"
                              )}
                            >
                              <span className="font-medium text-slate-800 truncate flex-1">{st.student?.name}</span>
                              {prog.total > 0 && <span className="text-[10px] text-slate-500">{prog.done}/{prog.total}</span>}
                              {overdue && <span className="text-[10px] font-bold text-rose-600">Overdue</span>}
                              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap", meta.color)}>{meta.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Right: selected student's work */}
                {active && (
                  <div className="lg:col-span-3 space-y-4">
                    <div className="rounded-xl border bg-slate-50/70 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">{active.student?.name}&apos;s work</h3>
                        <span className="text-xs text-slate-500">
                          {active.submittedAt
                            ? `Submitted ${new Date(active.submittedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
                            : active.startedAt
                              ? `Started ${new Date(active.startedAt).toLocaleDateString()}`
                              : "Not started"}
                        </span>
                      </div>

                      {checklist.length > 0 && <ChecklistView items={checklist} done={readChecklistDone(active.checklistDone, checklist)} />}

                      {active.submissionNote && (
                        <div className="bg-white p-3 rounded-lg border">
                          <Label className="text-[11px] font-bold text-slate-500 uppercase">Student note</Label>
                          <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{active.submissionNote}</p>
                        </div>
                      )}
                      {isSafeHttpUrl(active.submissionUrl) && (
                        <div className="bg-white p-3 rounded-lg border">
                          <Label className="text-[11px] font-bold text-slate-500 uppercase">Submitted link</Label>
                          <a href={active.submissionUrl as string} target="_blank" rel="noreferrer" className="mt-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1.5 underline break-all">
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" /> {active.submissionUrl}
                          </a>
                        </div>
                      )}
                      {active.submissionFileUrl && (
                        <div className="bg-white p-3 rounded-lg border flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-800 flex items-center gap-2 truncate">
                            <Paperclip className="h-4 w-4 text-slate-400 shrink-0" /> {active.submissionFileName || "Attachment"}
                          </span>
                          <a href={active.submissionFileUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 shrink-0">
                            <Download className="h-3.5 w-3.5" /> Open
                          </a>
                        </div>
                      )}
                      {active.submissionExternalConfirmed && (
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-medium">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          Confirmed: &ldquo;{task.externalConfirmationPrompt || "External action completed"}&rdquo;
                        </div>
                      )}
                      {(active.status === "SUBMITTED" || active.status === "COMPLETED") &&
                        checklist.length > 0 &&
                        readChecklistDone(active.checklistDone, checklist).length < checklist.length && (
                          <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-start gap-2 text-rose-800 text-xs">
                            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-px" />
                            <span>
                              <strong>
                                {active.status === "SUBMITTED" ? "Submitted" : "Completed"} with{" "}
                                {readChecklistDone(active.checklistDone, checklist).length} of {checklist.length} checklist steps ticked.
                              </strong>{" "}
                              {active.status === "SUBMITTED"
                                ? "Check the unticked steps before approving, or request changes."
                                : "To require every step on future submissions, edit the task and turn on “Students must tick every step”."}
                            </span>
                          </div>
                        )}
                      {active.mentorFeedback && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                          <Label className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5" /> Your last feedback
                          </Label>
                          <p className="text-xs text-amber-900 mt-1 whitespace-pre-wrap">{active.mentorFeedback}</p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-200 space-y-2">
                        {!canReview("APPROVE") && !canReview("REQUEST_CHANGES") && !canReview("REOPEN") ? (
                          <p className="text-xs text-slate-500">
                            {task.isCancelled
                              ? "This task is cancelled. Reactivate it to review."
                              : "No review actions yet — the student hasn't submitted this task."}
                          </p>
                        ) : (
                          <>
                            <Label htmlFor="review-feedback" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Review & feedback
                            </Label>
                            <Textarea
                              id="review-feedback"
                              placeholder="Feedback for the student (required when requesting changes)…"
                              rows={2}
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              className="text-sm bg-white"
                            />
                            <div className="flex flex-wrap gap-2">
                              {canReview("APPROVE") && (
                                <Button size="sm" onClick={() => void review("APPROVE")} disabled={!!busy} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5">
                                  {busy === "APPROVE" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
                                </Button>
                              )}
                              {canReview("REQUEST_CHANGES") && (
                                <Button size="sm" variant="outline" onClick={() => void review("REQUEST_CHANGES")} disabled={!!busy} className="text-rose-700 border-rose-300 hover:bg-rose-50 text-xs h-8 gap-1.5">
                                  <AlertTriangle className="h-3.5 w-3.5" /> Request changes
                                </Button>
                              )}
                              {canReview("REOPEN") && (
                                <Button size="sm" variant="ghost" onClick={() => void review("REOPEN")} disabled={!!busy} className="text-slate-600 text-xs h-8 gap-1.5">
                                  <RotateCcw className="h-3.5 w-3.5" /> Reopen
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Tabs defaultValue="comments">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="comments">Comments ({active.comments?.length ?? active._count?.comments ?? 0})</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                      </TabsList>
                      <TabsContent value="comments" className="pt-3">
                        <CommentThread
                          studentTaskId={active.id}
                          comments={active.comments ?? []}
                          loading={!fullyLoaded}
                          participants={[
                            { name: task.creator?.name ?? "Mentor", role: "teacher" },
                            { name: active.student?.name ?? "Student", role: "student" },
                          ]}
                          currentRole="teacher"
                          onPosted={(comment) => {
                            // Keep the tab's count in step with the thread, then reload in the background.
                            setTask((t) =>
                              t
                                ? {
                                    ...t,
                                    studentTasks: t.studentTasks.map((st) =>
                                      st.id === active.id ? { ...st, comments: [...(st.comments ?? []), comment] } : st
                                    ),
                                  }
                                : t
                            );
                            void load();
                          }}
                        />
                      </TabsContent>
                      <TabsContent value="activity" className="pt-3">
                        {fullyLoaded ? (
                          <ActivityLog activities={active.activities ?? []} />
                        ) : (
                          <p className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading history…
                          </p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              {task ? `${formatTaskKey(task.id)} “${task.title}”` : "This task"} and all {task?.studentTasks.length ?? 0} students&apos; submissions, comments and history will be deleted.
              This can&apos;t be undone. To keep the history, cancel the task instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep task</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); void deleteTask(); }} className="bg-rose-600 hover:bg-rose-700">
              {busy === "delete" ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

