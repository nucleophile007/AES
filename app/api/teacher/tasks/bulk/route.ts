import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { sendAcademicNotification } from '@/lib/academic-notifications';
import { canMentorPerform } from '@/lib/tasks';
import { parseOptionalDate, publishTaskEvent } from '@/lib/task-server';

/**
 * Bulk actions on student task items (board cards / list rows).
 *
 * body: { action, studentTaskIds: number[], feedback?, deadline?, shiftDays? }
 *   APPROVE          – approve every selected item that is awaiting review
 *   REQUEST_CHANGES  – request changes (feedback required) on submitted/completed items
 *   SET_DEADLINE     – set an absolute deadline (`deadline`) on the parent tasks
 *   SHIFT_DEADLINE   – push parent task deadlines by `shiftDays` (can be negative)
 *   SET_PRIORITY     – set `priority` on the parent tasks
 *   CANCEL / RESTORE – cancel or reactivate the parent tasks
 *   UNASSIGN         – remove the selected students from their tasks
 *
 * Items that aren't in a valid state for the action are skipped and reported.
 */
const ACTIONS = ['APPROVE', 'REQUEST_CHANGES', 'SET_DEADLINE', 'SHIFT_DEADLINE', 'SET_PRIORITY', 'CANCEL', 'RESTORE', 'UNASSIGN'];
const MAX_ITEMS = 200;

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });

    const teacher = await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true, name: true } });
    if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });

    const body = await request.json();
    const { action, feedback } = body;
    if (!ACTIONS.includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid bulk action' }, { status: 400 });
    }

    const ids: number[] = Array.isArray(body.studentTaskIds)
      ? Array.from(new Set(body.studentTaskIds.map(Number).filter((n: number) => Number.isInteger(n) && n > 0)))
      : [];
    if (!ids.length) return NextResponse.json({ success: false, error: 'Select at least one item' }, { status: 400 });
    if (ids.length > MAX_ITEMS) {
      return NextResponse.json({ success: false, error: `You can update at most ${MAX_ITEMS} items at once` }, { status: 400 });
    }

    // Only this mentor's items; anything else is silently ignored.
    const items = await prisma.studentTask.findMany({
      where: { id: { in: ids }, task: { creatorId: teacher.id } },
      include: {
        task: { select: { id: true, title: true, deadline: true, isCancelled: true } },
        student: { select: { id: true, name: true, email: true } },
      },
    });
    const taskIds = Array.from(new Set(items.map((i) => i.taskId)));
    const now = new Date();
    const activity = (studentTaskId: number, act: string, details: string) => ({
      studentTaskId,
      action: act,
      details,
      performedById: teacher.id,
      performedByRole: 'teacher',
      performedByName: teacher.name,
    });

    let updated = 0;
    let skipped = ids.length - items.length;

    if (action === 'APPROVE' || action === 'REQUEST_CHANGES') {
      const note = typeof feedback === 'string' ? feedback.trim() : '';
      if (action === 'REQUEST_CHANGES' && !note) {
        return NextResponse.json({ success: false, error: 'Please explain what needs to change.' }, { status: 400 });
      }
      const eligible = items.filter((i) => !i.task.isCancelled && canMentorPerform(action, i.status));
      skipped += items.length - eligible.length;
      const newStatus = action === 'APPROVE' ? 'COMPLETED' : 'CHANGES_REQUESTED';

      await prisma.$transaction(async (tx) => {
        for (const item of eligible) {
          await tx.studentTask.update({
            where: { id: item.id },
            data: {
              status: newStatus,
              mentorFeedback: note || item.mentorFeedback,
              reviewedAt: now,
              reviewedById: teacher.id,
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
                  ? `Task approved by mentor ${teacher.name} (bulk)${note ? `. Feedback: ${note}` : ''}`
                  : `Changes requested by mentor ${teacher.name} (bulk): ${note}`
              )
            ),
          });
        }
      });
      updated = eligible.length;

      eligible.forEach((i) => {
        void sendAcademicNotification({
          recipients: [{ email: i.student.email, name: i.student.name }],
          subject: `Task Update: ${i.task.title}`,
          heading: action === 'APPROVE' ? 'Task Approved!' : 'Changes Requested on Task',
          message: `Your mentor ${teacher.name} has reviewed your task "${i.task.title}".`,
          details: [
            ...(note ? [{ label: 'Mentor Feedback', value: note }] : []),
            { label: 'Status', value: newStatus.replace(/_/g, ' ') },
          ],
          actionLabel: 'View Task in Dashboard',
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/student-dashboard?tab=tasks`,
        }).catch((err) => console.error('Bulk review email failed:', err));
      });
    } else if (action === 'SET_DEADLINE' || action === 'SHIFT_DEADLINE') {
      const tasks = await prisma.task.findMany({
        where: { id: { in: taskIds } },
        select: { id: true, deadline: true, studentTasks: { select: { id: true } } },
      });
      let newDeadlineFor: (d: Date | null) => Date | null;
      let label: string;
      if (action === 'SET_DEADLINE') {
        const d = parseOptionalDate(body.deadline);
        if (d === undefined) return NextResponse.json({ success: false, error: 'Invalid deadline' }, { status: 400 });
        newDeadlineFor = () => d;
        label = d ? `Deadline set to ${d.toLocaleString()}` : 'Deadline removed';
      } else {
        const days = Number(body.shiftDays);
        if (!Number.isInteger(days) || days === 0 || Math.abs(days) > 365) {
          return NextResponse.json({ success: false, error: 'shiftDays must be a whole number of days' }, { status: 400 });
        }
        newDeadlineFor = (d) => (d ? new Date(d.getTime() + days * 864e5) : null);
        label = `Deadline ${days > 0 ? 'extended' : 'moved earlier'} by ${Math.abs(days)} day(s)`;
      }

      await prisma.$transaction(async (tx) => {
        for (const t of tasks) {
          const next = newDeadlineFor(t.deadline);
          if ((next?.getTime() ?? null) === (t.deadline?.getTime() ?? null)) continue;
          await tx.task.update({ where: { id: t.id }, data: { deadline: next } });
          await tx.studentTask.updateMany({
            where: { taskId: t.id },
            data: { dueSoonReminderSentAt: null, overdueReminderSentAt: null },
          });
          await tx.taskActivity.createMany({
            data: t.studentTasks.map((st) => activity(st.id, 'DEADLINE_CHANGED', `${label} by ${teacher.name}`)),
          });
          updated += 1;
        }
      });
    } else if (action === 'SET_PRIORITY') {
      if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(body.priority)) {
        return NextResponse.json({ success: false, error: 'Invalid priority' }, { status: 400 });
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
              cancel ? `Task was cancelled by mentor ${teacher.name}` : `Task was reactivated by mentor ${teacher.name}`
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

    publishTaskEvent(
      { teacherIds: [teacher.id], studentIds: items.map((i) => i.studentId) },
      { type: 'task.changed', actorRole: 'teacher' }
    );

    return NextResponse.json({ success: true, updated, skipped });
  } catch (error) {
    console.error('Bulk task action error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
