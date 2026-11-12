"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Check, Clock3, LoaderCircle, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { COMMON_TIMEZONES, getUserTimezone } from '@/lib/timezone';
import { DashboardCalendar, toWallClockDate, type DashboardCalendarEvent } from '@/components/calendar/DashboardCalendar';

interface SlotRequest {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELLED';
  message: string | null;
  student: { id: number; name: string; email: string };
}

interface AvailabilitySlot {
  id: number;
  startsAt: string;
  endsAt: string;
  timezone: string;
  status: 'OPEN' | 'BOOKED' | 'CANCELLED';
  requests: SlotRequest[];
}

interface Booking {
  id: number;
  status: SlotRequest['status'];
  googleSyncError: string | null;
  slot: Pick<AvailabilitySlot, 'id' | 'startsAt' | 'endsAt' | 'timezone'>;
  student: { name: string; email: string };
  classSchedule: { googleCalendarEventId: string | null } | null;
}

const formatDateTimeLocal = (date: Date) => {
  const two = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`;
};

const defaultStart = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return formatDateTimeLocal(date);
};

const defaultEnd = () => {
  const date = new Date();
  date.setHours(date.getHours() + 2, 0, 0, 0);
  return formatDateTimeLocal(date);
};

function formatSlot(slot: Pick<AvailabilitySlot, 'startsAt' | 'endsAt' | 'timezone'>) {
  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);
  return `${new Intl.DateTimeFormat('en-US', { timeZone: slot.timezone, dateStyle: 'medium' }).format(start)}, ${new Intl.DateTimeFormat('en-US', { timeZone: slot.timezone, timeStyle: 'short' }).format(start)}–${new Intl.DateTimeFormat('en-US', { timeZone: slot.timezone, timeStyle: 'short' }).format(end)} (${slot.timezone})`;
}

export default function MentorAvailabilityCalendar() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [timezone, setTimezone] = useState('UTC');
  const [startLocal, setStartLocal] = useState(defaultStart);
  const [endLocal, setEndLocal] = useState(defaultEnd);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeAction, setActiveAction] = useState<number | null>(null);
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AvailabilitySlot | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [slotsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/teacher/availability-slots'),
        fetch('/api/teacher/slot-bookings'),
      ]);
      const [slotsData, bookingsData] = await Promise.all([slotsResponse.json(), bookingsResponse.json()]);
      if (!slotsResponse.ok) throw new Error(slotsData.error || 'Failed to load availability.');
      if (!bookingsResponse.ok) throw new Error(bookingsData.error || 'Failed to load booking requests.');
      setSlots(slotsData.slots || []);
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not load calendar', description: error instanceof Error ? error.message : 'Try again.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const detectedTimezone = getUserTimezone();
    setTimezone(detectedTimezone);
    void load();
  }, [load]);

  const events = useMemo<DashboardCalendarEvent[]>(() => slots.filter((slot) => slot.status !== 'CANCELLED').map((slot) => {
    const approved = slot.requests.find((request) => request.status === 'APPROVED');
    const pending = slot.requests.filter((request) => request.status === 'PENDING').length;
    const state = slot.status === 'BOOKED' ? 'approved' : pending > 0 ? 'pending' : 'available';
    const title = slot.status === 'BOOKED'
      ? `Booked · ${approved?.student.name || 'student'}`
      : pending > 0
        ? `Free · ${pending} request${pending === 1 ? '' : 's'}`
        : 'Free slot';
    return {
      id: `slot-${slot.id}`,
      title,
      start: toWallClockDate(slot.startsAt, timezone),
      end: toWallClockDate(slot.endsAt, timezone),
      state,
      details: formatSlot(slot),
    };
  }), [slots, timezone]);

  const selectedSlot = selected ? slots.find((slot) => slot.id === selected.id) || selected : null;

  const addAvailability = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/teacher/availability-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startLocal, endLocal, timezone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save availability.');
      toast({ title: 'Free time published', description: formatSlot(data.slot) });
      await load();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not add free time', description: error instanceof Error ? error.message : 'Try again.' });
    } finally {
      setSaving(false);
    }
  };

  const decide = async (bookingId: number, decision: 'approve' | 'decline' | 'cancel' | 'retry-google-sync' | 'retry-google-cancel') => {
    setActiveAction(bookingId);
    try {
      const response = await fetch(`/api/teacher/slot-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update request.');
      toast({
        title: decision.startsWith('retry-') ? 'Calendar sync retried' : decision === 'cancel' ? 'Session cancelled' : `Request ${decision === 'approve' ? 'approved' : 'declined'}`,
        description: data.notificationWarning || undefined,
      });
      await load();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not update request', description: error instanceof Error ? error.message : 'Try again.' });
    } finally {
      setActiveAction(null);
    }
  };

  const removeSlot = async (slot: AvailabilitySlot) => {
    setActiveAction(slot.id);
    try {
      const response = await fetch(`/api/teacher/availability-slots/${slot.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not remove slot.');
      toast({ title: 'Free slot removed', description: data.notificationWarning || undefined });
      setSelected(null);
      await load();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not remove slot', description: error instanceof Error ? error.message : 'Try again.' });
    } finally {
      setActiveAction(null);
    }
  };

  const timezoneOptions = COMMON_TIMEZONES.some((item) => item.value === timezone)
    ? COMMON_TIMEZONES
    : [{ value: timezone, label: `${timezone} (detected)` }, ...COMMON_TIMEZONES];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" /> Publish free time</CardTitle>
          <CardDescription>Choose any future start and end time. Students linked to you can request an open slot; it is reserved only after you approve a request.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addAvailability} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="mentor-slot-start">Start</Label>
              <input id="mentor-slot-start" type="datetime-local" required value={startLocal} onChange={(event) => setStartLocal(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mentor-slot-end">End</Label>
              <input id="mentor-slot-end" type="datetime-local" required value={endLocal} onChange={(event) => setEndLocal(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mentor-slot-timezone">Mentor timezone</Label>
              <select id="mentor-slot-timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {timezoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Publish free time
              </Button>
            </div>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Times skipped or repeated during daylight-saving changes are rejected instead of being guessed.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Free slot calendar</CardTitle>
            <CardDescription>Calendar times are displayed in {timezone}. Drag over a future time to fill in a custom start and end, then publish it.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex h-64 items-center justify-center"><LoaderCircle className="h-7 w-7 animate-spin text-muted-foreground" /></div>
            : <DashboardCalendar
              events={events}
              selectable
              onSelectSlot={({ start, end }) => {
                setStartLocal(formatDateTimeLocal(start));
                setEndLocal(formatDateTimeLocal(end));
                document.getElementById('mentor-slot-start')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              onSelectEvent={(event) => {
                const id = Number(event.id.replace('slot-', ''));
                const slot = slots.find((item) => item.id === id);
                if (slot) setSelected(slot);
              }}
            />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock3 className="h-5 w-5" /> Booking requests</CardTitle>
          <CardDescription>Approving one request reserves that time and declines any other pending requests for the same slot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {bookings.length === 0 && <p className="text-sm text-muted-foreground">No booking requests yet.</p>}
          {bookings.map((booking) => (
            <div key={booking.id} className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{booking.student.name} <span className="font-normal text-muted-foreground">({booking.student.email})</span></p>
                <p className="text-sm text-muted-foreground">{formatSlot(booking.slot)} · {booking.status.toLowerCase()}</p>
                {booking.googleSyncError && <p className="mt-1 text-sm text-amber-700">Google Calendar sync needs attention: {booking.googleSyncError}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.status === 'PENDING' && <>
                  <Button size="sm" onClick={() => void decide(booking.id, 'approve')} disabled={activeAction === booking.id}><Check className="mr-1.5 h-4 w-4" /> Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => void decide(booking.id, 'decline')} disabled={activeAction === booking.id}><X className="mr-1.5 h-4 w-4" /> Decline</Button>
                </>}
                {booking.status === 'APPROVED' && booking.googleSyncError && (
                  <Button size="sm" variant="outline" onClick={() => void decide(booking.id, 'retry-google-sync')} disabled={activeAction === booking.id}>Retry Google sync</Button>
                )}
                {booking.status === 'APPROVED' && (
                  <Button size="sm" variant="outline" onClick={() => {
                    if (window.confirm(`Cancel the approved session with ${booking.student.name}?`)) void decide(booking.id, 'cancel');
                  }} disabled={activeAction === booking.id}>Cancel session</Button>
                )}
                {booking.status === 'CANCELLED' && booking.googleSyncError && (
                  <Button size="sm" variant="outline" onClick={() => void decide(booking.id, 'retry-google-cancel')} disabled={activeAction === booking.id}>Retry Google removal</Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedSlot)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSlot?.status === 'BOOKED' ? 'Booked session' : selectedSlot?.status === 'CANCELLED' ? 'Cancelled slot' : 'Free time'}</DialogTitle>
            <DialogDescription>{selectedSlot && formatSlot(selectedSlot)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedSlot?.requests.map((booking) => (
              <div key={booking.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{booking.student.name}</p>
                  <span className="text-xs uppercase text-muted-foreground">{booking.status.toLowerCase()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{booking.student.email}</p>
                {booking.message && <p className="mt-2 whitespace-pre-wrap text-sm">{booking.message}</p>}
                {booking.status === 'PENDING' && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => void decide(booking.id, 'approve')} disabled={activeAction === booking.id}><Check className="mr-1.5 h-4 w-4" /> Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => void decide(booking.id, 'decline')} disabled={activeAction === booking.id}><X className="mr-1.5 h-4 w-4" /> Decline</Button>
                  </div>
                )}
                {booking.status === 'APPROVED' && (
                  <Button size="sm" variant="destructive" className="mt-3" onClick={() => {
                    if (window.confirm(`Cancel the approved session with ${booking.student.name}?`)) void decide(booking.id, 'cancel');
                  }} disabled={activeAction === booking.id}>Cancel session</Button>
                )}
              </div>
            ))}
            {selectedSlot?.requests.length === 0 && <p className="text-sm text-muted-foreground">No student requests for this time.</p>}
          </div>
          <DialogFooter>
            {selectedSlot?.status === 'OPEN' && <Button variant="destructive" onClick={() => setDeleteCandidate(selectedSlot)} disabled={activeAction === selectedSlot.id}><Trash2 className="mr-2 h-4 w-4" /> Remove slot</Button>}
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove free slot?</DialogTitle>
            <DialogDescription>
              Any pending requests will be declined and the students will be notified.
              {deleteCandidate && ` ${formatSlot(deleteCandidate)}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCandidate(null)}>Keep slot</Button>
            <Button variant="destructive" onClick={() => {
              if (!deleteCandidate) return;
              const slot = deleteCandidate;
              setDeleteCandidate(null);
              void removeSlot(slot);
            }} disabled={Boolean(deleteCandidate && activeAction === deleteCandidate.id)}>
              {deleteCandidate && activeAction === deleteCandidate.id && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Remove slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
