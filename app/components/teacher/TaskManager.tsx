"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_TASK_CATEGORIES, canMentorPerform, type MentorReviewAction, type TaskStatus } from "@/lib/tasks";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock,
  Kanban,
  LayoutTemplate,
  ListTodo,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { taskApi } from "@/components/tasks/api";
import { useTaskFilters, useTaskRealtime } from "@/components/tasks/hooks";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskListTable } from "@/components/tasks/TaskListTable";
import { TaskCalendar } from "@/components/tasks/TaskCalendar";
import { TaskFilterBar } from "@/components/tasks/TaskFilterBar";
import type { StatusCounts, TaskItem, TaskRecordBase } from "@/components/tasks/types";
import {
  TaskFormDialog,
  type MentorGroup,
  type MentorStudent,
  type TaskFormMode,
  type TaskTemplateRecord,
} from "./tasks/TaskFormDialog";
import { TaskDetailDialog, type DetailTask } from "./tasks/TaskDetailDialog";
import { BulkActionBar } from "./tasks/BulkActionBar";
import { TaskInsights } from "./tasks/TaskInsights";
import { TemplatesDialog } from "./tasks/TemplatesDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface TaskMetrics {
  totalTasks: number;
  totalAssignments: number;
  todo: number;
  inProgress: number;
  pendingReview: number;
  changesRequested: number;
  completed: number;
  overdue: number;
}

interface ListResponse {
  items: TaskItem[];
  truncated: boolean;
  columnCounts: StatusCounts;
  metrics: TaskMetrics;
  teacherId: number;
  // Only present when requested with ?lookups=1
  categories?: string[];
  students?: MentorStudent[];
  groups?: MentorGroup[];
}

interface Lookups {
  categories: string[];
  students: MentorStudent[];
  groups: MentorGroup[];
}

/** Response of POST /api/teacher/tasks, used to show the new cards straight away. */
export interface CreatedTaskResult {
  task: TaskRecordBase;
  items: Omit<TaskItem, "task">[];
}

const EMPTY_METRICS: TaskMetrics = {
  totalTasks: 0,
  totalAssignments: 0,
  todo: 0,
  inProgress: 0,
  pendingReview: 0,
  changesRequested: 0,
  completed: 0,
  overdue: 0,
};

/** Mentor board drag rules: each allowed drop maps to a review action. */
function reviewActionFor(from: TaskStatus, to: TaskStatus): MentorReviewAction | null {
  if (to === "COMPLETED" && canMentorPerform("APPROVE", from)) return "APPROVE";
  if (to === "CHANGES_REQUESTED" && canMentorPerform("REQUEST_CHANGES", from)) return "REQUEST_CHANGES";
  if (to === "IN_PROGRESS" && canMentorPerform("REOPEN", from)) return "REOPEN";
  return null;
}

const VIEWS = [
  { key: "board", label: "Board", icon: Kanban },
  { key: "list", label: "List", icon: ListTodo },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "insights", label: "Insights", icon: BarChart3 },
] as const;

interface TaskManagerProps {
  teacherEmail?: string;
  teacherName?: string;
}

