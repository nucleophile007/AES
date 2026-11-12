"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_RECURRENCES,
  type TaskChecklistItem,
  type TaskPriority,
} from "@/lib/tasks";
import { CheckSquare, Link2, ListChecks, Loader2, Repeat, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { taskApi } from "@/components/tasks/api";
import { ChecklistEditor } from "@/components/tasks/Checklist";
import type { TaskItem, TaskRecordBase } from "@/components/tasks/types";

export interface MentorStudent {
  id: number;
  name: string;
  email: string;
  grade?: string | null;
  program?: string | null;
}

export interface MentorGroup {
  id: number;
  name: string;
  studentIds: number[];
}

export interface TaskTemplateRecord {
  id: number;
  name: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  defaultDeadlineDays: number | null;
  requireSubmissionNote: boolean;
  requireFileUpload: boolean;
  requireUrl: boolean;
  requireExternalConfirmation: boolean;
  externalConfirmationPrompt: string | null;
  requireMentorApproval: boolean;
  requireChecklistComplete?: boolean;
  checklist: TaskChecklistItem[] | null;
  recurrence: string | null;
  usageCount: number;
}

interface LinkOptions {
  assignments: { id: number; title: string; dueDate: string }[];
  resources: { id: number; title: string; type: string }[];
  meetings: { id: number; title: string; startDateTime: string }[];
}

export type TaskFormMode =
  | { kind: "create"; template?: TaskTemplateRecord | null; presetStudentIds?: number[]; duplicateOf?: TaskRecordBase }
  | { kind: "edit"; task: TaskRecordBase; assignedStudentIds: number[] };

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TaskFormMode;
  students: MentorStudent[];
  groups: MentorGroup[];
  categories: string[];
  templates: TaskTemplateRecord[];
  /** `created` is passed after creating a task so the board can show it before reloading. */
  onSaved: (created?: { task: TaskRecordBase; items: Omit<TaskItem, "task">[] }) => void;
}

/** "YYYY-MM-DDTHH:mm" in local time, for <input type="datetime-local">. */
function toLocalInput(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function deadlineFromDays(days: number | null): string {
  if (days === null || days === undefined) return "";
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(17, 0, 0, 0);
  return toLocalInput(d);
}

const toIso = (local: string) => (local ? new Date(local).toISOString() : null);

interface FormState {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  deadline: string;
  requireSubmissionNote: boolean;
  requireFileUpload: boolean;
  requireUrl: boolean;
  requireExternalConfirmation: boolean;
  externalConfirmationPrompt: string;
  requireMentorApproval: boolean;
  requireChecklistComplete: boolean;
  checklist: TaskChecklistItem[];
  recurrence: string;
  recurrenceEndsAt: string;
  linkedAssignmentId: string;
  linkedResourceId: string;
  linkedMeetingId: string;
}

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    category: "General",
    priority: "MEDIUM",
    deadline: "",
    requireSubmissionNote: false,
    requireFileUpload: false,
    requireUrl: false,
    requireExternalConfirmation: false,
    externalConfirmationPrompt: "",
    requireMentorApproval: true,
    requireChecklistComplete: true,
    checklist: [],
    recurrence: "NONE",
    recurrenceEndsAt: "",
    linkedAssignmentId: "NONE",
    linkedResourceId: "NONE",
    linkedMeetingId: "NONE",
  };
}

function formFromTask(t: TaskRecordBase, keepDeadline: boolean): FormState {
  return {
    title: t.title,
    description: t.description,
    category: t.category,
    priority: t.priority,
    deadline: keepDeadline ? toLocalInput(t.deadline) : "",
    requireSubmissionNote: t.requireSubmissionNote,
    requireFileUpload: t.requireFileUpload,
    requireUrl: t.requireUrl,
    requireExternalConfirmation: t.requireExternalConfirmation,
    externalConfirmationPrompt: t.externalConfirmationPrompt ?? "",
    requireMentorApproval: t.requireMentorApproval,
    requireChecklistComplete: Boolean(t.requireChecklistComplete),
    checklist: Array.isArray(t.checklist) ? t.checklist : [],
    recurrence: t.recurrence ?? "NONE",
    recurrenceEndsAt: toLocalInput(t.recurrenceEndsAt),
    linkedAssignmentId: t.linkedAssignmentId ? String(t.linkedAssignmentId) : "NONE",
    linkedResourceId: t.linkedResourceId ? String(t.linkedResourceId) : "NONE",
    linkedMeetingId: t.linkedMeetingId ? String(t.linkedMeetingId) : "NONE",
  };
}

