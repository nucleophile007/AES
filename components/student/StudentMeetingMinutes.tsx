"use client";
import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

type Item = { id: number; status: 'ASSIGNED' | 'SUBMITTED' | 'APPROVED'; creationMode: 'STUDENT_ASSIGNED' | 'MENTOR_DIRECT'; studentMinutes: string | null; teacherFinalText: string | null; meeting: { title: string; startDateTime: string; teacher: { name: string } } };
const HIDDEN_KEY = 'aes:student:hidden-meeting-minutes';

export default function StudentMeetingMinutes() {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]); const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set()); const [hidden, setHidden] = useState<Set<number>>(new Set()); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); const response = await fetch('/api/student/meeting-minutes'); const data = await response.json(); if (response.ok) { setItems(data.requests || []); setDrafts(Object.fromEntries((data.requests || []).map((item: Item) => [item.id, item.studentMinutes || localStorage.getItem(`aes:meeting-minutes:${item.id}`) || '']))); } setLoading(false); }, []);
  useEffect(() => { try { setHidden(new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'))); } catch { setHidden(new Set()); } void load(); }, [load]);
  const submit = async (id: number) => { const response = await fetch(`/api/student/meeting-minutes/${id}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentMinutes: drafts[id] }) }); const data = await response.json(); if (!response.ok) return toast({ variant: 'destructive', title: 'Submission failed', description: data.error }); localStorage.removeItem(`aes:meeting-minutes:${id}`); toast({ title: 'Meeting minutes submitted', description: 'Your submission is locked and awaiting tutor approval.' }); await load(); };
  const hide = (id: number) => { const next = new Set(hidden); next.add(id); setHidden(next); localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(next))); };
  const visible = items.filter((item) => !hidden.has(item.id));
  if (loading) return <Card><CardContent className="py-10 text-center text-slate-500">Loading meeting minutes…</CardContent></Card>;
  return <div className="space-y-4">
    {!visible.length && <Card><CardContent className="py-10 text-center text-slate-500">No visible meeting-minute requests.</CardContent></Card>}
    {!!hidden.size && <Button variant="ghost" size="sm" onClick={() => { setHidden(new Set()); localStorage.removeItem(HIDDEN_KEY); }}>Restore locally hidden meetings</Button>}
    {visible.map((item) => { const open = expanded.has(item.id); return <Card key={item.id} className="overflow-hidden"><div className="flex min-h-24 items-center justify-between gap-3 p-5"><button className="flex flex-1 items-center gap-3 text-left" onClick={() => setExpanded((current) => { const next = new Set(current); next.has(item.id) ? next.delete(item.id) : next.add(item.id); return next; })}>{open ? <ChevronDown className="h-5 w-5"/> : <ChevronRight className="h-5 w-5"/>}<span><span className="block text-lg font-semibold">{item.meeting.title}</span><span className="text-sm text-slate-500">{item.meeting.teacher.name} · {new Date(item.meeting.startDateTime).toLocaleString()}</span></span></button><div className="flex flex-wrap items-center gap-2">{item.creationMode === 'MENTOR_DIRECT' && <Badge variant="secondary">Prepared by mentor</Badge>}<Badge>{item.status}</Badge></div><Button variant="ghost" size="sm" title="Hide only on this dashboard" onClick={() => hide(item.id)}><Trash2 className="h-4 w-4"/></Button></div>{open && <CardContent className="border-t pt-5">{item.status === 'APPROVED' ? <div className="space-y-2"><p className="text-sm text-slate-500">{item.creationMode === 'MENTOR_DIRECT' ? 'Prepared and sent directly by your mentor.' : 'Prepared by you and approved by your mentor.'}</p><div className="whitespace-pre-wrap rounded-lg bg-emerald-50 p-4">{item.teacherFinalText}</div></div> : item.status === 'SUBMITTED' ? <div className="space-y-3"><div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4">{item.studentMinutes}</div><p className="text-sm text-slate-500">Submitted and locked. Awaiting tutor review and approval.</p></div> : <div className="space-y-3"><Textarea rows={8} placeholder="Write the key discussion points, decisions, and action items…" value={drafts[item.id] || ''} onChange={(event) => { const value = event.target.value; setDrafts((current) => ({ ...current, [item.id]: value })); localStorage.setItem(`aes:meeting-minutes:${item.id}`, value); }}/><Button onClick={() => submit(item.id)}>Submit for review</Button><p className="text-xs text-amber-700">You cannot edit these minutes after submitting.</p></div>}</CardContent>}</Card>; })}
  </div>;
}
