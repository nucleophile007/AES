"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TASK_PRIORITIES, TASK_STATUSES, formatTaskKey, getChecklistProgress, getDeadlineLabel, isTaskOverdue } from "@/lib/tasks";
import { AlertCircle, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskItem } from "./types";

interface TaskListTableProps {
  items: TaskItem[];
  perspective: "mentor" | "student";
  onOpen: (item: TaskItem) => void;
  selectable?: boolean;
  selectedIds?: Set<number>;
  onSelectChange?: (item: TaskItem, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export function TaskListTable({ items, perspective, onOpen, selectable, selectedIds, onSelectChange, onSelectAll }: TaskListTableProps) {
  const allSelected = selectable && items.length > 0 && items.every((i) => selectedIds?.has(i.id));
  return (
    <Card className="overflow-hidden border shadow-sm max-w-full [contain:inline-size]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b">
            <tr>
              {selectable && (
                <th className="py-3 pl-4 w-8">
                  <Checkbox checked={allSelected} onCheckedChange={(v) => onSelectAll?.(v === true)} aria-label="Select all" />
                </th>
              )}
              <th className="py-3 px-4">Key</th>
              <th className="py-3 px-4">Task</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">{perspective === "mentor" ? "Student" : "Mentor"}</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Checklist</th>
              <th className="py-3 px-4">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const { task } = item;
              const statusMeta = TASK_STATUSES[item.status] || TASK_STATUSES.TODO;
              const priorityMeta = TASK_PRIORITIES[task.priority] || TASK_PRIORITIES.MEDIUM;
              const overdue = isTaskOverdue(task.deadline, item.status);
              const progress = getChecklistProgress(task.checklist, item.checklistDone);
              return (
                <tr
                  key={item.id}
                  onClick={() => onOpen(item)}
                  className={cn("hover:bg-slate-50/80 cursor-pointer transition-colors", selectedIds?.has(item.id) && "bg-indigo-50/50", task.isCancelled && "opacity-60")}
                >
                  {selectable && (
                    <td className="py-3 pl-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selectedIds?.has(item.id)} onCheckedChange={(v) => onSelectChange?.(item, v === true)} aria-label={`Select ${formatTaskKey(task.id)}`} />
                    </td>
                  )}
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {formatTaskKey(task.id)}
                    {task.recurrence && <Repeat className="inline h-3 w-3 ml-1 text-indigo-500" aria-label="Recurring" />}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium whitespace-nowrap">{task.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium border inline-flex items-center gap-1", priorityMeta.color)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", priorityMeta.dotColor)} />
                      {priorityMeta.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                    {perspective === "mentor" ? item.student?.name : task.creator?.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap", statusMeta.color)}>
                      {task.isCancelled ? "Cancelled" : statusMeta.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs whitespace-nowrap">{progress.total ? `${progress.done}/${progress.total}` : "—"}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {task.deadline ? (
                      <span className={cn("text-xs font-medium inline-flex items-center gap-1", overdue ? "text-rose-600 font-bold" : "text-slate-600")}>
                        {overdue && <AlertCircle className="h-3 w-3" />}
                        {getDeadlineLabel(task.deadline).text}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
