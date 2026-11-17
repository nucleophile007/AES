import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAcademicNotification } from '@/lib/academic-notifications';
import { readChecklist } from '@/lib/tasks';
import {
  countByStatus,
  parseChecklistField,
  parseOptionalDate,
  parseRecurrenceField,
  publishTaskEvent,
  readTaskListQuery,
  studentTaskListInclude,
} from '@/lib/task-server';
import { assigneeColumns, assigneeTasksUrl } from '@/lib/task-actors';
import {
  adminActivity,
  authenticateAdminRequest,
  buildAdminTaskWhere,
  privateJson,
  readAdminScope,
  resolveAdminAssignees,
} from '@/lib/task-admin';

const MAX_ROWS = 500;
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const OPEN_STATUSES = ['TODO', 'IN_PROGRESS', 'CHANGES_REQUESTED'];

/**
 * Admin task board: every task on the platform (admin-created and
 * mentor-created), filtered by ?source=all|admin|mentor, ?creatorTeacherId,
 * ?assigneeRole and the usual task filters. Pass ?lookups=1 for the filter
 * options (categories, mentors). Mentor-created tasks are view-only for admins.
 */
export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  try {
    const searchParams = request.nextUrl.searchParams;
    const scope = readAdminScope(searchParams);
    const query = readTaskListQuery(searchParams);
    const where = buildAdminTaskWhere(scope, query);
    const whereIgnoringStatus = buildAdminTaskWhere(scope, query, { ignoreStatus: true });
    const now = new Date();

    const [items, columnCounts, overdue, lookups] = await Promise.all([
      prisma.studentTask.findMany({
        where,
        include: studentTaskListInclude,
        orderBy: [{ task: { deadline: { sort: 'asc', nulls: 'last' } } }, { createdAt: 'desc' }],
        take: MAX_ROWS + 1,
      }),
      countByStatus(whereIgnoringStatus),
      prisma.studentTask.count({
        where: { AND: [whereIgnoringStatus, { status: { in: OPEN_STATUSES }, task: { deadline: { lt: now } } }] },
      }),
      searchParams.get('lookups') === '1'
        ? Promise.all([
            prisma.task.findMany({ distinct: ['category'], select: { category: true } }),
            prisma.teacher.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } }),
          ])
        : Promise.resolve(null),
    ]);

    return privateJson({
      success: true,
      items: items.slice(0, MAX_ROWS),
      truncated: items.length > MAX_ROWS,
      columnCounts,
      metrics: {
        total: Object.values(columnCounts).reduce((a, b) => a + b, 0),
        todo: columnCounts.TODO,
        inProgress: columnCounts.IN_PROGRESS,
        pendingReview: columnCounts.SUBMITTED,
        changesRequested: columnCounts.CHANGES_REQUESTED,
        completed: columnCounts.COMPLETED,
        overdue,
      },
      ...(lookups
        ? { categories: lookups[0].map((c) => c.category).filter(Boolean), mentors: lookups[1] }
        : {}),
    });
  } catch (error) {
    console.error('Admin task list failed:', error);
    return privateJson({ success: false, error: 'Internal server error fetching tasks' }, { status: 500 });
  }
}

