"use client";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';

const localizer = momentLocalizer(moment);

export type DashboardCalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  state: 'available' | 'pending' | 'approved' | 'declined' | 'cancelled';
  details: string;
};

type DashboardCalendarView = 'month' | 'week' | 'day' | 'agenda';

export function toWallClockDate(instant: string | Date, timezone: string): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute)
  );
}

export function DashboardCalendar({
  events,
  onSelectEvent,
  selectable = false,
  onSelectSlot,
}: {
  events: DashboardCalendarEvent[];
  onSelectEvent: (event: DashboardCalendarEvent) => void;
  selectable?: boolean;
  onSelectSlot?: (selection: { start: Date; end: Date }) => void;
}) {
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState<DashboardCalendarView>('week');

  return (
    <div className="min-w-0 rounded-lg border bg-white p-2 sm:p-4">
      <Calendar
        localizer={localizer}
        events={events.filter((event) => event.state !== 'cancelled')}
        date={calendarDate}
        onNavigate={(date: Date) => setCalendarDate(date)}
        view={calendarView}
        onView={(view: DashboardCalendarView) => setCalendarView(view)}
        onDrillDown={(date: Date) => {
          setCalendarDate(date);
          setCalendarView('day');
        }}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        views={['month', 'week', 'day', 'agenda']}
        toolbar
        popup
        selectable={selectable}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        eventPropGetter={(event: DashboardCalendarEvent) => {
          const colors: Record<DashboardCalendarEvent['state'], { backgroundColor: string; color: string; borderColor: string }> = {
            available: { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#60a5fa' },
            pending: { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#f59e0b' },
            approved: { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#4ade80' },
            declined: { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#f87171' },
            cancelled: { backgroundColor: '#e2e8f0', color: '#334155', borderColor: '#94a3b8' },
          };
          return {
            style: {
              ...colors[event.state],
              borderLeft: `4px solid ${colors[event.state].borderColor}`,
              borderRadius: '4px',
              whiteSpace: 'normal',
            },
          };
        }}
        style={{ height: 680 }}
      />
    </div>
  );
}
