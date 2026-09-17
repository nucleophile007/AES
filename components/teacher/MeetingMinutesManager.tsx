"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getUserTimezone } from '@/lib/timezone';
import { Calendar, Check, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

type Student = { id: number; name: string; email: string; requestStatus?: 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | null };
type Meeting = { id: string; title: string; startDateTime: string; endDateTime: string; attendees: Student[]; unmatchedAttendees: Array<{ email: string; name: string }> };
type CreationMode = 'STUDENT_ASSIGNED' | 'MENTOR_DIRECT';
type ReviewRequest = { id: number; status: 'ASSIGNED' | 'SUBMITTED' | 'APPROVED'; creationMode: CreationMode; studentMinutes: string | null; teacherFinalText: string | null; student: Student; meeting: { id: number; title: string; startDateTime: string } };

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
  const [creationMode, setCreationMode] = useState<CreationMode>('STUDENT_ASSIGNED');
  const [commonMinutes, setCommonMinutes] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMeetings, setExpandedMeetings] = useState<Set<number>>(new Set());
  const [hiddenMeetings, setHiddenMeetings] = useState<Set<number>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timezone = getUserTimezone();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatMeetingLabel = (meeting: Meeting) => {
    const d = new Date(meeting.startDateTime);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${meeting.title} — ${dayName}, ${dateStr} @ ${timeStr}`;
  };

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
  const selectableAttendees = creationMode === 'MENTOR_DIRECT' ? activeMeeting?.attendees || [] : availableAttendees;
  useEffect(() => { setSelected([]); setCommonMinutes(''); setShowPreview(false); }, [meetingId, creationMode]);
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

  const sendDirect = async (overrideExisting = false) => {
    if (!meetingId || !selected.length || !commonMinutes.trim()) return;
    if (!overrideExisting && !window.confirm(`Send one common set of final minutes to ${selected.length} selected student(s) and their parents? Students will not be asked to submit their own minutes.`)) return;
    setSending(true);
    try {
      const response = await fetch('/api/teacher/meeting-minutes/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleCalendarEventId: meetingId, studentIds: selected, minutes: commonMinutes, timezone, overrideExisting }),
      });
      const data = await response.json();
      if (response.status === 409 && data.requiresConfirmation) {
        const names = (data.conflicts || []).map((item: { studentName: string; status: string }) => `${item.studentName} (${item.status.toLowerCase()})`).join(', ');
        if (window.confirm(`Existing student-assigned minutes will be replaced for: ${names}. Continue and send the mentor's common minutes?`)) {
          setSending(false);
          await sendDirect(true);
        }
        return;
      }
      if (!response.ok) throw new Error(data.error || 'Failed to send final minutes');
      toast({ title: 'Final minutes sent', description: data.notificationWarning || `Common minutes saved for ${data.recipients} student(s); ${data.notification.sent} email(s) sent.` });
      setSelected([]); setCommonMinutes(''); setShowPreview(false); await load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not send final minutes', description: err instanceof Error ? err.message : 'Try again.' });
    } finally { setSending(false); }
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
      <CardHeader><CardTitle>Create meeting minutes</CardTitle><CardDescription>Completed meetings from the past 7 days. Assign personal minutes to students, or write one common set and send it directly.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setCreationMode('STUDENT_ASSIGNED')} className={`rounded-xl border p-4 text-left transition ${creationMode === 'STUDENT_ASSIGNED' ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' : 'border-slate-200 hover:border-slate-400'}`}>
            <span className="block font-semibold">Assign to students</span><span className="mt-1 block text-sm text-slate-500">Each student writes personal minutes for mentor review.</span>
          </button>
          <button type="button" onClick={() => setCreationMode('MENTOR_DIRECT')} className={`rounded-xl border p-4 text-left transition ${creationMode === 'MENTOR_DIRECT' ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' : 'border-slate-200 hover:border-slate-400'}`}>
            <span className="block font-semibold">Write and send myself</span><span className="mt-1 block text-sm text-slate-500">Write one common final version for all selected attendees.</span>
          </button>
        </div>
        <div className="relative w-full" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left font-medium text-slate-800 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="truncate">
                {activeMeeting ? formatMeetingLabel(activeMeeting) : 'Select a completed meeting'}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
              {meetings.length === 0 ? (
                <div className="p-3 text-center text-sm text-slate-500">No completed meetings found in the past 7 days</div>
              ) : (
                meetings.map((meeting) => {
                  const isSelected = meeting.id === meetingId;
                  const label = formatMeetingLabel(meeting);
                  return (
                    <button
                      key={meeting.id}
                      type="button"
                      onClick={() => {
                        setMeetingId(meeting.id);
                        setDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        isSelected
                          ? 'bg-yellow-50 font-semibold text-slate-900'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-900">{meeting.title}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(meeting.startDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} @ {new Date(meeting.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-yellow-600" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
        {activeMeeting && <div className="space-y-3">
          <div className="flex items-center gap-2"><Checkbox disabled={!selectableAttendees.length} checked={selected.length === selectableAttendees.length && selectableAttendees.length > 0} onCheckedChange={(checked) => setSelected(checked ? selectableAttendees.map((student) => student.id) : [])}/><span className="font-medium">Select all {creationMode === 'MENTOR_DIRECT' ? 'meeting attendees' : 'available students'}</span></div>
          {activeMeeting.attendees.map((student) => { const disabled = creationMode === 'STUDENT_ASSIGNED' && Boolean(student.requestStatus); return <label key={student.id} className={`flex items-center justify-between gap-2 rounded border p-3 ${disabled ? 'bg-slate-50 text-slate-500' : ''}`}><span className="flex items-center gap-2"><Checkbox disabled={disabled} checked={selected.includes(student.id)} onCheckedChange={(checked) => setSelected((current) => checked ? Array.from(new Set([...current, student.id])) : current.filter((id) => id !== student.id))}/><span>{student.name} <span className="text-slate-500">({student.email})</span></span></span>{student.requestStatus && <Badge variant="secondary">Existing · {student.requestStatus.toLowerCase()}</Badge>}</label>; })}
          {!activeMeeting.attendees.length && <p className="text-sm text-slate-500">No attendees match students assigned to your AES account.</p>}
          {!!activeMeeting.unmatchedAttendees.length && <p className="text-sm text-amber-700">{activeMeeting.unmatchedAttendees.length} attendee(s) are not matched to your AES students.</p>}
          {creationMode === 'STUDENT_ASSIGNED' ? <Button disabled={!selected.length || sending} onClick={assign}>{sending ? 'Sending…' : `Assign to ${selected.length} student(s)`}</Button> : <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div><div className="mb-2 flex items-center justify-between"><label className="font-medium">Common final meeting minutes</label><span className="text-xs text-slate-500">{commonMinutes.length}/20,000</span></div><Textarea rows={10} maxLength={20000} placeholder="Write the discussion points, decisions, action items, owners, and deadlines…" value={commonMinutes} onChange={(event) => { setCommonMinutes(event.target.value); setShowPreview(false); }}/></div>
            {showPreview && <div className="rounded-lg border bg-white p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Preview — common to all selected recipients</p><div className="whitespace-pre-wrap text-sm">{commonMinutes}</div></div>}
            <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={!commonMinutes.trim()} onClick={() => setShowPreview((current) => !current)}>{showPreview ? 'Hide preview' : 'Preview'}</Button><Button disabled={!selected.length || !commonMinutes.trim() || sending} onClick={() => void sendDirect()}>{sending ? 'Sending…' : `Send final minutes to ${selected.length} student(s)`}</Button></div>
            <p className="text-xs text-amber-700">Students will not be asked to submit. The same final minutes will be sent to every selected student and parent.</p>
          </div>}
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
            {item.creationMode === 'MENTOR_DIRECT' ? <div className="space-y-3"><Badge variant="secondary">Prepared by mentor · sent directly</Badge><div className="whitespace-pre-wrap rounded bg-emerald-50 p-3 text-sm">{item.teacherFinalText}</div></div> : item.status === 'ASSIGNED' ? <p className="text-sm text-slate-500">Waiting for the student to submit.</p> : <><div><p className="mb-1 text-sm font-medium">Original student submission</p><div className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm">{item.studentMinutes}</div></div><div><p className="mb-1 text-sm font-medium">Tutor edits or additional points <span className="font-normal text-slate-500">(optional)</span></p><Textarea rows={7} placeholder="Leave unchanged to approve the student's submission as-is." value={drafts[item.id] || ''} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))}/></div><div className="flex gap-2"><Button variant="outline" onClick={() => saveReview(item.id, false)}>Save edit</Button><Button onClick={() => saveReview(item.id, true)}>{item.status === 'APPROVED' ? 'Update approved minutes' : 'Approve'}</Button></div></>}
          </div>)}</div>}
        </div>; })}
      </CardContent>
    </Card>
  </div>;
}
