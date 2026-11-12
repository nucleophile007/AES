"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Bookmark, BookmarkPlus, Calendar, Filter, Search, ShieldAlert, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { taskApi } from "./api";
import type { useTaskFilters } from "./hooks";

type FilterState = ReturnType<typeof useTaskFilters>;

interface SavedFilter {
  id: number;
  name: string;
  query: string;
}

interface TaskFilterBarProps {
  f: FilterState;
  categories: string[];
  students?: { id: number; name: string; grade?: string | null }[];
  overdueCount?: number;
  reviewCount?: number;
  perspective: "mentor" | "student";
}

export function TaskFilterBar({ f, categories, students, overdueCount = 0, reviewCount = 0, perspective }: TaskFilterBarProps) {
  const { toast } = useToast();
  const [saved, setSaved] = useState<SavedFilter[]>([]);
  const [savingName, setSavingName] = useState<string | null>(null);

  const loadSaved = useCallback(async () => {
    try {
      const data = await taskApi<{ filters: SavedFilter[] }>("/api/tasks/saved-filters");
      setSaved(data.filters);
    } catch {
      // Saved filters are optional; ignore load failures.
    }
  }, []);
  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const currentQuery = (() => {
    const p = new URLSearchParams(f.apiQuery);
    if (f.view) p.set("view", f.view);
    return p.toString();
  })();

  const saveCurrent = async () => {
    if (!savingName?.trim()) return;
    try {
      await taskApi("/api/tasks/saved-filters", { method: "POST", json: { name: savingName.trim(), query: currentQuery } });
      toast({ title: "Filter saved", description: `"${savingName.trim()}" is in your saved filters.` });
      setSavingName(null);
      void loadSaved();
    } catch (err) {
      toast({ title: "Couldn't save filter", description: (err as Error).message, variant: "destructive" });
    }
  };

  const deleteSaved = async (id: number) => {
    try {
      await taskApi(`/api/tasks/saved-filters?id=${id}`, { method: "DELETE" });
      setSaved((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      toast({ title: "Couldn't delete filter", description: (err as Error).message, variant: "destructive" });
    }
  };

  const chip = (active: boolean, tone: "rose" | "blue" | "amber" | "slate") =>
    cn(
      "px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1.5",
      active
        ? {
            rose: "bg-rose-100 text-rose-800 border-rose-300 font-medium",
            blue: "bg-blue-100 text-blue-800 border-blue-300 font-medium",
            amber: "bg-amber-100 text-amber-800 border-amber-300 font-medium",
            slate: "bg-slate-200 text-slate-800 border-slate-300 font-medium",
          }[tone]
        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
    );

  const toggle = (key: "deadlineFilter" | "status", value: string) =>
    f.setFilter(key, f.filters[key] === value ? "ALL" : value);

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
      <div className="flex flex-col md:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder={
              perspective === "mentor"
                ? "Search title, description, student, or TSK-123…"
                : "Search title, description, mentor, or TSK-123…"
            }
            value={f.searchInput}
            onChange={(e) => f.setSearchInput(e.target.value)}
            className="pl-9 bg-white h-9 text-sm"
            aria-label="Search tasks"
          />
        </div>

        {students && (
          <div className="w-full md:w-48">
            <Select value={f.filters.studentId ?? "ALL"} onValueChange={(v) => f.setFilter("studentId", v)}>
              <SelectTrigger className="bg-white h-9 text-xs" aria-label="Filter by student">
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Students</SelectItem>
                {students.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                    {s.grade ? ` (${s.grade})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="w-full md:w-44">
          <Select value={f.filters.category ?? "ALL"} onValueChange={(v) => f.setFilter("category", v)}>
            <SelectTrigger className="bg-white h-9 text-xs" aria-label="Filter by category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-36">
          <Select value={f.filters.priority ?? "ALL"} onValueChange={(v) => f.setFilter("priority", v)}>
            <SelectTrigger className="bg-white h-9 text-xs" aria-label="Filter by priority">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs bg-white shrink-0">
              <Bookmark className="h-3.5 w-3.5" /> Saved
              {saved.length > 0 && <span className="text-slate-400">({saved.length})</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-xs">Saved filters</DropdownMenuLabel>
            {saved.length === 0 && <p className="px-2 py-1.5 text-xs text-slate-500">No saved filters yet.</p>}
            {saved.map((s) => (
              <DropdownMenuItem key={s.id} className="flex items-center justify-between gap-2 text-xs" onSelect={() => f.applyQuery(s.query)}>
                <span className="truncate">{s.name}</span>
                <button
                  type="button"
                  aria-label={`Delete saved filter ${s.name}`}
                  className="text-slate-400 hover:text-rose-600 p-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    void deleteSaved(s.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!f.hasActiveFilters}
              className="text-xs gap-1.5"
              onSelect={(e) => {
                e.preventDefault();
                setSavingName("");
              }}
            >
              <BookmarkPlus className="h-3.5 w-3.5" /> Save current filters…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {f.hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={f.resetFilters} className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-800 shrink-0">
            Reset
          </Button>
        )}
      </div>

      {savingName !== null && (
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void saveCurrent();
          }}
        >
          <Input
            autoFocus
            value={savingName}
            onChange={(e) => setSavingName(e.target.value)}
            placeholder="Name this filter, e.g. “Urgent outreach”"
            className="h-8 text-xs bg-white max-w-xs"
            maxLength={60}
          />
          <Button type="submit" size="sm" className="h-8 text-xs" disabled={!savingName.trim()}>
            Save
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => setSavingName(null)} aria-label="Cancel">
            <X className="h-3.5 w-3.5" />
          </Button>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
          <Filter className="h-3 w-3" /> Quick filters:
        </span>
        <button type="button" onClick={() => toggle("deadlineFilter", "overdue")} className={chip(f.filters.deadlineFilter === "overdue", "rose")}>
          <AlertCircle className="h-3 w-3 text-rose-500" /> Overdue
          {overdueCount > 0 && <span className="px-1.5 rounded-full text-[10px] bg-rose-600 text-white font-bold">{overdueCount}</span>}
        </button>
        <button type="button" onClick={() => toggle("deadlineFilter", "today")} className={chip(f.filters.deadlineFilter === "today", "blue")}>
          <Calendar className="h-3 w-3 text-blue-500" /> Due today
        </button>
        <button type="button" onClick={() => toggle("deadlineFilter", "week")} className={chip(f.filters.deadlineFilter === "week", "blue")}>
          Due this week
        </button>
        <button type="button" onClick={() => toggle("status", "SUBMITTED")} className={chip(f.filters.status === "SUBMITTED", "amber")}>
          <ShieldAlert className="h-3 w-3 text-amber-500" />
          {perspective === "mentor" ? "Needs my review" : "Awaiting review"}
          {reviewCount > 0 && <span className="px-1.5 rounded-full text-[10px] bg-amber-600 text-white font-bold">{reviewCount}</span>}
        </button>
        <button type="button" onClick={() => toggle("status", "CHANGES_REQUESTED")} className={chip(f.filters.status === "CHANGES_REQUESTED", "rose")}>
          Changes requested
        </button>
        <button type="button" onClick={() => toggle("deadlineFilter", "none")} className={chip(f.filters.deadlineFilter === "none", "slate")}>
          No deadline
        </button>
      </div>
    </div>
  );
}
