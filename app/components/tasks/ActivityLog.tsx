"use client";

import React from "react";
import { History } from "lucide-react";
import type { TaskActivityRecord } from "./types";

const ACTION_LABELS: Record<string, string> = {
  CREATED: "Assigned",
  STATUS_CHANGED: "Status changed",
  SUBMITTED: "Submitted",
  COMPLETED: "Completed",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
  REOPENED: "Reopened",
  CANCELLED: "Cancelled",
  COMMENT_ADDED: "Comment",
  DEADLINE_CHANGED: "Deadline changed",
};

export function ActivityLog({ activities }: { activities: TaskActivityRecord[] }) {
  if (!activities.length) {
    return <p className="py-6 text-center text-xs text-slate-400">No activity yet.</p>;
  }
  return (
    <ol className="relative border-l border-slate-200 ml-2 space-y-3 max-h-80 overflow-y-auto pr-1">
      {activities.map((a) => (
        <li key={a.id} className="ml-4">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-300" />
          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <History className="h-3 w-3" /> {ACTION_LABELS[a.action] ?? a.action}
            </span>
            <span>
              {a.performedByName} ({a.performedByRole === "teacher" ? "mentor" : a.performedByRole})
            </span>
            <time dateTime={a.createdAt}>{new Date(a.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time>
          </div>
          {a.details && <p className="text-xs text-slate-700 mt-0.5 break-words">{a.details}</p>}
        </li>
      ))}
    </ol>
  );
}
