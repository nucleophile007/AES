import type { Prisma } from '../generated/prisma';
import { prisma } from './prisma';
import { getPusherServer } from './pusher-server';
import {
  isTaskRecurrence,
  nextOccurrenceDate,
  normalizeChecklist,
  readChecklist,
  type TaskRecurrence,
} from './tasks';

// ---------------------------------------------------------------------------
// Real-time
// ---------------------------------------------------------------------------

export const taskChannel = (role: 'teacher' | 'student', id: number) => `private-tasks-${role}-${id}`;

export interface TaskRealtimeEvent {
  type: 'task.changed' | 'task.deleted' | 'comment.added';
  taskId?: number;
  studentTaskId?: number;
  actorRole?: 'teacher' | 'student';
}

/** Fire-and-forget notification to the boards of the given mentors/students. */
export function publishTaskEvent(
  audience: { teacherIds?: number[]; studentIds?: number[] },
  event: TaskRealtimeEvent
): void {
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET) return;
  const channels = [
    ...Array.from(new Set(audience.teacherIds ?? [])).map((id) => taskChannel('teacher', id)),
    ...Array.from(new Set(audience.studentIds ?? [])).map((id) => taskChannel('student', id)),
  ];
  if (!channels.length) return;
  try {
    const pusher = getPusherServer();
    // Pusher allows up to 100 channels per trigger.
    for (let i = 0; i < channels.length; i += 100) {
      pusher
        .trigger(channels.slice(i, i + 100), 'task-event', event)
        .catch((err) => console.error('Task realtime publish failed:', err));
    }
  } catch (err) {
    console.error('Task realtime publish failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Query building
// ---------------------------------------------------------------------------

export interface TaskListQuery {
  search?: string | null;
  status?: string | null;
  priority?: string | null;
  category?: string | null;
  studentId?: string | null;
  deadlineFilter?: string | null;
  includeCancelled?: boolean;
}

export function readTaskListQuery(searchParams: URLSearchParams): TaskListQuery {
  return {
    search: searchParams.get('search')?.trim() || null,
    status: searchParams.get('status'),
    priority: searchParams.get('priority'),
    category: searchParams.get('category'),
    studentId: searchParams.get('studentId'),
    deadlineFilter: searchParams.get('deadlineFilter'),
    includeCancelled: searchParams.get('includeCancelled') === 'true',
  };
}

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'SUBMITTED', 'CHANGES_REQUESTED', 'COMPLETED'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const OPEN_STATUSES = ['TODO', 'IN_PROGRESS', 'CHANGES_REQUESTED'];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Builds a StudentTask filter. `base` scopes it to the viewer (mentor or student).
 * Every filter runs in the database, so counts and lists always agree.
 */
export function buildStudentTaskWhere(
  base: Prisma.StudentTaskWhereInput,
  q: TaskListQuery,
  opts: { searchStudents: boolean; ignoreStatus?: boolean } = { searchStudents: false }
): Prisma.StudentTaskWhereInput {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const and: Prisma.StudentTaskWhereInput[] = [base];
  const taskWhere: Prisma.TaskWhereInput = {};

  if (!q.includeCancelled) taskWhere.isCancelled = false;
  if (q.priority && VALID_PRIORITIES.includes(q.priority)) taskWhere.priority = q.priority;
  if (q.category && q.category !== 'ALL') taskWhere.category = q.category;

  if (q.studentId && q.studentId !== 'ALL') {
    const sId = Number(q.studentId);
    if (Number.isInteger(sId)) and.push({ studentId: sId });
  }

  if (!opts.ignoreStatus && q.status && q.status !== 'ALL') {
    if (q.status === 'OVERDUE') {
      and.push({ status: { in: OPEN_STATUSES }, task: { deadline: { lt: now } } });
    } else if (VALID_STATUSES.includes(q.status)) {
      and.push({ status: q.status });
    }
  }

  switch (q.deadlineFilter) {
    case 'overdue':
      and.push({ status: { in: OPEN_STATUSES }, task: { deadline: { lt: now } } });
      break;
    case 'today':
      and.push({ task: { deadline: { gte: todayStart, lt: tomorrowStart } } });
      break;
    case 'week':
      and.push({ task: { deadline: { gte: todayStart, lt: new Date(todayStart.getTime() + 7 * 864e5) } } });
      break;
    case 'upcoming':
      and.push({ task: { deadline: { gte: tomorrowStart } } });
      break;
    case 'none':
      and.push({ task: { deadline: null } });
      break;
  }

  if (q.search) {
    const contains = { contains: q.search, mode: 'insensitive' as const };
    const or: Prisma.StudentTaskWhereInput[] = [
      { task: { title: contains } },
      { task: { description: contains } },
      { task: { category: contains } },
    ];
    const keyMatch = q.search.match(/^tsk-?(\d+)$/i);
    if (keyMatch) or.push({ taskId: Number(keyMatch[1]) });
    if (opts.searchStudents) {
      or.push({ student: { name: contains } }, { student: { email: contains } });
    } else {
      or.push({ task: { creator: { name: contains } } });
    }
    and.push({ OR: or });
  }

  and.push({ task: taskWhere });
  return { AND: and };
}

/** Lightweight shape for boards/lists: no full comment/activity history. */
export const studentTaskListInclude = {
  student: { select: { id: true, name: true, email: true, grade: true, program: true, schoolName: true } },
  task: {
    include: {
      creator: { select: { id: true, name: true, email: true } },
      linkedAssignment: { select: { id: true, title: true } },
      linkedResource: { select: { id: true, title: true } },
      linkedMeeting: { select: { id: true, title: true, startDateTime: true } },
    },
  },
  _count: { select: { comments: true } },
} satisfies Prisma.StudentTaskInclude;

/** Status counts for the same filter, ignoring the status filter itself (for column headers). */
export async function countByStatus(where: Prisma.StudentTaskWhereInput) {
  const groups = await prisma.studentTask.groupBy({ by: ['status'], where, _count: { _all: true } });
  const counts: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, SUBMITTED: 0, CHANGES_REQUESTED: 0, COMPLETED: 0 };
  groups.forEach((g) => {
    counts[g.status] = g._count._all;
  });
  return counts;
}

// ---------------------------------------------------------------------------
// Task field parsing shared by create / edit / templates
// ---------------------------------------------------------------------------

export function parseChecklistField(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return normalizeChecklist(value) as unknown as Prisma.InputJsonValue;
}

export function parseRecurrenceField(value: unknown): TaskRecurrence | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '' || value === 'NONE') return null;
  return isTaskRecurrence(value) ? value : null;
}

