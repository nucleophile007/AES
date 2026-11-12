"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TASK_PRIORITIES, TASK_RECURRENCES, type TaskPriority, type TaskRecurrence } from "@/lib/tasks";
import { LayoutTemplate, ListChecks, Repeat, Trash2 } from "lucide-react";
import { taskApi } from "@/components/tasks/api";
import type { TaskTemplateRecord } from "./TaskFormDialog";

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: TaskTemplateRecord[];
  onUse: (template: TaskTemplateRecord) => void;
  onChanged: () => void;
}

export function TemplatesDialog({ open, onOpenChange, templates, onUse, onChanged }: TemplatesDialogProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState<number | null>(null);

  const remove = async (t: TaskTemplateRecord) => {
    if (!window.confirm(`Delete the template “${t.name}”? Tasks already created from it are not affected.`)) return;
    setDeleting(t.id);
    try {
      await taskApi(`/api/teacher/tasks/templates/${t.id}`, { method: "DELETE" });
      toast({ title: "Template deleted" });
      onChanged();
    } catch (err) {
      toast({ title: "Couldn't delete template", description: (err as Error).message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-indigo-600" /> Task templates
          </DialogTitle>
          <DialogDescription>
            Reuse common tasks. To create or update one, tick “Also save as a template” when creating a task (same name overwrites).
          </DialogDescription>
        </DialogHeader>
        {templates.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No templates yet.</p>
        ) : (
          <ul className="divide-y border rounded-lg">
            {templates.map((t) => {
              const items = Array.isArray(t.checklist) ? t.checklist.length : 0;
              return (
                <li key={t.id} className="p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-600 truncate">{t.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-500">
                      <span className="px-1.5 rounded bg-slate-100">{t.category}</span>
                      <span>{TASK_PRIORITIES[t.priority as TaskPriority]?.label ?? t.priority}</span>
                      {t.defaultDeadlineDays !== null && <span>· due {t.defaultDeadlineDays}d after creation</span>}
                      {items > 0 && (
                        <span className="flex items-center gap-0.5">
                          · <ListChecks className="h-3 w-3" /> {items} steps
                        </span>
                      )}
                      {t.recurrence && (
                        <span className="flex items-center gap-0.5">
                          · <Repeat className="h-3 w-3" /> {TASK_RECURRENCES[t.recurrence as TaskRecurrence]?.label}
                        </span>
                      )}
                      <span>· used {t.usageCount}×</span>
                    </div>
                  </div>
                  <Button size="sm" className="h-8 text-xs" onClick={() => onUse(t)}>
                    Use
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600" disabled={deleting === t.id} onClick={() => void remove(t)} aria-label={`Delete template ${t.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
