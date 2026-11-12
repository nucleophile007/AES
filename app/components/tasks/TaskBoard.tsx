"use client";

import React, { useState } from "react";
import { TASK_STATUSES, type TaskStatus } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import type { StatusCounts, TaskItem } from "./types";

export const BOARD_COLUMNS: { status: TaskStatus; dot: string }[] = [
  { status: "TODO", dot: "bg-slate-500" },
  { status: "IN_PROGRESS", dot: "bg-blue-500" },
  { status: "SUBMITTED", dot: "bg-amber-500" },
  { status: "CHANGES_REQUESTED", dot: "bg-rose-500" },
  { status: "COMPLETED", dot: "bg-emerald-500" },
];

interface TaskBoardProps {
  items: TaskItem[];
  /** Counts for the active filters (from the API), so headers match the cards. */
  counts?: StatusCounts;
  perspective: "mentor" | "student";
  onOpen: (item: TaskItem) => void;
  /** Whether a card may be dropped into a column. Omit to disable drag-and-drop. */
  canMove?: (item: TaskItem, to: TaskStatus) => boolean;
  onMove?: (item: TaskItem, to: TaskStatus) => void;
  selectable?: boolean;
  selectedIds?: Set<number>;
  onSelectChange?: (item: TaskItem, selected: boolean) => void;
  columnLabels?: Partial<Record<TaskStatus, string>>;
}

/**
 * Kanban board. Drag-and-drop uses the native HTML5 API; columns the dragged
 * card can't move to are dimmed. On touch devices, cards open the detail view
 * where the same actions are available as buttons.
 */
export function TaskBoard({
  items,
  counts,
  perspective,
  onOpen,
  canMove,
  onMove,
  selectable,
  selectedIds,
  onSelectChange,
  columnLabels,
}: TaskBoardProps) {
  const [dragging, setDragging] = useState<TaskItem | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const dndEnabled = Boolean(canMove && onMove);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
      {BOARD_COLUMNS.map((col) => {
        const columnItems = items.filter((i) => i.status === col.status);
        const allowed = dragging ? dragging.status !== col.status && Boolean(canMove?.(dragging, col.status)) : false;
        const label = columnLabels?.[col.status] ?? TASK_STATUSES[col.status].label;
        const count = counts?.[col.status] ?? columnItems.length;

        return (
          <div
            key={col.status}
            onDragOver={(e) => {
              if (!allowed) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overColumn !== col.status) setOverColumn(col.status);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverColumn(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging && allowed) onMove?.(dragging, col.status);
              setDragging(null);
              setOverColumn(null);
            }}
            className={cn(
              "bg-slate-100/80 rounded-xl p-3 flex flex-col md:min-h-[420px] transition-all",
              dragging && !allowed && dragging.status !== col.status && "opacity-50",
              overColumn === col.status && "ring-2 ring-indigo-400 bg-indigo-50/60"
            )}
            aria-label={`${label} column`}
          >
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", col.dot)} />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{label}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white text-slate-700 shadow-sm border border-slate-200">
                {count}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {columnItems.length === 0 ? (
                <div
                  className={cn(
                    "h-12 md:h-24 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs text-slate-400",
                    allowed && "border-indigo-400 text-indigo-500"
                  )}
                >
                  {allowed ? "Drop here" : "No tasks"}
                </div>
              ) : (
                columnItems.map((item) => (
                  <TaskCard
                    key={item.id}
                    item={item}
                    perspective={perspective}
                    onOpen={onOpen}
                    draggable={dndEnabled && !item.task.isCancelled && BOARD_COLUMNS.some((c) => c.status !== item.status && Boolean(canMove?.(item, c.status)))}
                    onDragStart={(it, e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(it.id));
                      setDragging(it);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setOverColumn(null);
                    }}
                    selectable={selectable}
                    selected={selectedIds?.has(item.id)}
                    onSelectChange={onSelectChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