function TaskManagerInner(_props: TaskManagerProps) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const f = useTaskFilters("board");

  const [data, setData] = useState<ListResponse | null>(null);
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TaskTemplateRecord[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<TaskFormMode>({ kind: "create" });
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [detail, setDetail] = useState<{ taskId: number; studentTaskId: number | null } | null>(null);
  const [detailRefresh, setDetailRefresh] = useState(0);
  const [dragFeedback, setDragFeedback] = useState<{ item: TaskItem; text: string } | null>(null);

  const requestSeq = useRef(0);
  const needLookups = useRef(true);
  const load = useCallback(async (opts: { refreshLookups?: boolean } = {}) => {
    const seq = ++requestSeq.current;
    if (opts.refreshLookups) needLookups.current = true;
    const withLookups = needLookups.current;
    setError(null);
    try {
      const params = new URLSearchParams(f.apiQuery);
      if (withLookups) params.set("lookups", "1");
      const qs = params.toString();
      const res = await taskApi<ListResponse>(`/api/teacher/tasks${qs ? `?${qs}` : ""}`);
      if (seq !== requestSeq.current) return; // a newer request superseded this one
      setData(res);
      if (withLookups && res.students) {
        needLookups.current = false;
        setLookups({ categories: res.categories ?? [], students: res.students, groups: res.groups ?? [] });
      }
      // Drop selections that are no longer visible.
      setSelected((prev) => {
        const visible = new Set(res.items.map((i) => i.id));
        const next = new Set([...prev].filter((id) => visible.has(id)));
        return next.size === prev.size ? prev : next;
      });
    } catch (err) {
      if (seq === requestSeq.current) setError((err as Error).message);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [f.apiQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadTemplates = useCallback(async () => {
    try {
      setTemplates((await taskApi<{ templates: TaskTemplateRecord[] }>("/api/teacher/tasks/templates")).templates);
    } catch {
      // Templates are optional.
    }
  }, []);
  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  useTaskRealtime("teacher", data?.teacherId, () => {
    void load();
    setDetailRefresh((n) => n + 1);
  });

  // Deep link: ?open=<studentTaskId> (from notification emails).
  const openParam = searchParams?.get("open");
  useEffect(() => {
    if (!openParam) return;
    const id = Number(openParam);
    if (!Number.isInteger(id)) return;
    taskApi<{ taskId: number; studentTaskId: number }>(`/api/teacher/tasks/items/${id}`)
      .then((r) => setDetail({ taskId: r.taskId, studentTaskId: r.studentTaskId }))
      .catch(() => toast({ title: "That task item is no longer available", variant: "destructive" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openParam]);

  const closeDetail = () => {
    setDetail(null);
    if (openParam) {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.delete("open");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const metrics = data?.metrics ?? EMPTY_METRICS;
  const metricsLoading = !data;
  const items = useMemo(() => data?.items ?? [], [data]);
  const categories = useMemo(
    () => Array.from(new Set([...DEFAULT_TASK_CATEGORIES, ...(lookups?.categories ?? [])])),
    [lookups?.categories]
  );

  // Everything the board already knows about the opened task, so the detail
  // window can render instantly (comments and history arrive with the full load).
  const detailPreview = useMemo<DetailTask | null>(() => {
    if (!detail) return null;
    const rows = items.filter((i) => i.taskId === detail.taskId);
    if (!rows.length) return null;
    return { ...rows[0].task, studentTasks: rows.map(({ task: _task, ...rest }) => rest) };
    // Only recompute when a different task is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.taskId]);

  /** Show freshly created cards immediately; the reload that follows reconciles filters/counts. */
  const addCreated = (created: CreatedTaskResult) => {
    const newItems: TaskItem[] = created.items.map((i) => ({ ...i, task: created.task }));
    setData((d) =>
      d
        ? {
            ...d,
            items: [...newItems, ...d.items.filter((i) => !newItems.some((n) => n.id === i.id))],
            columnCounts: { ...d.columnCounts, TODO: d.columnCounts.TODO + newItems.length },
            metrics: {
              ...d.metrics,
              totalTasks: d.metrics.totalTasks + 1,
              totalAssignments: d.metrics.totalAssignments + newItems.length,
              todo: d.metrics.todo + newItems.length,
            },
          }
        : d
    );
  };

  const openCreate = (mode: TaskFormMode = { kind: "create" }) => {
    setFormMode(mode);
    setFormOpen(true);
  };

  const toggleSelected = (item: TaskItem, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(item.id);
      else next.delete(item.id);
      return next;
    });

  const runReview = async (item: TaskItem, action: MentorReviewAction, feedback?: string) => {
    // Optimistic move; reverted by the reload on failure.
    const target: TaskStatus = action === "APPROVE" ? "COMPLETED" : action === "REQUEST_CHANGES" ? "CHANGES_REQUESTED" : "IN_PROGRESS";
    setData((d) => (d ? { ...d, items: d.items.map((i) => (i.id === item.id ? { ...i, status: target } : i)) } : d));
    try {
      await taskApi("/api/teacher/tasks/review", { method: "POST", json: { studentTaskId: item.id, action, feedback } });
      toast({ title: action === "APPROVE" ? "Approved" : action === "REQUEST_CHANGES" ? "Changes requested" : "Reopened" });
    } catch (err) {
      toast({ title: "Couldn't move task", description: (err as Error).message, variant: "destructive" });
    } finally {
      void load();
    }
  };

  const onMove = (item: TaskItem, to: TaskStatus) => {
    const action = reviewActionFor(item.status, to);
    if (!action) return;
    if (action === "REQUEST_CHANGES") setDragFeedback({ item, text: "" });
    else void runReview(item, action);
  };

  const metricCard = (opts: {
    label: string;
    value: number;
    sub?: string;
    icon: React.ElementType;
    tone: string;
    active: boolean;
    onClick: () => void;
    pulse?: boolean;
  }) => (
    <Card
      role="button"
      tabIndex={0}
      onClick={opts.onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && opts.onClick()}
      className={cn("cursor-pointer transition-all hover:shadow-md border-l-4", opts.tone, opts.active && "ring-2 ring-indigo-500/20 bg-slate-50")}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            {opts.label}
            {opts.pulse && <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
          </span>
          <opts.icon className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          {metricsLoading ? (
            <span className="h-7 w-10 rounded bg-slate-200 animate-pulse" aria-label="Loading" />
          ) : (
            <>
              <span className="text-2xl font-bold text-slate-900">{opts.value}</span>
              {opts.sub && <span className="text-xs text-slate-500">{opts.sub}</span>}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const view = f.view;
  const status = f.filters.status ?? "ALL";
  const deadline = f.filters.deadlineFilter ?? "ALL";

  return (
    <div className="space-y-5">
      {/* The dashboard page already shows the "Task Management" title and description. */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-2 border-b">
        <p className="text-sm text-slate-500">Drag cards to approve, request changes or reopen.</p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border bg-white p-1 shadow-sm" role="tablist" aria-label="Task views">
            {VIEWS.map((v) => (
              <Button
                key={v.key}
                role="tab"
                aria-selected={view === v.key}
                variant={view === v.key ? "default" : "ghost"}
                size="sm"
                onClick={() => f.setFilter("view", v.key)}
                className={cn("h-8 gap-1.5 px-3 text-xs", view === v.key && "bg-slate-900 text-white")}
              >
                <v.icon className="h-3.5 w-3.5" />
                <span>{v.label}</span>
              </Button>
            ))}
          </div>
          <Button onClick={() => void load({ refreshLookups: true })} variant="outline" size="sm" className="h-9 w-9 p-0" title="Refresh" aria-label="Refresh tasks">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setTemplatesOpen(true)} variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <LayoutTemplate className="h-4 w-4" /> Templates{templates.length ? ` (${templates.length})` : ""}
          </Button>
          <Button onClick={() => openCreate()} size="sm" className="h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium">
            <Plus className="h-4 w-4" /> Create Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metricCard({
          label: "All tasks",
          value: metrics.totalTasks,
          sub: `(${metrics.totalAssignments} student items)`,
          icon: CheckSquare,
          tone: "border-l-slate-800",
          active: status === "ALL" && deadline === "ALL",
          onClick: () => f.setFilters({ status: "ALL", deadlineFilter: "ALL" }),
        })}
        {metricCard({
          label: "In progress",
          value: metrics.inProgress,
          icon: Clock,
          tone: "border-l-blue-500",
          active: status === "IN_PROGRESS",
          onClick: () => f.setFilters({ status: "IN_PROGRESS", deadlineFilter: "ALL" }),
        })}
        {metricCard({
          label: "Pending review",
          value: metrics.pendingReview,
          icon: ShieldAlert,
          tone: "border-l-amber-500",
          active: status === "SUBMITTED",
          pulse: metrics.pendingReview > 0,
          onClick: () => f.setFilters({ status: "SUBMITTED", deadlineFilter: "ALL" }),
        })}
        {metricCard({
          label: "Overdue",
          value: metrics.overdue,
          icon: AlertCircle,
          tone: "border-l-rose-500",
          active: deadline === "overdue",
          onClick: () => f.setFilters({ status: "ALL", deadlineFilter: "overdue" }),
        })}
        {metricCard({
          label: "Completed",
          value: metrics.completed,
          icon: CheckCircle2,
          tone: "border-l-emerald-500",
          active: status === "COMPLETED",
          onClick: () => f.setFilters({ status: "COMPLETED", deadlineFilter: "ALL" }),
        })}
      </div>

      {view !== "insights" && (
        <TaskFilterBar
          f={f}
          categories={categories}
          students={lookups?.students ?? []}
          overdueCount={metrics.overdue}
          reviewCount={metrics.pendingReview}
          perspective="mentor"
        />
      )}

      {view !== "insights" && view !== "calendar" && (
        <BulkActionBar selectedIds={[...selected]} onClear={() => setSelected(new Set())} onDone={() => void load()} />
      )}

      {error ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-rose-600">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void load()}>
            Try again
          </Button>
        </Card>
      ) : view === "insights" ? (
        <TaskInsights
          exportQuery={f.apiQuery}
          onOpenItem={(taskId, studentTaskId) => setDetail({ taskId, studentTaskId })}
          onFilterStudent={(id) => f.setFilters({ studentId: String(id), view: "list" })}
        />
      ) : loading && !data ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
          <p className="mt-3 text-sm text-slate-500">Loading tasks…</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
            <CheckSquare className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{f.hasActiveFilters ? "No tasks match these filters" : "No tasks yet"}</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
            {f.hasActiveFilters
              ? "Try clearing a filter or searching for something else."
              : "Tasks help you track college prep, outreach, registrations and milestones for each student."}
          </p>
          {f.hasActiveFilters ? (
            <Button variant="outline" onClick={f.resetFilters}>
              Clear filters
            </Button>
          ) : (
            <Button onClick={() => openCreate()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-1.5" /> Create first task
            </Button>
          )}
        </Card>
      ) : (
        <>
          {data?.truncated && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              Showing the first 500 items. Narrow the filters to see the rest.
            </p>
          )}
          {view === "list" ? (
            <TaskListTable
              items={items}
              perspective="mentor"
              onOpen={(i) => setDetail({ taskId: i.taskId, studentTaskId: i.id })}
              selectable
              selectedIds={selected}
              onSelectChange={toggleSelected}
              onSelectAll={(on) => setSelected(on ? new Set(items.map((i) => i.id)) : new Set())}
            />
          ) : view === "calendar" ? (
            <TaskCalendar items={items} perspective="mentor" onOpen={(i) => setDetail({ taskId: i.taskId, studentTaskId: i.id })} />
          ) : (
            <TaskBoard
              items={items}
              counts={data?.columnCounts}
              perspective="mentor"
              onOpen={(i) => setDetail({ taskId: i.taskId, studentTaskId: i.id })}
              canMove={(item, to) => !item.task.isCancelled && reviewActionFor(item.status, to) !== null}
              onMove={onMove}
              selectable
              selectedIds={selected}
              onSelectChange={toggleSelected}
              columnLabels={{ SUBMITTED: "Needs review" }}
            />
          )}
        </>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        students={lookups?.students ?? []}
        groups={lookups?.groups ?? []}
        categories={lookups?.categories ?? []}
        templates={templates}
        onSaved={(created) => {
          if (created) addCreated(created);
          void load({ refreshLookups: true });
          void loadTemplates();
          setDetailRefresh((n) => n + 1);
        }}
      />

      <TaskDetailDialog
        open={detail !== null}
        onOpenChange={(o) => !o && closeDetail()}
        taskId={detail?.taskId ?? null}
        studentTaskId={detail?.studentTaskId ?? null}
        initialTask={detailPreview}
        refreshKey={detailRefresh}
        onChanged={() => void load()}
        onEdit={(task: TaskRecordBase, assignedStudentIds: number[]) => openCreate({ kind: "edit", task, assignedStudentIds })}
        onDuplicate={(task: TaskRecordBase) => openCreate({ kind: "create", duplicateOf: task })}
      />

      <TemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        templates={templates}
        onChanged={() => void loadTemplates()}
        onUse={(template) => {
          setTemplatesOpen(false);
          openCreate({ kind: "create", template });
        }}
      />

      <Dialog open={dragFeedback !== null} onOpenChange={(o) => !o && setDragFeedback(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request changes</DialogTitle>
            <DialogDescription>
              {dragFeedback ? `Tell ${dragFeedback.item.student?.name ?? "the student"} what to change on “${dragFeedback.item.task.title}”.` : ""}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            autoFocus
            rows={4}
            value={dragFeedback?.text ?? ""}
            onChange={(e) => setDragFeedback((d) => (d ? { ...d, text: e.target.value } : d))}
            placeholder="What needs to change?"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDragFeedback(null)}>
              Cancel
            </Button>
            <Button
              disabled={!dragFeedback?.text.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (!dragFeedback) return;
                void runReview(dragFeedback.item, "REQUEST_CHANGES", dragFeedback.text.trim());
                setDragFeedback(null);
              }}
            >
              Send feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TaskManager(props: TaskManagerProps) {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
        </div>
      }
    >
      <TaskManagerInner {...props} />
    </Suspense>
  );
}
