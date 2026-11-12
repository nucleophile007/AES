export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'COMPLETED';

export const TASK_STATUSES: Record<TaskStatus, { label: string; description: string; color: string; badgeVariant: string }> = {
  TODO: {
    label: 'To Do',
    description: 'Task is waiting to be started',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    badgeVariant: 'secondary',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    description: 'Work is currently ongoing',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeVariant: 'default',
  },
  SUBMITTED: {
    label: 'Submitted for Review',
    description: 'Submitted and awaiting mentor approval',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeVariant: 'outline',
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    description: 'Mentor requested adjustments or more information',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeVariant: 'destructive',
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Task is finished and approved',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeVariant: 'secondary',
  },
};

export const TASK_PRIORITIES: Record<TaskPriority, { label: string; color: string; dotColor: string; order: number }> = {
  LOW: {
    label: 'Low',
    color: 'text-slate-600 bg-slate-100 border-slate-200',
    dotColor: 'bg-slate-400',
    order: 1,
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-sky-700 bg-sky-50 border-sky-200',
    dotColor: 'bg-sky-500',
    order: 2,
  },
  HIGH: {
    label: 'High',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    dotColor: 'bg-amber-500',
    order: 3,
  },
  URGENT: {
    label: 'Urgent',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    dotColor: 'bg-rose-600',
    order: 4,
  },
};

export const DEFAULT_TASK_CATEGORIES = [
  'College Prep',
  'Outreach',
  'Research',
  'Event Registration',
  'Form / Application',
  'Meeting / Interview',
  'Document Upload',
  'General',
] as const;

export function formatTaskKey(id: number): string {
  return `TSK-${id}`;
}

/** Statuses where the student still owes work (a submitted task is waiting on the mentor). */
export const STUDENT_OPEN_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'CHANGES_REQUESTED'];

/** Overdue = deadline passed while the student still owes work. */
export function isTaskOverdue(deadline: Date | string | null | undefined, status: string): boolean {
  if (!deadline) return false;
  if (!(STUDENT_OPEN_STATUSES as string[]).includes(status)) return false;
  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) return false;
  return deadlineDate.getTime() < Date.now();
}

export function getDeadlineLabel(deadline: Date | string | null | undefined): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!deadline) return { text: 'No deadline', isOverdue: false, isToday: false };
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return { text: 'Invalid date', isOverdue: false, isToday: false };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const startOfDeadline = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffDays = Math.round((startOfDeadline.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  const isToday = diffDays === 0;
  const isOverdue = d.getTime() < now.getTime();

  if (isOverdue) {
    if (isToday) {
      return { text: `Due today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, isOverdue: true, isToday: true };
    }
    const daysAgo = Math.abs(diffDays);
    return {
      text: daysAgo === 1 ? 'Overdue by 1 day' : `Overdue by ${daysAgo} days`,
      isOverdue: true,
      isToday: false,
    };
  }

  if (isToday) {
    return { text: `Due today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, isOverdue: false, isToday: true };
  }

  if (diffDays === 1) {
    return { text: 'Due tomorrow', isOverdue: false, isToday: false };
  }

  if (diffDays > 1 && diffDays <= 7) {
    return { text: `Due in ${diffDays} days`, isOverdue: false, isToday: false };
  }

  return {
    text: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined }),
    isOverdue: false,
    isToday: false,
  };
}


// ---------------------------------------------------------------------------
// Workflow rules (shared by API routes and UI so both enforce the same thing)
// ---------------------------------------------------------------------------

export type StudentTaskAction = 'START' | 'SAVE_DRAFT' | 'SUBMIT' | 'COMPLETE_DIRECT' | 'TOGGLE_CHECKLIST';
export type MentorReviewAction = 'APPROVE' | 'REQUEST_CHANGES' | 'REOPEN';

const STUDENT_EDITABLE: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'CHANGES_REQUESTED'];

/** Statuses from which each student action is allowed. */
export const STUDENT_ACTION_ALLOWED_FROM: Record<StudentTaskAction, TaskStatus[]> = {
  START: ['TODO'],
  SAVE_DRAFT: STUDENT_EDITABLE,
  SUBMIT: STUDENT_EDITABLE,
  COMPLETE_DIRECT: STUDENT_EDITABLE,
  TOGGLE_CHECKLIST: STUDENT_EDITABLE,
};