function formFromTemplate(t: TaskTemplateRecord): FormState {
  return {
    ...emptyForm(),
    title: t.title,
    description: t.description,
    category: t.category,
    priority: (t.priority as TaskPriority) || "MEDIUM",
    deadline: deadlineFromDays(t.defaultDeadlineDays),
    requireSubmissionNote: t.requireSubmissionNote,
    requireFileUpload: t.requireFileUpload,
    requireUrl: t.requireUrl,
    requireExternalConfirmation: t.requireExternalConfirmation,
    externalConfirmationPrompt: t.externalConfirmationPrompt ?? "",
    requireMentorApproval: t.requireMentorApproval,
    requireChecklistComplete: t.requireChecklistComplete ?? true,
    checklist: Array.isArray(t.checklist) ? t.checklist : [],
    recurrence: t.recurrence ?? "NONE",
  };
}

export function TaskFormDialog({ open, onOpenChange, mode, students, groups, categories, templates, onSaved }: TaskFormDialogProps) {
  const { toast } = useToast();
  const isEdit = mode.kind === "edit";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [templateId, setTemplateId] = useState<string>("NONE");
  const [studentIds, setStudentIds] = useState<Set<number>>(new Set());
  const [groupIds, setGroupIds] = useState<Set<number>>(new Set());
  const [studentQuery, setStudentQuery] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [linkOptions, setLinkOptions] = useState<LinkOptions | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset whenever the dialog opens for a new purpose.
  useEffect(() => {
    if (!open) return;
    setStudentQuery("");
    setCustomCategory("");
    setSaveAsTemplate(false);
    setTemplateName("");
    setGroupIds(new Set());
    if (mode.kind === "edit") {
      setForm(formFromTask(mode.task, true));
      setTemplateId("NONE");
      setStudentIds(new Set());
    } else {
      if (mode.template) {
        setForm(formFromTemplate(mode.template));
        setTemplateId(String(mode.template.id));
      } else if (mode.duplicateOf) {
        setForm({ ...formFromTask(mode.duplicateOf, false), title: `${mode.duplicateOf.title} (copy)` });
        setTemplateId("NONE");
      } else {
        setForm(emptyForm());
        setTemplateId("NONE");
      }
      setStudentIds(new Set(mode.presetStudentIds ?? []));
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open || linkOptions) return;
    taskApi<LinkOptions>("/api/teacher/tasks/link-options")
      .then(setLinkOptions)
      .catch(() => setLinkOptions({ assignments: [], resources: [], meetings: [] }));
  }, [open, linkOptions]);

  const allCategories = useMemo(
    () => Array.from(new Set([...DEFAULT_TASK_CATEGORIES, ...categories, form.category].filter(Boolean))),
    [categories, form.category]
  );

  const alreadyAssigned = useMemo(
    () => new Set(mode.kind === "edit" ? mode.assignedStudentIds : []),
    [mode]
  );

  const studentsFromGroups = useMemo(() => {
    const ids = new Set<number>();
    groups.filter((g) => groupIds.has(g.id)).forEach((g) => g.studentIds.forEach((id) => ids.add(id)));
    return ids;
  }, [groups, groupIds]);

  const effectiveNewStudents = useMemo(() => {
    const ids = new Set<number>([...studentIds, ...studentsFromGroups]);
    alreadyAssigned.forEach((id) => ids.delete(id));
    return ids;
  }, [studentIds, studentsFromGroups, alreadyAssigned]);

  const filteredStudents = students.filter((s) => {
    const q = studentQuery.trim().toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const tpl = templates.find((t) => String(t.id) === id);
    if (tpl) setForm(formFromTemplate(tpl));
  };

  const toggleId = (setter: React.Dispatch<React.SetStateAction<Set<number>>>, id: number, on: boolean) =>
    setter((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const submit = async () => {
    const category = form.category === "__custom" ? customCategory.trim() : form.category;
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: "Missing details", description: "Title and description are required.", variant: "destructive" });
      return;
    }
    if (!isEdit && effectiveNewStudents.size === 0) {
      toast({ title: "No students selected", description: "Pick at least one student or group.", variant: "destructive" });
      return;
    }
    if (form.recurrence !== "NONE" && !form.deadline) {
      toast({ title: "Deadline needed", description: "Recurring tasks repeat from their deadline.", variant: "destructive" });
      return;
    }
    if (saveAsTemplate && !templateName.trim()) {
      toast({ title: "Template name needed", description: "Name the template or untick “Save as template”.", variant: "destructive" });
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: category || "General",
      priority: form.priority,
      deadline: toIso(form.deadline),
      requireSubmissionNote: form.requireSubmissionNote,
      requireFileUpload: form.requireFileUpload,
      requireUrl: form.requireUrl,
      requireExternalConfirmation: form.requireExternalConfirmation,
      externalConfirmationPrompt: form.requireExternalConfirmation ? form.externalConfirmationPrompt : null,
      requireMentorApproval: form.requireMentorApproval,
      requireChecklistComplete: form.requireChecklistComplete,
      checklist: form.checklist.filter((c) => c.title.trim()),
      recurrence: form.recurrence === "NONE" ? null : form.recurrence,
      recurrenceEndsAt: form.recurrence === "NONE" ? null : toIso(form.recurrenceEndsAt),
      linkedAssignmentId: form.linkedAssignmentId === "NONE" ? null : Number(form.linkedAssignmentId),
      linkedResourceId: form.linkedResourceId === "NONE" ? null : Number(form.linkedResourceId),
      linkedMeetingId: form.linkedMeetingId === "NONE" ? null : Number(form.linkedMeetingId),
    };

    setSaving(true);
    try {
      if (mode.kind === "edit") {
        const res = await taskApi<{ addedStudents: number }>(`/api/teacher/tasks/${mode.task.id}`, {
          method: "PATCH",
          json: {
            ...payload,
            assignStudentIds: Array.from(studentIds).filter((id) => !alreadyAssigned.has(id)),
            assignGroupIds: Array.from(groupIds),
          },
        });
        toast({
          title: "Task updated",
          description: res.addedStudents ? `Also assigned to ${res.addedStudents} more student(s).` : undefined,
        });
      } else {
        const res = await taskApi<{ assignedCount: number; task: TaskRecordBase; items: Omit<TaskItem, "task">[] }>("/api/teacher/tasks", {
          method: "POST",
          json: {
            ...payload,
            studentIds: Array.from(studentIds),
            groupIds: Array.from(groupIds),
            templateId: templateId === "NONE" ? null : Number(templateId),
            saveAsTemplateName: saveAsTemplate ? templateName.trim() : null,
          },
        });
        toast({
          title: "Task created",
          description: `Assigned to ${res.assignedCount} student${res.assignedCount === 1 ? "" : "s"}.${saveAsTemplate ? " Saved as a template." : ""}`,
        });
        onOpenChange(false);
        onSaved({ task: res.task, items: res.items });
        return;
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast({ title: "Couldn't save task", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const section = "space-y-2 rounded-lg border bg-slate-50/60 p-3";
  const sectionTitle = "text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="p-1.5 rounded bg-indigo-50 text-indigo-600">
              <CheckSquare className="h-5 w-5" />
            </span>
            {isEdit ? "Edit task" : "Create task"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changes apply to every student on this task. Students already assigned stay assigned."
              : "Assign an action item to students or whole groups, with optional checklist, proof requirements and recurrence."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isEdit && templates.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 p-2.5">
              <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="text-xs font-medium text-indigo-900 shrink-0">Start from a template</span>
              <Select value={templateId} onValueChange={applyTemplate}>
                <SelectTrigger className="h-8 text-xs bg-white">
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Blank task</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                      {t.usageCount ? ` · used ${t.usageCount}×` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Register for the October SAT" maxLength={200} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="What should the student do, and what does done look like?" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom">Custom…</SelectItem>
                </SelectContent>
              </Select>
              {form.category === "__custom" && (
                <Input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Category name" className="h-8 text-sm" maxLength={100} />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v as TaskPriority)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TASK_PRIORITIES) as TaskPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITIES[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-deadline">Deadline</Label>
              <Input id="task-deadline" type="datetime-local" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="h-9 text-sm" />
            </div>
          </div>

          {/* Assignees */}
          <div className={section}>
            <p className={sectionTitle}>
              <Users className="h-3.5 w-3.5" /> {isEdit ? "Assign more students" : "Assign to"}
              <span className="ml-auto normal-case font-medium text-slate-500 tracking-normal">
                {isEdit
                  ? `${alreadyAssigned.size} assigned${effectiveNewStudents.size ? ` · +${effectiveNewStudents.size} new` : ""}`
                  : `${effectiveNewStudents.size} selected`}
              </span>
            </p>
            {groups.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {groups.map((g) => {
                  const on = groupIds.has(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleId(setGroupIds, g.id, !on)}
                      className={cn(
                        "px-2.5 py-1 rounded-full border text-xs transition-colors",
                        on ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 hover:bg-slate-100"
                      )}
                      aria-pressed={on}
                    >
                      {g.name} <span className={on ? "text-indigo-200" : "text-slate-400"}>({g.studentIds.length})</span>
                    </button>
                  );
                })}
              </div>
            )}
            <Input value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} placeholder="Search students…" className="h-8 text-sm bg-white" />
            <div className="max-h-44 overflow-y-auto rounded border bg-white divide-y">
              {filteredStudents.length === 0 && <p className="p-3 text-xs text-slate-500">No students match.</p>}
              {filteredStudents.map((s) => {
                const assigned = alreadyAssigned.has(s.id);
                const viaGroup = studentsFromGroups.has(s.id);
                return (
                  <label key={s.id} className={cn("flex items-center gap-2 px-3 py-1.5 text-sm", assigned ? "opacity-60" : "cursor-pointer hover:bg-slate-50")}>
                    <Checkbox
                      checked={assigned || viaGroup || studentIds.has(s.id)}
                      disabled={assigned || viaGroup}
                      onCheckedChange={(v) => toggleId(setStudentIds, s.id, v === true)}
                    />
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className="text-xs text-slate-400 truncate">{s.grade ? `${s.grade} · ` : ""}{s.email}</span>
                    {assigned && <span className="ml-auto text-[10px] text-slate-500">already assigned</span>}
                    {!assigned && viaGroup && <span className="ml-auto text-[10px] text-indigo-500">via group</span>}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Checklist */}
          <div className={section}>
            <p className={sectionTitle}>
              <ListChecks className="h-3.5 w-3.5" /> Checklist <span className="normal-case font-normal tracking-normal text-slate-400">(optional — each student ticks their own)</span>
            </p>
            <ChecklistEditor items={form.checklist} onChange={(items) => set("checklist", items)} />
            {form.checklist.some((c) => c.title.trim()) && (
              <label className="flex items-start gap-2 text-sm cursor-pointer pt-1">
                <Checkbox
                  checked={form.requireChecklistComplete}
                  onCheckedChange={(v) => set("requireChecklistComplete", v === true)}
                  className="mt-0.5"
                />
                <span>
                  Students must tick every step before submitting
                  <span className="block text-xs text-slate-500">
                    {form.requireChecklistComplete
                      ? "Submit stays locked until all steps are ticked."
                      : "Steps are a guide only. You'll be warned at review if any are left unticked."}
                  </span>
                </span>
              </label>
            )}
          </div>

          {/* Requirements */}
          <div className={section}>
            <p className={sectionTitle}>Completion requirements</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  ["requireSubmissionNote", "Written note / summary"],
                  ["requireFileUpload", "File or screenshot upload"],
                  ["requireUrl", "Link (URL)"],
                  ["requireExternalConfirmation", "Confirm an external action"],
                  ["requireMentorApproval", "Needs my approval to complete"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={form[key]} onCheckedChange={(v) => set(key, v === true)} />
                  {label}
                </label>
              ))}
            </div>
            {form.requireExternalConfirmation && (
              <Input
                value={form.externalConfirmationPrompt}
                onChange={(e) => set("externalConfirmationPrompt", e.target.value)}
                placeholder="What should they confirm? e.g. “I submitted the Common App”"
                className="h-8 text-sm bg-white"
                maxLength={1000}
              />
            )}
          </div>

          {/* Recurrence */}
          <div className={section}>
            <p className={sectionTitle}>
              <Repeat className="h-3.5 w-3.5" /> Repeat
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={form.recurrence} onValueChange={(v) => set("recurrence", v)}>
                <SelectTrigger className="h-9 text-sm bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Doesn&apos;t repeat</SelectItem>
                  {Object.entries(TASK_RECURRENCES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.recurrence !== "NONE" && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="rec-end" className="text-xs shrink-0">
                    Until
                  </Label>
                  <Input id="rec-end" type="datetime-local" value={form.recurrenceEndsAt} onChange={(e) => set("recurrenceEndsAt", e.target.value)} className="h-9 text-sm bg-white" />
                </div>
              )}
            </div>
            {form.recurrence !== "NONE" && (
              <p className="text-xs text-slate-500">
                The next copy is created for the same students a day before each deadline{form.recurrenceEndsAt ? ", until the end date" : ""}.
              </p>
            )}
          </div>

          {/* Links */}
          <div className={section}>
            <p className={sectionTitle}>
              <Link2 className="h-3.5 w-3.5" /> Link to existing work <span className="normal-case font-normal tracking-normal text-slate-400">(optional)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  ["linkedAssignmentId", "Assignment", linkOptions?.assignments ?? []],
                  ["linkedResourceId", "Resource", linkOptions?.resources ?? []],
                  ["linkedMeetingId", "Meeting", linkOptions?.meetings ?? []],
                ] as const
              ).map(([key, label, options]) => (
                <Select key={key} value={form[key]} onValueChange={(v) => set(key, v)}>
                  <SelectTrigger className="h-9 text-xs bg-white" aria-label={`Linked ${label.toLowerCase()}`}>
                    <SelectValue placeholder={label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No {label.toLowerCase()}</SelectItem>
                    {options.map((o: { id: number; title: string }) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          </div>

          {!isEdit && (
            <label className="flex flex-wrap items-center gap-2 text-sm">
              <Checkbox checked={saveAsTemplate} onCheckedChange={(v) => setSaveAsTemplate(v === true)} />
              Also save as a template
              {saveAsTemplate && (
                <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name" className="h-8 text-sm max-w-xs" maxLength={100} />
              )}
            </label>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : `Create & assign${effectiveNewStudents.size ? ` (${effectiveNewStudents.size})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
