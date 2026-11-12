"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TASK_PRIORITIES, type TaskPriority } from "@/lib/tasks";
import { AlertTriangle, Ban, CalendarClock, Check, ChevronDown, Flag, Loader2, RotateCcw, UserMinus, X } from "lucide-react";
import { taskApi } from "@/components/tasks/api";

interface BulkActionBarProps {
  selectedIds: number[];
  onClear: () => void;
  onDone: () => void;
}

type Pending =
  | { kind: "REQUEST_CHANGES" }
  | { kind: "SET_DEADLINE" }
  | { kind: "UNASSIGN" }
  | null;

export function BulkActionBar({ selectedIds, onClear, onDone }: BulkActionBarProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [feedback, setFeedback] = useState("");
  const [deadline, setDeadline] = useState("");

  const run = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(true);
    try {
      const res = await taskApi<{ updated: number; skipped: number }>("/api/teacher/tasks/bulk", {
        method: "POST",
        json: { action, studentTaskIds: selectedIds, ...extra },
      });
      toast({
        title: `Updated ${res.updated}`,
        description: res.skipped ? `${res.skipped} item(s) skipped because they weren't in the right status.` : undefined,
      });
      setPending(null);
      setFeedback("");
      setDeadline("");
      onClear();
      onDone();
    } catch (err) {
      toast({ title: "Bulk action failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (!selectedIds.length) return null;

  return (
    <>
      <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/95 backdrop-blur px-3 py-2 shadow-sm">
        <span className="text-sm font-semibold text-indigo-900">{selectedIds.length} selected</span>
        <div className="h-4 w-px bg-indigo-200" />
        <Button size="sm" className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={busy} onClick={() => void run("APPROVE")}>
          <Check className="h-3.5 w-3.5" /> Approve
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 bg-white" disabled={busy} onClick={() => setPending({ kind: "REQUEST_CHANGES" })}>
          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Request changes
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 bg-white" disabled={busy}>
              <CalendarClock className="h-3.5 w-3.5" /> Deadline <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="text-xs">Push deadlines</DropdownMenuLabel>
            {[1, 3, 7, 14].map((d) => (
              <DropdownMenuItem key={d} className="text-xs" onSelect={() => void run("SHIFT_DEADLINE", { shiftDays: d })}>
                +{d} day{d === 1 ? "" : "s"}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onSelect={() => setPending({ kind: "SET_DEADLINE" })}>
              Set a date…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 bg-white" disabled={busy}>
              <Flag className="h-3.5 w-3.5" /> Priority <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.keys(TASK_PRIORITIES) as TaskPriority[]).map((p) => (
              <DropdownMenuItem key={p} className="text-xs" onSelect={() => void run("SET_PRIORITY", { priority: p })}>
                {TASK_PRIORITIES[p].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 bg-white" disabled={busy}>
              More <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="text-xs gap-1.5" onSelect={() => void run("CANCEL")}>
              <Ban className="h-3.5 w-3.5" /> Cancel tasks
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-1.5" onSelect={() => void run("RESTORE")}>
              <RotateCcw className="h-3.5 w-3.5" /> Reactivate tasks
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs gap-1.5 text-rose-700" onSelect={() => setPending({ kind: "UNASSIGN" })}>
              <UserMinus className="h-3.5 w-3.5" /> Unassign students…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
        <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 ml-auto" onClick={onClear}>
          <X className="h-3.5 w-3.5" /> Clear
        </Button>
      </div>
      <p className="text-[11px] text-slate-500 -mt-1">
        Deadline, priority and cancel apply to the whole task (every student on it). Approve / request changes apply to the selected students only.
      </p>

      <Dialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="max-w-md">
          {pending?.kind === "REQUEST_CHANGES" && (
            <>
              <DialogHeader>
                <DialogTitle>Request changes on {selectedIds.length} item(s)</DialogTitle>
                <DialogDescription>Only submitted or completed items are affected. Each student gets this feedback by email.</DialogDescription>
              </DialogHeader>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} placeholder="What needs to change?" autoFocus />
              <DialogFooter>
                <Button variant="outline" onClick={() => setPending(null)}>Cancel</Button>
                <Button disabled={!feedback.trim() || busy} onClick={() => void run("REQUEST_CHANGES", { feedback: feedback.trim() })} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Send feedback
                </Button>
              </DialogFooter>
            </>
          )}
          {pending?.kind === "SET_DEADLINE" && (
            <>
              <DialogHeader>
                <DialogTitle>Set deadline</DialogTitle>
                <DialogDescription>Applies to every task that contains a selected item. Leave empty to remove the deadline.</DialogDescription>
              </DialogHeader>
              <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} autoFocus />
              <DialogFooter>
                <Button variant="outline" onClick={() => setPending(null)}>Cancel</Button>
                <Button disabled={busy} onClick={() => void run("SET_DEADLINE", { deadline: deadline ? new Date(deadline).toISOString() : null })}>
                  {deadline ? "Set deadline" : "Remove deadline"}
                </Button>
              </DialogFooter>
            </>
          )}
          {pending?.kind === "UNASSIGN" && (
            <>
              <DialogHeader>
                <DialogTitle>Unassign {selectedIds.length} student item(s)?</DialogTitle>
                <DialogDescription>
                  Those students lose the task along with their submissions, comments and history for it. This can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPending(null)}>Keep them</Button>
                <Button disabled={busy} onClick={() => void run("UNASSIGN")} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Unassign
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
