import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canMentorPerform } from '@/lib/tasks';
import { mergeAudiences, parseOptionalDate, publishTaskEvent, rowAudience } from '@/lib/task-server';
import { assigneePeopleInclude, notifyMentorOfAdminChange, readAssignee } from '@/lib/task-actors';
import { feedbackAfterReview, notifyAssigneeOfReview, reviewerColumns } from '@/lib/task-review';
import { adminActivity, adminReviewer, authenticateAdminRequest, privateJson } from '@/lib/task-admin';

/**
 * Bulk actions on task rows, admin- or mentor-created. Same actions as the
 * mentor's bulk bar (so an admin can do nothing on a mentor's task that the
 * mentor couldn't): APPROVE, REQUEST_CHANGES, SET_DEADLINE, SHIFT_DEADLINE,
 * SET_PRIORITY, CANCEL, RESTORE, UNASSIGN. Mentors are emailed when their tasks change.
 */
const ACTION_WORDS: Record<string, string> = {
  APPROVE: 'approved submissions',
  REQUEST_CHANGES: 'requested changes',
  SET_DEADLINE: 'changed the deadline',
  SHIFT_DEADLINE: 'moved the deadline',
  SET_PRIORITY: 'changed the priority',
  CANCEL: 'cancelled the task',
  RESTORE: 'reactivated the task',
  UNASSIGN: 'removed people from the task',
};
const ACTIONS = ['APPROVE', 'REQUEST_CHANGES', 'SET_DEADLINE', 'SHIFT_DEADLINE', 'SET_PRIORITY', 'CANCEL', 'RESTORE', 'UNASSIGN'];
const MAX_ITEMS = 500;

