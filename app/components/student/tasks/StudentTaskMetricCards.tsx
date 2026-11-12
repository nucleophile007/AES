"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, CheckCircle2, Circle, Clock, ShieldAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskFilters } from "@/lib/tasks";
import type { StudentTaskMetrics } from "./studentTaskApi";

interface MetricDef {
  key: keyof StudentTaskMetrics;
  label: string;
  icon: LucideIcon;
  /** Filters applied when the card is clicked. */
  filter: TaskFilters;
  border: string;
  text: string;
  value: string;
  ring: string;
  pulse?: boolean;
}

const METRICS: MetricDef[] = [
  {
    key: "todo",
    label: "To do",
    icon: Circle,
    filter: { status: "TODO", deadlineFilter: "ALL" },
    border: "border-l-slate-500",
    text: "text-slate-600",
    value: "text-slate-900",
    ring: "ring-slate-500/20 bg-slate-50/60",
  },
  {
    key: "inProgress",
    label: "In progress",
    icon: Clock,
    filter: { status: "IN_PROGRESS", deadlineFilter: "ALL" },
    border: "border-l-blue-500",
    text: "text-blue-700",
    value: "text-blue-900",
    ring: "ring-blue-500/20 bg-blue-50/50",
  },
  {
    key: "submitted",
    label: "Awaiting review",
    icon: ShieldAlert,
    filter: { status: "SUBMITTED", deadlineFilter: "ALL" },
    border: "border-l-amber-500",
    text: "text-amber-700",
    value: "text-amber-900",
    ring: "ring-amber-500/20 bg-amber-50/50",
  },
  {
    key: "changesRequested",
    label: "Changes requested",
    icon: AlertTriangle,
    filter: { status: "CHANGES_REQUESTED", deadlineFilter: "ALL" },
    border: "border-l-rose-500",
    text: "text-rose-700",
    value: "text-rose-900",
    ring: "ring-rose-500/20 bg-rose-50/50",
    pulse: true,
  },
  {
    key: "overdue",
    label: "Overdue",
    icon: AlertCircle,
    filter: { status: "ALL", deadlineFilter: "overdue" },
    border: "border-l-rose-700",
    text: "text-rose-800",
    value: "text-rose-950",
    ring: "ring-rose-700/20 bg-rose-50/60",
    pulse: true,
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    filter: { status: "COMPLETED", deadlineFilter: "ALL" },
    border: "border-l-emerald-500",
    text: "text-emerald-700",
    value: "text-emerald-900",
    ring: "ring-emerald-500/20 bg-emerald-50/50",
  },
];

interface StudentTaskMetricCardsProps {
  metrics: StudentTaskMetrics;
  filters: TaskFilters;
  onApply: (patch: TaskFilters) => void;
  /** Show placeholders instead of zeros until the first response arrives. */
  loading?: boolean;
}

/** Clickable summary cards; clicking an active card clears its filter. */
export function StudentTaskMetricCards({ metrics, filters, onApply, loading }: StudentTaskMetricCardsProps) {
  const isActive = (m: MetricDef) =>
    (m.filter.status ?? "ALL") === (filters.status ?? "ALL") &&
    (m.filter.deadlineFilter ?? "ALL") === (filters.deadlineFilter ?? "ALL");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {METRICS.map((m) => {
        const active = isActive(m);
        const count = metrics[m.key];
        const Icon = m.icon;
        return (
          <Card
            key={m.key}
            role="button"
            tabIndex={0}
            aria-pressed={active}
            onClick={() => onApply(active ? { status: "ALL", deadlineFilter: "ALL" } : m.filter)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onApply(active ? { status: "ALL", deadlineFilter: "ALL" } : m.filter);
              }
            }}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md border-l-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              m.border,
              active && cn("ring-2", m.ring)
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-xs font-medium flex items-center gap-1.5", m.text)}>
                  {m.label}
                  {m.pulse && count > 0 && <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
                </span>
                <Icon className={cn("h-4 w-4 shrink-0", m.text)} />
              </div>
              <div className="mt-2">
                {loading ? (
                  <span className="inline-block h-7 w-10 rounded bg-slate-200 animate-pulse" aria-label="Loading" />
                ) : (
                  <span className={cn("text-2xl font-bold", m.value)}>{count}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
