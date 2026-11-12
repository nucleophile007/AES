"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShimmerSkeleton } from "@/components/ui/dashboard-loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTaskFilters, useTaskRealtime } from "@/components/tasks/hooks";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskListTable } from "@/components/tasks/TaskListTable";
import { TaskCalendar } from "@/components/tasks/TaskCalendar";
import { TaskFilterBar } from "@/components/tasks/TaskFilterBar";
import type { TaskItem } from "@/components/tasks/types";
import { getMissingRequirements, type TaskStatus } from "@/lib/tasks";
import { AlertCircle, CalendarDays, Inbox, Info, Kanban, ListTodo, RefreshCw, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentTaskMetricCards } from "./StudentTaskMetricCards";
import { StudentTaskDetailDialog } from "./StudentTaskDetailDialog";
import {
  EMPTY_METRICS,
  fetchStudentTasks,
  patchStudentTask,
  resolveBoardDrop,
  type StudentTaskListResponse,
} from "./studentTaskApi";

const VIEWS = [
  { value: "board", label: "Board", icon: Kanban },
  { value: "list", label: "List", icon: ListTodo },
  { value: "calendar", label: "Calendar", icon: CalendarDays },
] as const;

const MOVE_MESSAGES: Record<"START" | "SUBMIT" | "COMPLETE_DIRECT", { title: string; description: string }> = {
  START: { title: "Task started", description: "Moved to In Progress." },
  SUBMIT: { title: "Task submitted", description: "Sent to your mentor for review." },
  COMPLETE_DIRECT: { title: "Task completed", description: "Nice work! Marked as completed." },
};

/** Applies a status change to the cached list so the board updates before the server round trip. */
function withStatus(data: StudentTaskListResponse, item: TaskItem, to: TaskStatus): StudentTaskListResponse {
  const counts = { ...data.columnCounts };
  counts[item.status] = Math.max(0, counts[item.status] - 1);
  counts[to] = counts[to] + 1;
  return { ...data, columnCounts: counts, items: data.items.map((i) => (i.id === item.id ? { ...i, status: to } : i)) };
}

