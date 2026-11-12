"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DashboardCalendar, type DashboardCalendarEvent } from '@/components/calendar/DashboardCalendar';

interface ParentBooking {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELLED';
  student: { id: number; name: string };
  slot: {
    startsAt: string;
    endsAt: string;
    timezone: string;
    teacher: { id: number; name: string };
  };
}

const formatDateTime = (value: string, timezone: string) => new Intl.DateTimeFormat('en-US', {
  timeZone: timezone,
  dateStyle: 'full',
  timeStyle: 'short',
}).format(new Date(value));
const formatViewerDateTime = (value: string) => new Intl.DateTimeFormat('en-US', {
  dateStyle: 'full',
  timeStyle: 'short',
}).format(new Date(value));

export default function ParentMentorCalendar() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<ParentBooking[]>([]);
  const [children, setChildren] = useState<Array<{ id: number; name: string }>>([]);
  const [selected, setSelected] = useState<DashboardCalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parent/mentor-calendar');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load child calendar status.');
      setBookings(data.bookings || []);
      setChildren(data.children || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not load calendar status', description: error instanceof Error ? error.message : 'Try again.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  const events = useMemo<DashboardCalendarEvent[]>(() => bookings.filter((booking) => booking.status !== 'CANCELLED').map((booking) => ({
    id: `booking-${booking.id}`,
    title: `${booking.student.name} · ${booking.status.toLowerCase()} · ${booking.slot.teacher.name}`,
    start: new Date(booking.slot.startsAt),
    end: new Date(booking.slot.endsAt),
    state: booking.status.toLowerCase() as DashboardCalendarEvent['state'],
    details: `${booking.student.name} with ${booking.slot.teacher.name} · Parent local time: ${formatViewerDateTime(booking.slot.startsAt)} · Mentor time: ${formatDateTime(booking.slot.startsAt, booking.slot.timezone)} (${booking.slot.timezone})`,
  })), [bookings]);

  const selectedBooking = selected
    ? bookings.find((booking) => `booking-${booking.id}` === selected.id)
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Child calendar status</CardTitle>
            <CardDescription>Read-only view of your child’s requests and approved sessions with linked mentors. Mentor free time is not shown.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {children.length > 0 && <p className="mb-4 text-sm text-muted-foreground">Children: {children.map((child) => child.name).join(', ')}</p>}
          {loading ? <div className="flex h-64 items-center justify-center"><LoaderCircle className="h-7 w-7 animate-spin text-muted-foreground" /></div>
            : children.length === 0
              ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No active children are linked to this parent account.</p>
              : bookings.length === 0
                ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No mentor booking requests or approved sessions yet.</p>
                : <DashboardCalendar events={events} onSelectEvent={setSelected} />}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>{selected?.details}</DialogDescription>
          </DialogHeader>
          {selectedBooking && <div className="space-y-2 rounded-md border p-4 text-sm">
            <p><span className="font-medium">Child:</span> {selectedBooking.student.name}</p>
            <p><span className="font-medium">Mentor:</span> {selectedBooking.slot.teacher.name}</p>
            <p><span className="font-medium">Status:</span> {selectedBooking.status.toLowerCase()}</p>
            <p><span className="font-medium">Your local time:</span> {formatViewerDateTime(selectedBooking.slot.startsAt)}</p>
            <p><span className="font-medium">Mentor time:</span> {formatDateTime(selectedBooking.slot.startsAt, selectedBooking.slot.timezone)} ({selectedBooking.slot.timezone})</p>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
