"use client";

import React from "react";
import { BookOpen, CalendarClock, FileText } from "lucide-react";
import type { TaskLinkInfo } from "./types";

/** Chips for the assignment / resource / meeting a task is linked to. */
export function LinkedItems({ links, dashboard }: { links: TaskLinkInfo; dashboard: "teacher-dashboard" | "student-dashboard" }) {
  const { linkedAssignment, linkedResource, linkedMeeting } = links;
  if (!linkedAssignment && !linkedResource && !linkedMeeting) return null;
  const chip = "inline-flex items-center gap-1.5 rounded-md border bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50";
  return (
    <div className="flex flex-wrap gap-1.5">
      {linkedAssignment && (
        <a href={`/${dashboard}?tab=assignments`} className={chip}>
          <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Assignment: {linkedAssignment.title}
        </a>
      )}
      {linkedResource && (
        <a href={`/${dashboard}?tab=resources`} className={chip}>
          <FileText className="h-3.5 w-3.5 text-emerald-600" /> Resource: {linkedResource.title}
        </a>
      )}
      {linkedMeeting && (
        <a href={`/${dashboard}?tab=meeting-minutes`} className={chip}>
          <CalendarClock className="h-3.5 w-3.5 text-amber-600" /> Meeting: {linkedMeeting.title}
          {linkedMeeting.startDateTime && (
            <span className="text-slate-400">({new Date(linkedMeeting.startDateTime).toLocaleDateString()})</span>
          )}
        </a>
      )}
    </div>
  );
}