/** Statuses from which each mentor review action is allowed. */
export const MENTOR_ACTION_ALLOWED_FROM: Record<MentorReviewAction, TaskStatus[]> = {
  APPROVE: ['SUBMITTED'],
  REQUEST_CHANGES: ['SUBMITTED', 'COMPLETED'],
  REOPEN: ['COMPLETED'],
};

export function canStudentPerform(action: StudentTaskAction, status: string): boolean {
  return (STUDENT_ACTION_ALLOWED_FROM[action] as string[] | undefined)?.includes(status) ?? false;
}

export function canMentorPerform(action: MentorReviewAction, status: string): boolean {
  return (MENTOR_ACTION_ALLOWED_FROM[action] as string[] | undefined)?.includes(status) ?? false;
}

export interface TaskRequirementFlags {
  requireSubmissionNote: boolean;
  requireFileUpload: boolean;
  requireUrl: boolean;
  requireExternalConfirmation: boolean;
  externalConfirmationPrompt?: string | null;
  /** Every checklist step must be ticked before submitting. */
  requireChecklistComplete?: boolean;
  /** The task's checklist definition (needed to evaluate requireChecklistComplete). */
  checklist?: unknown;
}

export interface TaskSubmissionInput {
  note?: string | null;
  url?: string | null;
  fileUrl?: string | null;
  externalConfirmed?: boolean;
  /** Ids of the checklist steps this student has ticked. */
  checklistDone?: unknown;
}

/** True when the checklist rule applies: the option is on and there is at least one step. */
export function requiresChecklistCompletion(task: TaskRequirementFlags): boolean {
  return Boolean(task.requireChecklistComplete) && readChecklist(task.checklist).length > 0;
}

export function taskHasSubmissionRequirements(task: TaskRequirementFlags): boolean {
  return (
    task.requireSubmissionNote ||
    task.requireFileUpload ||
    task.requireUrl ||
    task.requireExternalConfirmation ||
    requiresChecklistCompletion(task)
  );
}

/** Checklist steps still unticked (0 when there is no checklist). */
export function countUnfinishedChecklistSteps(checklist: unknown, checklistDone: unknown): number {
  const { done, total } = getChecklistProgress(checklist, checklistDone);
  return total - done;
}

/** Human-readable list of requirements the submission does not satisfy yet. */
export function getMissingRequirements(task: TaskRequirementFlags, submission: TaskSubmissionInput): string[] {
  const missing: string[] = [];
  if (task.requireSubmissionNote && !submission.note?.trim()) {
    missing.push('a submission note / description');
  }
  if (task.requireFileUpload && !submission.fileUrl) {
    missing.push('a file or screenshot upload');
  }
  if (task.requireUrl && !submission.url?.trim()) {
    missing.push('a valid submission URL');
  }
  if (task.requireExternalConfirmation && !submission.externalConfirmed) {
    missing.push(task.externalConfirmationPrompt || 'confirmation of external action');
  }
  if (requiresChecklistCompletion(task)) {
    const left = countUnfinishedChecklistSteps(task.checklist, submission.checklistDone);
    if (left > 0) missing.push(left === 1 ? '1 unticked checklist step' : `${left} unticked checklist steps`);
  }
  return missing;
}

/** Only plain http(s) links may be stored as submission / attachment URLs. */
export function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Uploaded files must come from our own task upload storage, so students can't
 * point "proof" at an arbitrary external location.
 */
export function isTaskUploadUrl(value: unknown, publicBaseUrl: string | undefined): value is string {
  if (!isSafeHttpUrl(value) || !publicBaseUrl) return false;
  const base = publicBaseUrl.replace(/\/+$/, '');
  return value.startsWith(`${base}/tasks/`);
}

/** File types accepted by the task upload endpoint. */
export const TASK_UPLOAD_ALLOWED_TYPES: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
  'image/heic': ['heic'],
  'text/plain': ['txt'],
  'text/csv': ['csv'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
};

