"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, LoaderCircle, RefreshCw, Send, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DashboardCalendar, type DashboardCalendarEvent } from '@/components/calendar/DashboardCalendar';

interface CalendarSlot {
  id: number;
  startsAt: string;
  endsAt: string;
  timezone: string;
  status: 'OPEN' | 'BOOKED' | 'CANCELLED';
  teacher: { id: number; name: string; email: string };
  requests: Array<{ id: number; status: string; message: string | null; createdAt: string }>;
}

interface BookingRequest {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELLED';
  message: string | null;
  slot: CalendarSlot;
}

const formatTime = (instant: string, timezone: string) => new Intl.DateTimeFormat('en-US', {
  timeZone: timezone,
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(instant));
const formatViewerTime = (instant: string) => new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(instant));

export default function StudentMentorCalendar() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [teachers, setTeachers] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [selected, setSelected] = useState<DashboardCalendarEvent | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/mentor-slots');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load linked mentor availability.');
      setSlots(data.slots || []);
      setRequests(data.requests || []);
      setTeachers(data.teachers || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not load mentor calendar', description: error instanceof Error ? error.message : 'Try again.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  const events = useMemo<DashboardCalendarEvent[]>(() => {
    const slotEvents = slots.filter((slot) => slot.status !== 'CANCELLED').map((slot) => {
      const ownRequest = slot.requests[0];
      const isPending = ownRequest?.status === 'PENDING';
      const state: DashboardCalendarEvent['state'] = slot.status === 'BOOKED'
        ? 'approved'
        : isPending
          ? 'pending'
          : slot.status === 'CANCELLED'
            ? 'cancelled'
            : 'available';
      const title = state === 'approved' ? `Booked · ${slot.teacher.name}` : isPending ? `Request pending · ${slot.teacher.name}` : `Available · ${slot.teacher.name}`;
      return {
        id: `slot-${slot.id}`,
        title,
        start: new Date(slot.startsAt),
        end: new Date(slot.endsAt),
        state,
        details: `${slot.teacher.name} · Your time: ${formatViewerTime(slot.startsAt)}–${formatViewerTime(slot.endsAt)} · Mentor time: ${formatTime(slot.startsAt, slot.timezone)}–${new Intl.DateTimeFormat('en-US', { timeZone: slot.timezone, timeStyle: 'short' }).format(new Date(slot.endsAt))} (${slot.timezone})`,
      };
    });
    const pastOrClosedRequestEvents = requests
      .filter((booking) => booking.status !== 'CANCELLED' && (booking.slot.status !== 'OPEN' || new Date(booking.slot.startsAt) < new Date()))
      .map((booking) => ({
        id: `booking-${booking.id}`,
        title: `${booking.status[0]}${booking.status.slice(1).toLowerCase()} · ${booking.slot.teacher.name}`,
        start: new Date(booking.slot.startsAt),
        end: new Date(booking.slot.endsAt),
        state: booking.status.toLowerCase() as DashboardCalendarEvent['state'],
        details: `${booking.slot.teacher.name} · Your time: ${formatViewerTime(booking.slot.startsAt)}–${formatViewerTime(booking.slot.endsAt)} · Mentor time: ${formatTime(booking.slot.startsAt, booking.slot.timezone)}–${new Intl.DateTimeFormat('en-US', { timeZone: booking.slot.timezone, timeStyle: 'short' }).format(new Date(booking.slot.endsAt))} (${booking.slot.timezone})`,
      }));
    return [...slotEvents, ...pastOrClosedRequestEvents];
  }, [requests, slots]);

  const selectedSlotId = selected?.id.startsWith('slot-') ? Number(selected.id.replace('slot-', '')) : null;
  const selectedBookingId = selected?.id.startsWith('booking-') ? Number(selected.id.replace('booking-', '')) : null;
  const selectedSlot = selectedSlotId ? slots.find((slot) => slot.id === selectedSlotId) : null;
  const selectedBooking = selectedBookingId ? requests.find((booking) => booking.id === selectedBookingId) : null;
  const currentRequest = selectedSlot?.requests[0];

  const requestSlot = async () => {
    if (!selectedSlot) return;
    setSending(true);
    try {
      const response = await fetch('/api/student/mentor-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot.id, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not request this time.');
      toast({ title: 'Request sent', description: data.notificationWarning || 'Your mentor will review it. The time is not booked until approved.' });
      setSelected(null);
      setMessage('');
      await load();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not send request', description: error instanceof Error ? error.message : 'Try again.' });
    } finally {
      setSending(false);
    }
  };

  const withdrawRequest = async (bookingId: number) => {
    setSending(true);
    try {
      const response = await fetch(`/api/student/mentor-slots/${bookingId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not withdraw request.');
      toast({ title: 'Request withdrawn', description: data.notificationWarning || undefined });
      setSelected(null);
      await load();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not withdraw request', description: error instanceof Error ? error.message : 'Try again.' });
    } finally {
      setSending(false);
    }
  };

  const selectedTeacher = selectedSlot?.teacher || selectedBooking?.slot.teacher;
  const slotStatus = selectedSlot?.status;
  const isRequestOpen = Boolean(selectedSlot && selectedSlot.status === 'OPEN' && currentRequest?.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Linked mentor availability</CardTitle>
            <CardDescription>Only free time from mentors linked to your account is shown. A request is not a booking until your mentor approves it.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {teachers.length > 0 && <p className="mb-4 text-sm text-muted-foreground">Linked mentors: {teachers.map((teacher) => teacher.name).join(', ')}</p>}
          {loading ? <div className="flex h-64 items-center justify-center"><LoaderCircle className="h-7 w-7 animate-spin text-muted-foreground" /></div>
            : teachers.length === 0
              ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No mentors are linked to your account yet.</p>
              : <DashboardCalendar events={events} onSelectEvent={setSelected} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> Your booking requests</CardTitle>
          <CardDescription>Pending requests may be withdrawn. Approved requests are added to your schedule.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.length === 0 && <p className="text-sm text-muted-foreground">You have no booking requests.</p>}
          {requests.map((booking) => (
            <div key={booking.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{booking.slot.teacher.name} · {booking.status.toLowerCase()}</p>
                <p className="text-sm text-muted-foreground">Your time: {formatViewerTime(booking.slot.startsAt)} – {formatViewerTime(booking.slot.endsAt)} · Mentor time: {formatTime(booking.slot.startsAt, booking.slot.timezone)} – {formatTime(booking.slot.endsAt, booking.slot.timezone)} ({booking.slot.timezone})</p>
              </div>
              {booking.status === 'PENDING' && <Button variant="outline" size="sm" onClick={() => void withdrawRequest(booking.id)} disabled={sending}><X className="mr-2 h-4 w-4" /> Withdraw</Button>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) { setSelected(null); setMessage(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>{selected?.details}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedTeacher && <p className="text-sm"><span className="font-medium">Mentor:</span> {selectedTeacher.name}</p>}
            {currentRequest?.status === 'PENDING' && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">Your request is awaiting mentor approval.</p>}
            {selectedBooking && <p className="rounded-md bg-slate-50 p-3 text-sm">Request status: <span className="font-medium">{selectedBooking.status.toLowerCase()}</span></p>}
            {isRequestOpen && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mentor-request-message">Optional note to your mentor</Label>
                  <Textarea id="mentor-request-message" maxLength={500} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Add a short note, if helpful." />
                  <p className="text-xs text-muted-foreground">{message.length}/500 characters</p>
                </div>
                <p className="text-sm text-muted-foreground">The mentor must approve this request before the time is reserved.</p>
              </>
            )}
            {slotStatus === 'BOOKED' && <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900"><CheckCircle2 className="mr-1 inline h-4 w-4" /> Your mentor approved this session.</p>}
          </div>
          <DialogFooter>
            {isRequestOpen && <Button onClick={() => void requestSlot()} disabled={sending}><Send className="mr-2 h-4 w-4" /> Request this time</Button>}
            {selectedBooking?.status === 'PENDING' && <Button variant="outline" onClick={() => void withdrawRequest(selectedBooking.id)} disabled={sending}><X className="mr-2 h-4 w-4" /> Withdraw request</Button>}
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
