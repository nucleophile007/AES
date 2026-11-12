"use client";

import React, { useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { formatTaskKey, isTaskOverdue } from "@/lib/tasks";
import type { TaskItem } from "./types";

const localizer = momentLocalizer(moment);

type View = "month" | "week" | "agenda";

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  item: TaskItem;
}

const STATUS_COLORS: Record<string, string> = {
  TODO: "#64748b",
  IN_PROGRESS: "#3b82f6",
  SUBMITTED: "#f59e0b",
  CHANGES_REQUESTED: "#f43f5e",
  COMPLETED: "#10b981",
};

interface TaskCalendarProps {
  items: TaskItem[];
  perspective: "mentor" | "student";
  onOpen: (item: TaskItem) => void;
}

/** Deadlines on a month/week/agenda calendar, coloured by status. */
export function TaskCalendar({ items, perspective, onOpen }: TaskCalendarProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const events = useMemo<CalendarEvent[]>(
    () =>
      items
        .filter((i) => i.task.deadline)
        .map((i) => {
          const d = new Date(i.task.deadline as string);
          const who = perspective === "mentor" ? i.student?.name : null;
          return {
            id: i.id,
            title: `${formatTaskKey(i.task.id)} ${i.task.title}${who ? ` · ${who}` : ""}`,
            start: d,
            end: new Date(d.getTime() + 30 * 60 * 1000),
            allDay: false,
            item: i,
          };
        }),
    [items, perspective]
  );
  const undated = items.length - events.length;

  return (
    <div className="bg-white border rounded-xl p-3 shadow-sm">
      <div style={{ height: 640 }}>
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          onView={(v: string) => setView(v as View)}
          date={date}
          onNavigate={setDate}
          views={["month", "week", "agenda"]}
          popup
          onSelectEvent={(e: CalendarEvent) => onOpen(e.item)}
          eventPropGetter={(e: CalendarEvent) => {
            const overdue = isTaskOverdue(e.item.task.deadline, e.item.status);
            return {
              style: {
                backgroundColor: STATUS_COLORS[e.item.status] ?? "#64748b",
                border: overdue ? "2px solid #be123c" : "none",
                fontSize: 11,
                borderRadius: 4,
                opacity: e.item.task.isCancelled ? 0.5 : 1,
              },
            };
          }}
        />
      </div>
      {undated > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          {undated} item{undated === 1 ? "" : "s"} without a deadline {undated === 1 ? "isn't" : "aren't"} shown on the
          calendar.
        </p>
      )}
    </div>
  );
}
