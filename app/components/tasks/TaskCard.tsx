"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TASK_PRIORITIES,
  formatTaskKey,
  getChecklistProgress,
  getDeadlineLabel,
  isTaskOverdue,
} from "@/lib/tasks";
import {
  AlertCircle,
  ListChecks,
  Link as LinkIcon,
  MessageSquare,
  Paperclip,
  Repeat,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskItem } from "./types";

interface TaskCardProps {
  item: TaskItem;
  /** "mentor" shows the student; "student" shows the mentor. */
  perspective: "mentor" | "student";
  onOpen: (item: TaskItem) => void;
  draggable?: boolean;
  onDragStart?: (item: TaskItem, e: React.DragEvent) => void;
  onDragEnd?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (item: TaskItem, selected: boolean) => void;
}

export function TaskCard({
  item,
  perspective,
  onOpen,
  draggable,
  onDragStart,
  onDragEnd,
  selectable,
  selected,
  onSelectChange,
}: TaskCardProps) {
  const { task } = item;
  const overdue = isTaskOverdue(task.deadline, item.status);
  const priority = TASK_PRIORITIES[task.priority] || TASK_PRIORITIES.MEDIUM;
  const deadlineInfo = getDeadlineLabel(task.deadline);
  const progress = getChecklistProgress(task.checklist, item.checklistDone);
  const commentCount = item._count?.comments ?? item.comments?.length ?? 0;
  const person = perspective === "mentor" ? item.student?.name : task.creator?.name;

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(item, e)}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      className={cn(
        "bg-white rounded-lg p-3 shadow-sm border transition-all cursor-pointer hover:shadow-md hover:border-slate-300 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        draggable && "active:cursor-grabbing",
        overdue && "border-rose-300 bg-rose-50/30",
        item.status === "SUBMITTED" && perspective === "mentor" && "border-amber-300 bg-amber-50/30",
        item.status === "CHANGES_REQUESTED" && perspective === "student" && "border-rose-300",
        selected && "ring-2 ring-indigo-500 border-indigo-300"
      )}
    >
      <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5">
        <div className="flex items-center gap-1.5">
          {selectable && (
            <span onClick={(e) => e.stopPropagation()} className="flex items-center">
              <Checkbox
                checked={selected}
                onCheckedChange={(v) => onSelectChange?.(item, v === true)}
                aria-label={`Select ${formatTaskKey(task.id)} for ${item.student?.name ?? "student"}`}
                className="h-3.5 w-3.5"
              />
            </span>
          )}
          <span className="font-mono font-semibold text-slate-500">{formatTaskKey(task.id)}</span>
          {task.recurrence && (
            <span title="Recurring task" className="text-indigo-500">
              <Repeat className="h-3 w-3" />
            </span>
          )}
        </div>
        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1", priority.color)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", priority.dotColor)} />
          {priority.label}
        </span>
      </div>

      <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{task.title}</h4>

      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-slate-400">
        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
          {task.category}
        </span>
        {task.requireFileUpload && <Paperclip className="h-3 w-3" aria-label="File upload required" />}
        {task.requireUrl && <LinkIcon className="h-3 w-3" aria-label="URL required" />}
        {task.requireMentorApproval && (
          <ShieldAlert className="h-3 w-3 text-amber-500" aria-label="Mentor approval required" />
        )}
      </div>

      {progress.total > 0 && (
        <div className="mt-2" title={`${progress.done} of ${progress.total} checklist steps done`}>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
            <span className="flex items-center gap-1">
              <ListChecks className="h-3 w-3" /> Checklist
            </span>
            <span className="font-medium">
              {progress.done}/{progress.total}
            </span>
          </div>
          <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn("h-full rounded-full", progress.done === progress.total ? "bg-emerald-500" : "bg-indigo-500")}
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          {person && (
            <>
              <Avatar className="h-5 w-5 text-[10px]">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                  {person.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] font-medium text-slate-700 truncate max-w-[90px]">{person}</span>
            </>
          )}
          {commentCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400" title={`${commentCount} comments`}>
              <MessageSquare className="h-3 w-3" />
              {commentCount}
            </span>
          )}
        </div>
        {task.deadline && (
          <span
            className={cn(
              "text-[10px] font-medium flex items-center gap-1 shrink-0",
              overdue ? "text-rose-600 font-bold" : deadlineInfo.isToday ? "text-blue-600" : "text-slate-500"
            )}
          >
            {overdue && <AlertCircle className="h-3 w-3" />}
            {deadlineInfo.text}
          </span>
        )}
      </div>

      {task.isCancelled && (
        <div className="mt-2 text-center py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-semibold">Cancelled</div>
      )}
      {perspective === "mentor" && item.status === "SUBMITTED" && !task.isCancelled && (
        <div className="mt-2 text-center py-1 bg-amber-500/10 text-amber-800 rounded text-[10px] font-semibold flex items-center justify-center gap-1">
          <ShieldAlert className="h-3 w-3 text-amber-600" />
          Ready for your review
          {progress.total > 0 && progress.done < progress.total && (
            <span className="text-rose-700">
              · {progress.done}/{progress.total} steps
            </span>
          )}
        </div>
      )}
      {perspective === "student" && item.status === "CHANGES_REQUESTED" && (
        <div className="mt-2 text-center py-1 bg-rose-500/10 text-rose-700 rounded text-[10px] font-semibold">
          Mentor requested changes
        </div>
      )}
    </div>
  );
}