export async function POST(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  const admin = auth.admin;
  try {
    const body = await request.json().catch(() => null);
    const action = body?.action;
    if (!ACTIONS.includes(action)) return privateJson({ success: false, error: 'Invalid bulk action' }, { status: 400 });

    const ids: number[] = Array.isArray(body.studentTaskIds)
      ? Array.from(new Set(body.studentTaskIds.map(Number).filter((n: number) => Number.isInteger(n) && n > 0)))
      : [];
    if (!ids.length) return privateJson({ success: false, error: 'Select at least one item' }, { status: 400 });
    if (ids.length > MAX_ITEMS) {
      return privateJson({ success: false, error: `You can update at most ${MAX_ITEMS} items at once` }, { status: 400 });
    }

    const items = await prisma.studentTask.findMany({
      where: { id: { in: ids } },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            deadline: true,
            isCancelled: true,
            creatorRole: true,
            creatorId: true,
            creatorName: true,
            creatorAdminEmail: true,
            creator: { select: { id: true, name: true, email: true } },
          },
        },
        ...assigneePeopleInclude,
      },
    });
    const taskIds = Array.from(new Set(items.map((i) => i.taskId)));
    const now = new Date();
    const activity = (studentTaskId: number, act: string, details: string) => ({
      studentTaskId,
      action: act,
      details,
      ...adminActivity(admin),
    });

    let updated = 0;
    let skipped = ids.length - items.length;
    // Rows actually changed (review actions skip ineligible rows), for the mentor emails.
    let touched = items;

    if (action === 'APPROVE' || action === 'REQUEST_CHANGES') {
      const note = typeof body.feedback === 'string' ? body.feedback.trim() : '';
      if (action === 'REQUEST_CHANGES' && !note) {
        return privateJson({ success: false, error: 'Please explain what needs to change.' }, { status: 400 });
      }
      const eligible = items.filter((i) => !i.task.isCancelled && canMentorPerform(action, i.status));
      skipped += items.length - eligible.length;
      const newStatus = action === 'APPROVE' ? 'COMPLETED' : 'CHANGES_REQUESTED';
      const reviewer = adminReviewer(admin);
      await prisma.$transaction(async (tx) => {
        for (const item of eligible) {
          await tx.studentTask.update({
            where: { id: item.id },
            data: {
              status: newStatus,
              mentorFeedback: feedbackAfterReview(action, note, item.mentorFeedback),
              reviewedAt: now,
              ...reviewerColumns(reviewer),
              completedAt: action === 'APPROVE' ? item.completedAt || now : null,
            },
          });
        }
        if (eligible.length) {
          await tx.taskActivity.createMany({
            data: eligible.map((i) =>
              activity(
                i.id,
                action === 'APPROVE' ? 'APPROVED' : 'CHANGES_REQUESTED',
                action === 'APPROVE'
                  ? `Task approved by admin ${admin.name} (bulk)${note ? `. Feedback: ${note}` : ''}`
                  : `Changes requested by admin ${admin.name} (bulk): ${note}`
              )
            ),
          });
        }
      }, { timeout: 60_000 });
      updated = eligible.length;
      touched = eligible;
      eligible.forEach((i) => notifyAssigneeOfReview(reviewer, i, action, newStatus, note));
    } else if (action === 'SET_DEADLINE' || action === 'SHIFT_DEADLINE') {
      const tasks = await prisma.task.findMany({
        where: { id: { in: taskIds } },
        select: { id: true, deadline: true, studentTasks: { select: { id: true } } },
      });
      let nextFor: (d: Date | null) => Date | null;
      let label: string;
      if (action === 'SET_DEADLINE') {
        const d = parseOptionalDate(body.deadline);
        if (d === undefined) return privateJson({ success: false, error: 'Invalid deadline' }, { status: 400 });
        nextFor = () => d;
        label = d ? `Deadline set to ${d.toUTCString()}` : 'Deadline removed';
      } else {
        const days = Number(body.shiftDays);
        if (!Number.isInteger(days) || days === 0 || Math.abs(days) > 365) {
          return privateJson({ success: false, error: 'shiftDays must be a whole number of days' }, { status: 400 });
        }
        nextFor = (d) => (d ? new Date(d.getTime() + days * 864e5) : null);
        label = `Deadline ${days > 0 ? 'extended' : 'moved earlier'} by ${Math.abs(days)} day(s)`;
      }
      await prisma.$transaction(async (tx) => {
        for (const t of tasks) {
          const next = nextFor(t.deadline);
          if ((next?.getTime() ?? null) === (t.deadline?.getTime() ?? null)) continue;
          await tx.task.update({ where: { id: t.id }, data: { deadline: next } });
          await tx.studentTask.updateMany({
            where: { taskId: t.id },
            data: { dueSoonReminderSentAt: null, overdueReminderSentAt: null },
          });
          await tx.taskActivity.createMany({
            data: t.studentTasks.map((st) => activity(st.id, 'DEADLINE_CHANGED', `${label} by ${admin.name}`)),
          });
          updated += 1;
        }
      }, { timeout: 60_000 });
    } else if (action === 'SET_PRIORITY') {
      if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(body.priority)) {
        return privateJson({ success: false, error: 'Invalid priority' }, { status: 400 });
      }
      const res = await prisma.task.updateMany({ where: { id: { in: taskIds } }, data: { priority: body.priority } });
      updated = res.count;
    } else if (action === 'CANCEL' || action === 'RESTORE') {
      const cancel = action === 'CANCEL';
      const targets = await prisma.task.findMany({
        where: { id: { in: taskIds }, isCancelled: !cancel },
        select: { id: true, studentTasks: { select: { id: true } } },
      });
      await prisma.$transaction(async (tx) => {
        await tx.task.updateMany({ where: { id: { in: targets.map((t) => t.id) } }, data: { isCancelled: cancel } });
        const acts = targets.flatMap((t) =>
          t.studentTasks.map((st) =>
            activity(
              st.id,
              cancel ? 'CANCELLED' : 'REOPENED',
              cancel ? `Task was cancelled by admin ${admin.name}` : `Task was reactivated by admin ${admin.name}`
            )
          )
        );
        if (acts.length) await tx.taskActivity.createMany({ data: acts });
      });
      updated = targets.length;
    } else if (action === 'UNASSIGN') {
      const res = await prisma.studentTask.deleteMany({ where: { id: { in: items.map((i) => i.id) } } });
      updated = res.count;
    }

    publishTaskEvent(mergeAudiences(items.map((i) => rowAudience(i, i.task.creatorId))), {
      type: 'task.changed',
      actorRole: 'admin',
    });

    // One email per affected mentor task, listing whose copies were touched.
    if (updated > 0) {
      const byTask = new Map<number, typeof items>();
      touched
        .filter((i) => i.task.creatorRole !== 'ADMIN')
        .forEach((i) => byTask.set(i.taskId, [...(byTask.get(i.taskId) ?? []), i]));
      for (const rows of byTask.values()) {
        const names = rows.map((r) => readAssignee(r)?.name).filter(Boolean).join(', ');
        notifyMentorOfAdminChange(rows[0].task, admin.name, ACTION_WORDS[action] ?? 'made changes', [
          ...(names ? [{ label: 'Students', value: names }] : []),
        ]);
      }
    }
    return privateJson({ success: true, updated, skipped });
  } catch (error) {
    console.error('Admin bulk task action failed:', error);
    return privateJson({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