export function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * Validates linked items belong to this mentor. Returns ids to store (null clears
 * a link, undefined leaves it unchanged) or an error message.
 */
export async function resolveTaskLinks(
  teacherId: number,
  input: { linkedAssignmentId?: unknown; linkedResourceId?: unknown; linkedMeetingId?: unknown }
): Promise<
  | { ok: true; data: { linkedAssignmentId?: number | null; linkedResourceId?: number | null; linkedMeetingId?: number | null } }
  | { ok: false; error: string }
> {
  const data: { linkedAssignmentId?: number | null; linkedResourceId?: number | null; linkedMeetingId?: number | null } = {};
  const toId = (v: unknown) => (v === null || v === '' || v === 'NONE' ? null : Number(v));

  if (input.linkedAssignmentId !== undefined) {
    const id = toId(input.linkedAssignmentId);
    if (id !== null) {
      const found = await prisma.assignment.findFirst({ where: { id, teacherId }, select: { id: true } });
      if (!found) return { ok: false, error: 'Linked assignment not found' };
    }
    data.linkedAssignmentId = id;
  }
  if (input.linkedResourceId !== undefined) {
    const id = toId(input.linkedResourceId);
    if (id !== null) {
      const found = await prisma.resource.findFirst({ where: { id, teacherId }, select: { id: true } });
      if (!found) return { ok: false, error: 'Linked resource not found' };
    }
    data.linkedResourceId = id;
  }
  if (input.linkedMeetingId !== undefined) {
    const id = toId(input.linkedMeetingId);
    if (id !== null) {
      const found = await prisma.meetingMinuteMeeting.findFirst({ where: { id, teacherId }, select: { id: true } });
      if (!found) return { ok: false, error: 'Linked meeting not found' };
    }
    data.linkedMeetingId = id;
  }
  return { ok: true, data };
}

/**
 * Resolves the students a mentor may assign to from explicit ids and group ids.
 * Returns an error if any explicit id or group isn't the mentor's.
 */