export function isAllowedTaskUpload(fileName: string, mimeType: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const allowedExts = TASK_UPLOAD_ALLOWED_TYPES[mimeType];
  return Boolean(allowedExts && allowedExts.includes(ext));
}

// ---------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------

export interface TaskChecklistItem {
  id: string;
  title: string;
}

export const MAX_CHECKLIST_ITEMS = 30;

function makeChecklistId(index: number): string {
  return `c${Date.now().toString(36)}${index.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Validates checklist input from a client. Keeps existing ids, assigns new ones. */
export function normalizeChecklist(input: unknown): TaskChecklistItem[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const items: TaskChecklistItem[] = [];
  input.forEach((raw, index) => {
    const title = typeof raw === 'string' ? raw : (raw as { title?: unknown })?.title;
    if (typeof title !== 'string' || !title.trim()) return;
    let id = typeof (raw as { id?: unknown })?.id === 'string' ? String((raw as { id: string }).id) : '';
    if (!/^[a-z0-9]{1,40}$/i.test(id) || seen.has(id)) id = makeChecklistId(index);
    seen.add(id);
    items.push({ id, title: title.trim().slice(0, 200) });
  });
  return items.slice(0, MAX_CHECKLIST_ITEMS);
}

/** Reads a stored checklist (Prisma Json) defensively. */
export function readChecklist(value: unknown): TaskChecklistItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is TaskChecklistItem =>
      Boolean(v) && typeof (v as TaskChecklistItem).id === 'string' && typeof (v as TaskChecklistItem).title === 'string'
  );
}

/** Reads stored checklist completion (ids), dropping ids no longer in the checklist. */
export function readChecklistDone(value: unknown, checklist: TaskChecklistItem[]): string[] {
  if (!Array.isArray(value)) return [];
  const valid = new Set(checklist.map((c) => c.id));
  return Array.from(new Set(value.filter((v): v is string => typeof v === 'string' && valid.has(v))));
}

export function getChecklistProgress(checklist: unknown, done: unknown): { done: number; total: number } {
  const items = readChecklist(checklist);
  return { done: readChecklistDone(done, items).length, total: items.length };
}

// ---------------------------------------------------------------------------
// Recurrence
// ---------------------------------------------------------------------------

export type TaskRecurrence = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export const TASK_RECURRENCES: Record<TaskRecurrence, { label: string }> = {
  WEEKLY: { label: 'Every week' },
  BIWEEKLY: { label: 'Every 2 weeks' },
  MONTHLY: { label: 'Every month' },
};

export function isTaskRecurrence(value: unknown): value is TaskRecurrence {
  return typeof value === 'string' && value in TASK_RECURRENCES;
}

/** Next deadline in a recurring series. Monthly clamps to the end of shorter months. */
export function nextOccurrenceDate(deadline: Date, recurrence: TaskRecurrence): Date {
  const next = new Date(deadline.getTime());
  if (recurrence === 'WEEKLY') next.setUTCDate(next.getUTCDate() + 7);
  else if (recurrence === 'BIWEEKLY') next.setUTCDate(next.getUTCDate() + 14);
  else {
    const day = next.getUTCDate();
    next.setUTCDate(1);
    next.setUTCMonth(next.getUTCMonth() + 1);
    const lastDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
    next.setUTCDate(Math.min(day, lastDay));
  }
  return next;
}

// ---------------------------------------------------------------------------
// Mentions
// ---------------------------------------------------------------------------

/**
 * Returns the candidates mentioned as "@Full Name" (case-insensitive). Longest
 * names are matched first so "@Ana Maria" doesn't also count as "@Ana".
 */
export function extractMentions<T extends { name: string }>(content: string, candidates: T[]): T[] {
  const lower = content.toLowerCase();
  const sorted = [...candidates].sort((a, b) => b.name.length - a.name.length);
  const found: T[] = [];
  let remaining = lower;
  for (const c of sorted) {
    const token = `@${c.name.toLowerCase()}`;
    const idx = remaining.indexOf(token);
    if (idx === -1) continue;
    const after = remaining.charAt(idx + token.length);
    if (after && /[a-z0-9]/i.test(after)) continue;
    found.push(c);
    remaining = remaining.slice(0, idx) + ' '.repeat(token.length) + remaining.slice(idx + token.length);
  }
  return found;
}

// ---------------------------------------------------------------------------
// Filters (shared by URL sync, saved filters and API query parsing)
// ---------------------------------------------------------------------------

export const TASK_FILTER_KEYS = ['search', 'status', 'priority', 'category', 'studentId', 'deadlineFilter', 'view'] as const;
export type TaskFilterKey = (typeof TASK_FILTER_KEYS)[number];
export type TaskFilters = Partial<Record<TaskFilterKey, string>>;

/** Keeps only known, non-default filter keys so saved filters / URLs stay tidy. */
export function sanitizeFilterQuery(query: string): string {
  const input = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
  const out = new URLSearchParams();
  for (const key of TASK_FILTER_KEYS) {
    const value = input.get(key)?.trim();
    if (value && value !== 'ALL') out.set(key, value.slice(0, 200));
  }
  return out.toString();
}

// ---------------------------------------------------------------------------
// Insights
// ---------------------------------------------------------------------------

/** Days in progress (or with changes requested) before a task is flagged as stuck. */
export const STUCK_AFTER_DAYS = 7;

export function isTaskStuck(
  st: { status: string; startedAt?: Date | string | null; updatedAt?: Date | string | null },
  now: Date = new Date()
): boolean {
  if (st.status !== 'IN_PROGRESS' && st.status !== 'CHANGES_REQUESTED') return false;
  const since = st.updatedAt ?? st.startedAt;
  if (!since) return false;
  const t = new Date(since).getTime();
  if (Number.isNaN(t)) return false;
  return now.getTime() - t > STUCK_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

export interface InsightInput {
  studentId: number;
  studentName: string;
  status: string;
  deadline: Date | string | null;
  submittedAt: Date | string | null;
  completedAt: Date | string | null;
  reviewedAt: Date | string | null;
  startedAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface StudentInsight {
  studentId: number;
  studentName: string;
  total: number;
  completed: number;
  completionRate: number; // 0..1
  onTimeRate: number | null; // of completed tasks that had a deadline
  overdue: number;
  stuck: number;
  pendingReview: number;
}

export function computeStudentInsights(rows: InsightInput[], now: Date = new Date()): StudentInsight[] {
  const byStudent = new Map<number, InsightInput[]>();
  rows.forEach((r) => byStudent.set(r.studentId, [...(byStudent.get(r.studentId) ?? []), r]));

  return Array.from(byStudent.entries())
    .map(([studentId, items]) => {
      const completed = items.filter((i) => i.status === 'COMPLETED');
      const completedWithDeadline = completed.filter((i) => i.deadline);
      const onTime = completedWithDeadline.filter((i) => {
        const finished = i.submittedAt ?? i.completedAt;
        return finished && new Date(finished).getTime() <= new Date(i.deadline as string | Date).getTime();
      });
      return {
        studentId,
        studentName: items[0].studentName,
        total: items.length,
        completed: completed.length,
        completionRate: items.length ? completed.length / items.length : 0,
        onTimeRate: completedWithDeadline.length ? onTime.length / completedWithDeadline.length : null,
        overdue: items.filter((i) => isTaskOverdue(i.deadline, i.status)).length,
        stuck: items.filter((i) => isTaskStuck(i, now)).length,
        pendingReview: items.filter((i) => i.status === 'SUBMITTED').length,
      };
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
}

/** Average hours between submission and mentor review, for reviewed submissions. */
export function averageReviewHours(rows: Pick<InsightInput, 'submittedAt' | 'reviewedAt'>[]): number | null {
  const durations = rows
    .filter((r) => r.submittedAt && r.reviewedAt)
    .map((r) => new Date(r.reviewedAt as string).getTime() - new Date(r.submittedAt as string).getTime())
    .filter((ms) => ms >= 0);
  if (!durations.length) return null;
  return durations.reduce((a, b) => a + b, 0) / durations.length / 3_600_000;
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s = value instanceof Date ? value.toISOString() : String(value);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
}
