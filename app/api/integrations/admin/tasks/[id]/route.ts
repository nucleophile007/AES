import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAcademicNotification } from '@/lib/academic-notifications';
import {
  parseChecklistField,
  parseOptionalDate,
  parseRecurrenceField,
  publishTaskEvent,
  rowAudience,
  mergeAudiences,
} from '@/lib/task-server';
import { assigneeColumns, assigneeTasksUrl, creatorInclude } from '@/lib/task-actors';
import {
  adminActivity,
  assigneeKey,
  authenticateAdminRequest,
  privateJson,
  resolveAdminAssignees,
} from '@/lib/task-admin';

type RouteContext = { params: Promise<{ id: string }> };

const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const notFound = () => privateJson({ success: false, error: 'Task not found' }, { status: 404 });
const readOnly = () =>
  privateJson({ success: false, error: 'Mentor-created tasks are view-only for admins.' }, { status: 403 });

async function readTaskId(params: RouteContext['params']) {
  const id = Number((await params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Any task on the platform, with every assignee's progress. `readOnly` is true for mentor-created tasks. */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  try {
    const taskId = await readTaskId(params);
    if (!taskId) return notFound();
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        ...creatorInclude,
        linkedAssignment: { select: { id: true, title: true, dueDate: true } },
        linkedResource: { select: { id: true, title: true, type: true, fileUrl: true } },
        linkedMeeting: { select: { id: true, title: true, startDateTime: true } },
        studentTasks: {
          include: {
            student: { select: { id: true, name: true, email: true, grade: true, program: true, schoolName: true } },
            assigneeTeacher: { select: { id: true, name: true, email: true } },
            assigneeParent: { select: { id: true, name: true, email: true } },
            comments: { orderBy: { createdAt: 'asc' } },
            activities: { orderBy: { createdAt: 'desc' } },
          },
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!task) return notFound();
    return privateJson({ success: true, task, readOnly: task.creatorRole !== 'ADMIN' });
  } catch (error) {
    console.error('Admin task detail failed:', error);
    return privateJson({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/** Edits an admin-created task: fields, cancel/restore, and adding assignees. */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  const admin = auth.admin;
  try {
    const taskId = await readTaskId(params);
    if (!taskId) return notFound();
    const existing = await prisma.task.findUnique({ where: { id: taskId }, include: { studentTasks: true } });
    if (!existing) return notFound();
    if (existing.creatorRole !== 'ADMIN') return readOnly();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return privateJson({ success: false, error: 'Invalid request' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim().slice(0, 300);
    if (typeof body.description === 'string' && body.description.trim()) data.description = body.description.trim();
    if (typeof body.category === 'string') data.category = body.category.trim() || 'General';
    if (VALID_PRIORITIES.includes(body.priority)) data.priority = body.priority;
    for (const flag of [
      'requireSubmissionNote',
      'requireFileUpload',
      'requireUrl',
      'requireExternalConfirmation',
      'requireMentorApproval',
      'requireChecklistComplete',
    ]) {
      if (typeof body[flag] === 'boolean') data[flag] = body[flag];
    }
    if (body.externalConfirmationPrompt !== undefined) {
      data.externalConfirmationPrompt =
        typeof body.externalConfirmationPrompt === 'string' && body.externalConfirmationPrompt.trim()
          ? body.externalConfirmationPrompt.trim()
          : null;
    }
    const checklist = parseChecklistField(body.checklist);
    if (checklist !== undefined) data.checklist = checklist;

    const deadline = parseOptionalDate(body.deadline);
    if (deadline !== undefined) data.deadline = deadline;
    const recurrence = parseRecurrenceField(body.recurrence);
    if (recurrence !== undefined) data.recurrence = recurrence;
    const recurrenceEndsAt = parseOptionalDate(body.recurrenceEndsAt);
    if (recurrenceEndsAt !== undefined) data.recurrenceEndsAt = recurrenceEndsAt;
    const finalRecurrence = recurrence !== undefined ? recurrence : existing.recurrence;
    const finalDeadline = deadline !== undefined ? deadline : existing.deadline;
    if (finalRecurrence && !finalDeadline) {
      return privateJson({ success: false, error: 'Recurring tasks need a deadline to repeat from' }, { status: 400 });
    }
    const cancelChanged = typeof body.isCancelled === 'boolean' && body.isCancelled !== existing.isCancelled;
    if (cancelChanged) data.isCancelled = body.isCancelled;
    const deadlineChanged =
      deadline !== undefined && (deadline?.getTime() ?? null) !== (existing.deadline?.getTime() ?? null);

    // New assignees (people already on the task are skipped).
    const resolved = await resolveAdminAssignees(
      { studentIds: body.addStudentIds, teacherIds: body.addTeacherIds, parentIds: body.addParentIds },
      { allowEmpty: true }
    );
    if (!resolved.ok) return privateJson({ success: false, error: resolved.error }, { status: 400 });
    const current = new Set(
      existing.studentTasks.map((st) =>
        assigneeKey({ role: st.assigneeRole, id: st.studentId ?? st.assigneeTeacherId ?? st.assigneeParentId ?? 0 })
      )
    );
    const added = resolved.assignees.filter((a) => !current.has(assigneeKey(a)));

    const updated = await prisma.$transaction(
      async (tx) => {
        const task = await tx.task.update({ where: { id: taskId }, data });
        if (deadlineChanged) {
          await tx.studentTask.updateMany({
            where: { taskId },
            data: { dueSoonReminderSentAt: null, overdueReminderSentAt: null },
          });
        }
        const logAll = async (action: string, details: string) => {
          if (!existing.studentTasks.length) return;
          await tx.taskActivity.createMany({
            data: existing.studentTasks.map((st) => ({ studentTaskId: st.id, action, details, ...adminActivity(admin) })),
          });
        };
        if (cancelChanged) {
          await logAll(
            body.isCancelled ? 'CANCELLED' : 'REOPENED',
            body.isCancelled ? `Task was cancelled by admin ${admin.name}` : `Task was reactivated by admin ${admin.name}`
          );
        }
        if (deadlineChanged) {
          await logAll(
            'DEADLINE_CHANGED',
            deadline ? `Deadline changed to ${deadline.toUTCString()} by ${admin.name}` : `Deadline removed by ${admin.name}`
          );
        }
        if (added.length) {
          const rows = await tx.studentTask.createManyAndReturn({
            data: added.map((a) => ({ taskId, ...assigneeColumns(a), status: 'TODO' })),
            select: { id: true },
          });
          await tx.taskActivity.createMany({
            data: rows.map((r) => ({
              studentTaskId: r.id,
              action: 'CREATED',
              details: `Task assigned by admin ${admin.name}`,
              ...adminActivity(admin),
            })),
          });
        }
        return task;
      },
      { timeout: 60_000 }
    );

    publishTaskEvent(
      mergeAudiences([
        ...existing.studentTasks.map((st) => rowAudience(st, null)),
        {
          studentIds: added.filter((a) => a.role === 'STUDENT').map((a) => a.id),
          teacherIds: added.filter((a) => a.role === 'TEACHER').map((a) => a.id),
          parentIds: added.filter((a) => a.role === 'PARENT').map((a) => a.id),
        },
      ]),
      { type: 'task.changed', taskId, actorRole: 'admin' }
    );

    for (const a of added) {
      void sendAcademicNotification({
        recipients: [{ email: a.email, name: a.name }],
        subject: `New Task Assigned: ${updated.title}`,
        heading: 'New Task Assigned',
        message: `The ACHARYA admin team (${admin.name}) has assigned you a task: "${updated.title}".`,
        details: [{ label: 'Deadline', value: updated.deadline ? updated.deadline.toUTCString() : 'No deadline' }],
        actionLabel: 'View in My Tasks',
        actionUrl: assigneeTasksUrl(a.role),
      }).catch((err) => console.error('Admin task assignment email failed:', err));
    }

    return privateJson({ success: true, task: updated, added: added.length });
  } catch (error) {
    console.error('Admin task update failed:', error);
    return privateJson({ success: false, error: 'Internal server error updating task' }, { status: 500 });
  }
}

/** Deletes an admin-created task with all its rows, comments and activity. */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  try {
    const taskId = await readTaskId(params);
    if (!taskId) return notFound();
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        creatorRole: true,
        studentTasks: { select: { assigneeRole: true, studentId: true, assigneeTeacherId: true, assigneeParentId: true } },
      },
    });
    if (!task) return notFound();
    if (task.creatorRole !== 'ADMIN') return readOnly();

    await prisma.task.delete({ where: { id: taskId } });
    publishTaskEvent(mergeAudiences(task.studentTasks.map((st) => rowAudience(st, null))), {
      type: 'task.deleted',
      taskId,
      actorRole: 'admin',
    });
    return privateJson({ success: true });
  } catch (error) {
    console.error('Admin task delete failed:', error);
    return privateJson({ success: false, error: 'Internal server error deleting task' }, { status: 500 });
  }
}