export async function resolveAssignableStudents(
  teacherId: number,
  studentIds: unknown,
  groupIds: unknown
): Promise<{ ok: true; students: { id: number; name: string; email: string }[] } | { ok: false; error: string }> {
  const toIds = (v: unknown) =>
    Array.isArray(v) ? Array.from(new Set(v.map(Number).filter((n) => Number.isInteger(n) && n > 0))) : [];
  const explicitIds = toIds(studentIds);
  const groups = toIds(groupIds);

  let groupStudentIds: number[] = [];
  if (groups.length) {
    const found = await prisma.studentGroup.findMany({
      where: { id: { in: groups }, teacherId },
      select: { id: true, members: { select: { studentId: true } } },
    });
    if (found.length !== groups.length) return { ok: false, error: 'One or more groups were not found' };
    groupStudentIds = found.flatMap((g) => g.members.map((m) => m.studentId));
  }

  const allIds = Array.from(new Set([...explicitIds, ...groupStudentIds]));
  if (!allIds.length) return { ok: false, error: 'Please select at least one student or group' };

  const students = await prisma.student.findMany({
    where: { id: { in: allIds }, teacherLinks: { some: { teacherId } } },
    select: { id: true, name: true, email: true },
  });

  // Explicitly chosen students must all be linked; group members who are no
  // longer linked to this mentor are skipped silently.
  const linked = new Set(students.map((s) => s.id));
  if (explicitIds.some((id) => !linked.has(id))) {
    return { ok: false, error: 'You can only assign tasks to students linked to you' };
  }
  if (!students.length) return { ok: false, error: 'None of the selected students are linked to you' };
  return { ok: true, students };
}

// ---------------------------------------------------------------------------
// Recurring tasks
// ---------------------------------------------------------------------------

/**
 * Creates the next occurrence of a recurring task (same students, fresh TODO
 * status). Idempotent: guarded by nextOccurrenceCreatedAt.
 */
export async function spawnNextOccurrence(taskId: number): Promise<number | null> {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
      include: { studentTasks: { select: { studentId: true } }, creator: { select: { id: true, name: true } } },
    });
    if (!task || task.isCancelled || task.nextOccurrenceCreatedAt || !task.deadline) return null;
    if (!isTaskRecurrence(task.recurrence)) return null;

    const nextDeadline = nextOccurrenceDate(task.deadline, task.recurrence);
    if (task.recurrenceEndsAt && nextDeadline > task.recurrenceEndsAt) return null;

    // Claim the slot first so concurrent runs can't double-create.
    const claimed = await tx.task.updateMany({
      where: { id: task.id, nextOccurrenceCreatedAt: null },
      data: { nextOccurrenceCreatedAt: new Date() },
    });
    if (claimed.count === 0) return null;

    const next = await tx.task.create({
      data: {
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        deadline: nextDeadline,
        creatorId: task.creatorId,
        requireSubmissionNote: task.requireSubmissionNote,
        requireFileUpload: task.requireFileUpload,
        requireUrl: task.requireUrl,
        requireExternalConfirmation: task.requireExternalConfirmation,
        requireChecklistComplete: task.requireChecklistComplete,
        externalConfirmationPrompt: task.externalConfirmationPrompt,
        requireMentorApproval: task.requireMentorApproval,
        checklist: readChecklist(task.checklist) as unknown as Prisma.InputJsonValue,
        recurrence: task.recurrence,
        recurrenceEndsAt: task.recurrenceEndsAt,
        seriesId: task.seriesId ?? task.id,
        templateId: task.templateId,
        linkedAssignmentId: task.linkedAssignmentId,
        linkedResourceId: task.linkedResourceId,
        linkedMeetingId: task.linkedMeetingId,
      },
    });

    for (const { studentId } of task.studentTasks) {
      const st = await tx.studentTask.create({ data: { taskId: next.id, studentId, status: 'TODO' } });
      await tx.taskActivity.create({
        data: {
          studentTaskId: st.id,
          action: 'CREATED',
          details: `Recurring task created automatically (next in series after TSK-${task.id})`,
          performedById: task.creator.id,
          performedByRole: 'teacher',
          performedByName: task.creator.name,
        },
      });
    }
    return next.id;
  });
}

// ---------------------------------------------------------------------------
// Metrics & lookups (kept to as few database round trips as possible)
// ---------------------------------------------------------------------------

export interface TeacherTaskMetrics {
  totalTasks: number;
  totalAssignments: number;
  todo: number;
  inProgress: number;
  pendingReview: number;
  changesRequested: number;
  completed: number;
  overdue: number;
}