export function StudentTaskWorkspace({ studentName }: { studentName?: string }) {
  const f = useTaskFilters("board");
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<StudentTaskListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [detailReload, setDetailReload] = useState(0);
  const requestSeq = useRef(0);

  const loadList = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const res = await fetchStudentTasks(f.apiQuery);
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
    void loadList();
  }, [loadList]);

  useTaskRealtime("student", data?.studentId, () => {
    void loadList();
    setDetailReload((n) => n + 1);
  });

  // ?open=<studentTaskId> (from email links) opens that task once the list has loaded.
  const openParam = searchParams?.get("open") ?? null;
  const handledOpenParam = useRef<string | null>(null);
  useEffect(() => {
    if (!openParam || !data || handledOpenParam.current === openParam) return;
    handledOpenParam.current = openParam;
    const id = Number(openParam);
    if (Number.isInteger(id) && id > 0) setOpenId(id);
  }, [openParam, data]);

  const closeDetail = useCallback(() => {
    setOpenId(null);
    if (searchParams?.get("open")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("open");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  const openItem = useCallback((item: TaskItem) => setOpenId(item.id), []);

  const canMove = useCallback((item: TaskItem, to: TaskStatus) => resolveBoardDrop(item, to) !== null, []);

  const onMove = useCallback(
    async (item: TaskItem, to: TaskStatus) => {
      const intent = resolveBoardDrop(item, to);
      if (!intent) return;

      if (intent === "OPEN_DETAIL") {
        setOpenId(item.id);
        const missing = getMissingRequirements(item.task, {
          note: item.submissionNote,
          url: item.submissionUrl,
          fileUrl: item.submissionFileUrl,
          externalConfirmed: item.submissionExternalConfirmed,
          checklistDone: item.checklistDone,
        });
        toast({
          title: "Complete the requirements first",
          description: missing.length
            ? `This task needs ${missing.join(", ")} before it can be submitted.`
            : "Review your submission and submit it from the task details.",
        });
        return;
      }

      const optimistic: TaskStatus = intent === "START" ? "IN_PROGRESS" : intent === "SUBMIT" ? "SUBMITTED" : "COMPLETED";
      setData((d) => (d ? withStatus(d, item, optimistic) : d));
      try {
        await patchStudentTask(item.id, intent);
        toast(MOVE_MESSAGES[intent]);
      } catch (err) {
        toast({ title: "Couldn't move task", description: (err as Error).message, variant: "destructive" });
      } finally {
        void loadList();
        if (openId === item.id) setDetailReload((n) => n + 1);
      }
    },
    [toast, loadList, openId]
  );

  const metrics = data?.metrics ?? EMPTY_METRICS;
  const items = data?.items ?? [];
  const summary = openId != null ? items.find((i) => i.id === openId) ?? null : null;

  return (
    <div className="space-y-6">
      {/* Toolbar. The dashboard page already shows the "My Tasks" title and description. */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 pb-2 border-b">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-lg border bg-white p-1 shadow-sm" role="group" aria-label="Task view">
            {VIEWS.map((v) => {
              const active = f.view === v.value;
              const Icon = v.icon;
              return (
                <Button
                  key={v.value}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  aria-pressed={active}
                  onClick={() => f.setFilter("view", v.value)}
                  className={cn("h-8 gap-1.5 px-3 text-xs", active && "bg-slate-900 text-white hover:bg-slate-800")}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{v.label}</span>
                </Button>
              );
            })}
          </div>
          <Button
            onClick={() => void loadList()}
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            title="Refresh tasks"
            aria-label="Refresh tasks"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {metrics.overdue > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              You have{" "}
              <strong>
                {metrics.overdue} overdue task{metrics.overdue > 1 ? "s" : ""}
              </strong>{" "}
              that need attention.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              f.setFilters(
                f.filters.deadlineFilter === "overdue" ? { deadlineFilter: "ALL" } : { deadlineFilter: "overdue", status: "ALL" }
              )
            }
            className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-100 shrink-0"
          >
            {f.filters.deadlineFilter === "overdue" ? "Show all" : "View overdue"}
          </Button>
        </div>
      )}

      <StudentTaskMetricCards metrics={metrics} filters={f.filters} onApply={f.setFilters} loading={!data} />

      <TaskFilterBar
        f={f}
        categories={data?.categories ?? []}
        perspective="student"
        overdueCount={metrics.overdue}
        reviewCount={metrics.submitted}
      />

      {error && data && (
        <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> Couldn&apos;t refresh tasks: {error}
          </span>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => void loadList()}>
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
        error ? (
          <StateCard
            icon={<AlertCircle className="h-8 w-8 text-rose-500" />}
            title="Couldn't load your tasks"
            description={error}
            action={
              <Button size="sm" onClick={() => void loadList()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Try again
              </Button>
            }
          />
        ) : (
          <StudentTaskWorkspaceSkeleton bodyOnly />
        )
      ) : items.length === 0 ? (
        f.hasActiveFilters ? (
          <StateCard
            icon={<SearchX className="h-8 w-8 text-slate-400" />}
            title="No tasks match these filters"
            description="Try a different search, or clear the filters to see all your tasks."
            action={
              <Button size="sm" variant="outline" onClick={f.resetFilters}>
                Reset filters
              </Button>
            }
          />
        ) : (
          <StateCard
            icon={<Inbox className="h-8 w-8 text-indigo-400" />}
            title="No tasks yet"
            description="When your mentor assigns you a task, it will show up here."
          />
        )
      ) : f.view === "list" ? (
        <TaskListTable items={items} perspective="student" onOpen={openItem} />
      ) : f.view === "calendar" ? (
        <TaskCalendar items={items} perspective="student" onOpen={openItem} />
      ) : (
        <TaskBoard
          items={items}
          counts={data.columnCounts}
          perspective="student"
          onOpen={openItem}
          canMove={canMove}
          onMove={(item, to) => void onMove(item, to)}
          columnLabels={{ SUBMITTED: "Awaiting Review" }}
        />
      )}

      <StudentTaskDetailDialog
        studentTaskId={openId}
        summary={summary}
        studentName={studentName}
        reloadSignal={detailReload}
        onClose={closeDetail}
        onChanged={() => void loadList()}
      />
    </div>
  );
}

function StateCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-14 flex flex-col items-center text-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 max-w-sm">{description}</p>
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}

/** Placeholder while the task list (or the Suspense boundary) loads. */
export function StudentTaskWorkspaceSkeleton({ bodyOnly = false }: { bodyOnly?: boolean }) {
  const board = (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5" aria-busy="true" aria-label="Loading tasks">
      {Array.from({ length: 5 }).map((_, col) => (
        <div key={col} className="bg-slate-100/80 rounded-xl p-3 space-y-2.5 min-h-[320px]">
          <ShimmerSkeleton className="h-4 w-24 rounded" />
          {Array.from({ length: col % 2 === 0 ? 3 : 2 }).map((__, row) => (
            <ShimmerSkeleton key={row} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
  if (bodyOnly) return board;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-7 w-40 rounded-md" />
          <ShimmerSkeleton className="h-4 w-80 max-w-full rounded-md" />
        </div>
        <ShimmerSkeleton className="h-9 w-56 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ShimmerSkeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <ShimmerSkeleton className="h-24 w-full rounded-xl" />
      {board}
    </div>
  );
}