/** Creates an admin task and assigns it to any mix of students, mentors and parents. */
export async function POST(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  const admin = auth.admin;
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return privateJson({ success: false, error: 'Invalid request' }, { status: 400 });

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (!title) return privateJson({ success: false, error: 'Task title is required' }, { status: 400 });
    if (!description) return privateJson({ success: false, error: 'Task description is required' }, { status: 400 });

    const deadline = parseOptionalDate(body.deadline) ?? null;
    const recurrence = parseRecurrenceField(body.recurrence) ?? null;
    const recurrenceEndsAt = parseOptionalDate(body.recurrenceEndsAt) ?? null;
    if (recurrence && !deadline) {
      return privateJson({ success: false, error: 'Recurring tasks need a deadline to repeat from' }, { status: 400 });
    }

    const resolved = await resolveAdminAssignees(body);
    if (!resolved.ok) return privateJson({ success: false, error: resolved.error }, { status: 400 });
    const assignees = resolved.assignees;

    const checklist = parseChecklistField(body.checklist ?? []);
    const fields = {
      title: title.slice(0, 300),
      description,
      category: (typeof body.category === 'string' && body.category.trim()) || 'General',
      priority: VALID_PRIORITIES.includes(body.priority) ? body.priority : 'MEDIUM',
      deadline,
      recurrence,
      recurrenceEndsAt: recurrence ? recurrenceEndsAt : null,
      checklist,
      requireSubmissionNote: Boolean(body.requireSubmissionNote),
      requireFileUpload: Boolean(body.requireFileUpload),
      requireUrl: Boolean(body.requireUrl),
      requireExternalConfirmation: Boolean(body.requireExternalConfirmation),
      requireChecklistComplete: Boolean(body.requireChecklistComplete),
      externalConfirmationPrompt:
        typeof body.externalConfirmationPrompt === 'string' && body.externalConfirmationPrompt.trim()
          ? body.externalConfirmationPrompt.trim()
          : null,
      requireMentorApproval: Boolean(body.requireMentorApproval),
    };

    const created: { id: number; role: string; personId: number }[] = [];
    const task = await prisma.$transaction(
      async (tx) => {
        const t = await tx.task.create({
          data: { ...fields, creatorRole: 'ADMIN', creatorAdminEmail: admin.email, creatorName: admin.name },
        });
        const rows = await tx.studentTask.createManyAndReturn({
          data: assignees.map((a) => ({ taskId: t.id, ...assigneeColumns(a), status: 'TODO' })),
          select: { id: true, assigneeRole: true, studentId: true, assigneeTeacherId: true, assigneeParentId: true },
        });
        rows.forEach((r) =>
          created.push({
            id: r.id,
            role: r.assigneeRole,
            personId: r.studentId ?? r.assigneeTeacherId ?? r.assigneeParentId ?? 0,
          })
        );
        await tx.taskActivity.createMany({
          data: created.map((c) => ({
            studentTaskId: c.id,
            action: 'CREATED',
            details: `Task created and assigned by admin ${admin.name}`,
            ...adminActivity(admin),
          })),
        });
        return t;
      },
      { timeout: 60_000 }
    );

    publishTaskEvent(
      {
        studentIds: assignees.filter((a) => a.role === 'STUDENT').map((a) => a.id),
        teacherIds: assignees.filter((a) => a.role === 'TEACHER').map((a) => a.id),
        parentIds: assignees.filter((a) => a.role === 'PARENT').map((a) => a.id),
      },
      { type: 'task.changed', taskId: task.id, actorRole: 'admin' }
    );

    const checklistCount = readChecklist(checklist).length;
    for (const role of ['STUDENT', 'TEACHER', 'PARENT'] as const) {
      const group = assignees.filter((a) => a.role === role);
      if (!group.length) continue;
      void sendAcademicNotification({
        recipients: group.map((a) => ({ email: a.email, name: a.name })),
        subject: `New Task Assigned: ${fields.title}`,
        heading: 'New Task Assigned',
        message: `The ACHARYA admin team (${admin.name}) has assigned you a new task: "${fields.title}".`,
        details: [
          { label: 'Priority', value: fields.priority },
          { label: 'Category', value: fields.category },
          { label: 'Deadline', value: deadline ? deadline.toUTCString() : 'No deadline' },
          ...(checklistCount ? [{ label: 'Checklist', value: `${checklistCount} steps` }] : []),
          ...(recurrence ? [{ label: 'Repeats', value: recurrence.toLowerCase() }] : []),
          { label: 'Requires Approval', value: fields.requireMentorApproval ? 'Yes' : 'No' },
        ],
        actionLabel: 'View in My Tasks',
        actionUrl: assigneeTasksUrl(role),
      }).catch((err) => console.error('Admin task assignment email failed:', err));
    }

    return privateJson({ success: true, task, assignedCount: assignees.length, itemIds: created.map((c) => c.id) });
  } catch (error) {
    console.error('Admin task create failed:', error);
    return privateJson({ success: false, error: 'Internal server error creating task' }, { status: 500 });
  }
}