/** Every mentor board counter in a single query (non-cancelled tasks only). */
export async function getTeacherTaskMetrics(teacherId: number): Promise<TeacherTaskMetrics> {
  const [row] = await prisma.$queryRaw<TeacherTaskMetrics[]>`
    SELECT
      COUNT(DISTINCT t.id)::int AS "totalTasks",
      COUNT(st.id)::int AS "totalAssignments",
      COUNT(*) FILTER (WHERE st.status = 'TODO')::int AS "todo",
      COUNT(*) FILTER (WHERE st.status = 'IN_PROGRESS')::int AS "inProgress",
      COUNT(*) FILTER (WHERE st.status = 'SUBMITTED')::int AS "pendingReview",
      COUNT(*) FILTER (WHERE st.status = 'CHANGES_REQUESTED')::int AS "changesRequested",
      COUNT(*) FILTER (WHERE st.status = 'COMPLETED')::int AS "completed",
      COUNT(*) FILTER (
        WHERE st.status IN ('TODO', 'IN_PROGRESS', 'CHANGES_REQUESTED') AND t.deadline < NOW()
      )::int AS "overdue"
    FROM "Task" t
    LEFT JOIN "StudentTask" st ON st."taskId" = t.id
    WHERE t."creatorId" = ${teacherId} AND t."isCancelled" = false
  `;
  return row;
}

export interface StudentTaskMetrics {
  totalTasks: number;
  todo: number;
  inProgress: number;
  submitted: number;
  changesRequested: number;
  completed: number;
  overdue: number;
}

/** Every student board counter in a single query (cancelled tasks are hidden from students). */
export async function getStudentTaskMetrics(studentId: number): Promise<StudentTaskMetrics> {
  const [row] = await prisma.$queryRaw<StudentTaskMetrics[]>`
    SELECT
      COUNT(*)::int AS "totalTasks",
      COUNT(*) FILTER (WHERE st.status = 'TODO')::int AS "todo",
      COUNT(*) FILTER (WHERE st.status = 'IN_PROGRESS')::int AS "inProgress",
      COUNT(*) FILTER (WHERE st.status = 'SUBMITTED')::int AS "submitted",
      COUNT(*) FILTER (WHERE st.status = 'CHANGES_REQUESTED')::int AS "changesRequested",
      COUNT(*) FILTER (WHERE st.status = 'COMPLETED')::int AS "completed",
      COUNT(*) FILTER (
        WHERE st.status IN ('TODO', 'IN_PROGRESS', 'CHANGES_REQUESTED') AND t.deadline < NOW()
      )::int AS "overdue"
    FROM "StudentTask" st
    JOIN "Task" t ON t.id = st."taskId"
    WHERE st."studentId" = ${studentId} AND t."isCancelled" = false
  `;
  return row;
}

/**
 * Students, groups and categories for the mentor's filters and task form.
 * These don't change with filters, so clients request them only when needed.
 */
export async function getTeacherTaskLookups(teacherId: number) {
  const [categories, links, groups] = await Promise.all([
    prisma.task.findMany({ where: { creatorId: teacherId }, distinct: ['category'], select: { category: true } }),
    prisma.teacherStudent.findMany({
      where: { teacherId },
      select: {
        program: true,
        student: { select: { id: true, name: true, email: true, grade: true, program: true, schoolName: true } },
      },
    }),
    prisma.studentGroup.findMany({
      where: { teacherId },
      select: { id: true, name: true, members: { select: { studentId: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  // A student can be linked under several programs; list each once.
  const students = new Map<number, (typeof links)[number]['student'] & { program: string }>();
  links.forEach((l) => {
    if (!students.has(l.student.id)) students.set(l.student.id, { ...l.student, program: l.program || l.student.program });
  });

  return {
    categories: categories.map((c) => c.category).filter(Boolean),
    students: Array.from(students.values()).sort((a, b) => a.name.localeCompare(b.name)),
    groups: groups.map((g) => ({ id: g.id, name: g.name, studentIds: g.members.map((m) => m.studentId) })),
  };
}

export async function getStudentTaskLookups(studentId: number) {
  const [categories, mentors] = await Promise.all([
    prisma.task.findMany({
      where: { isCancelled: false, studentTasks: { some: { studentId } } },
      distinct: ['category'],
      select: { category: true },
    }),
    prisma.teacher.findMany({
      where: { createdTasks: { some: { studentTasks: { some: { studentId } } } } },
      select: { id: true, name: true, email: true },
    }),
  ]);
  return { categories: categories.map((c) => c.category).filter(Boolean), mentors };
}
