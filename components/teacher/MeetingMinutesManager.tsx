"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getUserTimezone } from '@/lib/timezone';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

type Student = { id: number; name: string; email: string; requestStatus?: 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | null };
type Meeting = { id: string; title: string; startDateTime: string; endDateTime: string; attendees: Student[]; unmatchedAttendees: Array<{ email: string; name: string }> };
type ReviewRequest = { id: number; status: 'ASSIGNED' | 'SUBMITTED' | 'APPROVED'; studentMinutes: string | null; teacherFinalText: string | null; student: Student; meeting: { id: number; title: string; startDateTime: string } };

const localDateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function MeetingMinutesManager() {
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingId, setMeetingId] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMeetings, setExpandedMeetings] = useState<Set<number>>(new Set());
  const [hiddenMeetings, setHiddenMeetings] = useState<Set<number>>(new Set());
  const timezone = getUserTimezone();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [meetingResponse, requestResponse] = await Promise.all([
        fetch(`/api/teacher/meeting-minutes/eligible?date=${localDateKey()}&timezone=${encodeURIComponent(timezone)}`),
        fetch('/api/teacher/meeting-minutes/requests'),
      ]);
      const meetingData = await meetingResponse.json();
      const requestData = await requestResponse.json();
      if (!meetingResponse.ok) throw new Error(meetingData.error || 'Failed to load Google Calendar meetings');
      if (!requestResponse.ok) throw new Error(requestData.error || 'Failed to load requests');
      setMeetings(meetingData.meetings || []);
      setRequests(requestData.requests || []);
      setDrafts(Object.fromEntries((requestData.requests || []).map((item: ReviewRequest) => [item.id, item.teacherFinalText || item.studentMinutes || ''])));
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load meeting minutes'); }
    finally { setLoading(false); }
  }, [timezone]);

  useEffect(() => {
    try { setHiddenMeetings(new Set(JSON.parse(localStorage.getItem('aes:teacher:hidden-meeting-minutes') || '[]'))); } catch { setHiddenMeetings(new Set()); }
    void load();
  }, [load]);
  const activeMeeting = useMemo(() => meetings.find((meeting) => meeting.id === meetingId), [meetings, meetingId]);
  const availableAttendees = useMemo(() => activeMeeting?.attendees.filter((student) => !student.requestStatus) || [], [activeMeeting]);
  useEffect(() => { setSelected([]); }, [meetingId]);
  const groupedRequests = useMemo(() => {
    const groups = new Map<number, { meeting: ReviewRequest['meeting']; items: ReviewRequest[] }>();
    for (const item of requests) {
      const group = groups.get(item.meeting.id) || { meeting: item.meeting, items: [] };
      group.items.push(item); groups.set(item.meeting.id, group);
    }
    return Array.from(groups.values()).filter((group) => !hiddenMeetings.has(group.meeting.id));
  }, [requests, hiddenMeetings]);
  const hideMeeting = (id: number) => {
    const next = new Set(hiddenMeetings); next.add(id); setHiddenMeetings(next);
    localStorage.setItem('aes:teacher:hidden-meeting-minutes', JSON.stringify(Array.from(next)));
  };

  const assign = async () => {
    if (!meetingId || !selected.length) return;
    setSending(true);
    try {
      const response = await fetch('/api/teacher/meeting-minutes/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ googleCalendarEventId: meetingId, studentIds: selected, timezone }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to assign requests');
      toast({ title: 'Requests sent', description: `${data.created} new request(s); ${data.existing} already assigned.` });
      setSelected([]); await load();
    } catch (err) { toast({ variant: 'destructive', title: 'Could not send requests', description: err instanceof Error ? err.message : 'Try again.' }); }
    finally { setSending(false); }
  };

  const saveReview = async (id: number, approve: boolean) => {
    try {
      const response = await fetch(`/api/teacher/meeting-minutes/requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teacherFinalText: drafts[id], approve }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save review');
      toast({ title: approve ? 'Minutes approved and published' : 'Review saved', description: data.notificationWarning || (approve ? 'The student and parent can now view the approved minutes.' : undefined) }); await load();
    } catch (err) { toast({ variant: 'destructive', title: 'Review failed', description: err instanceof Error ? err.message : 'Try again.' }); }
  };

  if (loading) return <Card><CardContent className="py-10 text-center text-slate-500">Loading meeting minutes…</CardContent></Card>;
  return <div className="space-y-6">
    {error && <Card className="border-amber-300"><CardContent className="py-4"><p className="text-amber-800">{error}</p><Button className="mt-3" variant="outline" onClick={load}>Retry</Button></CardContent></Card>}
    <Card>
      <CardHeader><CardTitle>Assign meeting minutes</CardTitle><CardDescription>Completed meetings organized by you in Google Calendar today.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2" value={meetingId} onChange={(event) => setMeetingId(event.target.value)}>
          <option value="">Select a completed meeting</option>
          {meetings.map((meeting) => <option key={meeting.id} value={meeting.id}>{meeting.title} — {new Date(meeting.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</option>)}
        </select>
        {activeMeeting && <div className="space-y-3">
          <div className="flex items-center gap-2"><Checkbox disabled={!availableAttendees.length} checked={selected.length === availableAttendees.length && availableAttendees.length > 0} onCheckedChange={(checked) => setSelected(checked ? availableAttendees.map((student) => student.id) : [])}/><span className="font-medium">Select all available students</span></div>
          {activeMeeting.attendees.map((student) => <label key={student.id} className={`flex items-center justify-between gap-2 rounded border p-3 ${student.requestStatus ? 'bg-slate-50 text-slate-500' : ''}`}><span className="flex items-center gap-2"><Checkbox disabled={Boolean(student.requestStatus)} checked={selected.includes(student.id)} onCheckedChange={(checked) => setSelected((current) => checked ? Array.from(new Set([...current, student.id])) : current.filter((id) => id !== student.id))}/><span>{student.name} <span className="text-slate-500">({student.email})</span></span></span>{student.requestStatus && <Badge variant="secondary">Already sent · {student.requestStatus.toLowerCase()}</Badge>}</label>)}
          {!activeMeeting.attendees.length && <p className="text-sm text-slate-500">No attendees match students assigned to your AES account.</p>}
          {!!activeMeeting.unmatchedAttendees.length && <p className="text-sm text-amber-700">{activeMeeting.unmatchedAttendees.length} attendee(s) are not matched to your AES students.</p>}
          <Button disabled={!selected.length || sending} onClick={assign}>{sending ? 'Sending…' : `Send to ${selected.length} student(s)`}</Button>
        </div>}
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Student submissions</CardTitle><CardDescription>Review, edit, and approve each student’s minutes independently.</CardDescription></CardHeader>
      <CardContent className="space-y-5">
        {!groupedRequests.length && <p className="text-slate-500">No visible meeting-minute requests yet.</p>}
        {!!hiddenMeetings.size && <Button variant="ghost" size="sm" onClick={() => { setHiddenMeetings(new Set()); localStorage.removeItem('aes:teacher:hidden-meeting-minutes'); }}>Restore locally hidden meetings</Button>}
        {groupedRequests.map((group) => { const expanded = expandedMeetings.has(group.meeting.id); return <div key={group.meeting.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex min-h-24 items-center justify-between gap-3 p-5">
            <button className="flex flex-1 items-center gap-3 text-left" onClick={() => setExpandedMeetings((current) => { const next = new Set(current); next.has(group.meeting.id) ? next.delete(group.meeting.id) : next.add(group.meeting.id); return next; })}>{expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}<span><span className="block text-lg font-semibold">{group.meeting.title}</span><span className="text-sm text-slate-500">{new Date(group.meeting.startDateTime).toLocaleString()} · {group.items.length} student submission(s)</span></span></button>
            <Button variant="ghost" size="sm" title="Hide only on this dashboard" onClick={() => hideMeeting(group.meeting.id)}><Trash2 className="h-4 w-4"/><span className="ml-2 hidden sm:inline">Hide locally</span></Button>
          </div>
          {expanded && <div className="space-y-4 border-t bg-slate-50/50 p-5">{group.items.map((item) => <div key={item.id} className="space-y-3 rounded-lg border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{item.student.name} <span className="font-normal text-slate-500">({item.student.email})</span></p><Badge>{item.status}</Badge></div>
            {item.status === 'ASSIGNED' ? <p className="text-sm text-slate-500">Waiting for the student to submit.</p> : <><div><p className="mb-1 text-sm font-medium">Original student submission</p><div className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm">{item.studentMinutes}</div></div><div><p className="mb-1 text-sm font-medium">Tutor edits or additional points <span className="font-normal text-slate-500">(optional)</span></p><Textarea rows={7} placeholder="Leave unchanged to approve the student's submission as-is." value={drafts[item.id] || ''} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))}/></div><div className="flex gap-2"><Button variant="outline" onClick={() => saveReview(item.id, false)}>Save edit</Button><Button onClick={() => saveReview(item.id, true)}>{item.status === 'APPROVED' ? 'Update approved minutes' : 'Approve'}</Button></div></>}
          </div>)}</div>}
        </div>; })}
      </CardContent>
    </Card>
  </div>;
}
