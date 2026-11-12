"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ListChecks, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskChecklistItem } from "@/lib/tasks";

interface ChecklistViewProps {
  items: TaskChecklistItem[];
  done: string[];
  /** When provided the boxes are interactive. */
  onToggle?: (itemId: string, done: boolean) => void;
  busyItemId?: string | null;
}

export function ChecklistView({ items, done, onToggle, busyItemId }: ChecklistViewProps) {
  if (!items.length) return null;
  const doneSet = new Set(done);
  const count = items.filter((i) => doneSet.has(i.id)).length;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5" /> Checklist
        </span>
        <span className="text-slate-500 font-medium">
          {count}/{items.length} done
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", count === items.length ? "bg-emerald-500" : "bg-indigo-500")}
          style={{ width: `${(count / items.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-1">
        {items.map((item) => {
          const checked = doneSet.has(item.id);
          return (
            <li key={item.id} className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
              <Checkbox
                id={`chk-${item.id}`}
                checked={checked}
                disabled={!onToggle || busyItemId === item.id}
                onCheckedChange={(v) => onToggle?.(item.id, v === true)}
                className="mt-0.5"
              />
              <label
                htmlFor={`chk-${item.id}`}
                className={cn("text-sm leading-snug", checked ? "line-through text-slate-400" : "text-slate-800", onToggle && "cursor-pointer")}
              >
                {item.title}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface ChecklistEditorProps {
  items: TaskChecklistItem[];
  onChange: (items: TaskChecklistItem[]) => void;
}

/** Editor for the task form. New items get a temporary id; the server assigns stable ones. */
export function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const title = draft.trim();
    if (!title) return;
    onChange([...items, { id: `new${Date.now().toString(36)}${items.length}`, title }]);
    setDraft("");
  };
  const move = (index: number, delta: number) => {
    const next = [...items];
    const [it] = next.splice(index, 1);
    next.splice(index + delta, 0, it);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1.5">
          <span className="w-5 text-right text-xs text-slate-400">{index + 1}.</span>
          <Input
            value={item.title}
            onChange={(e) => onChange(items.map((i) => (i.id === item.id ? { ...i, title: e.target.value } : i)))}
            className="h-8 text-sm"
            aria-label={`Checklist step ${index + 1}`}
          />
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move down">
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600" onClick={() => onChange(items.filter((i) => i.id !== item.id))} aria-label="Remove step">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a step, e.g. “Draft personal statement”"
          className="h-8 text-sm"
          maxLength={200}
        />
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs shrink-0" onClick={add} disabled={!draft.trim()}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
    </div>
  );
}
