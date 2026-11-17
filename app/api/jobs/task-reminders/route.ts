import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { prisma } from '@/lib/prisma';
import { getApplicationUrl, sendAcademicNotification } from '@/lib/academic-notifications';
import { formatTaskKey } from '@/lib/tasks';
import { spawnNextOccurrence } from '@/lib/task-server';
import { assigneePeopleInclude, assigneeTasksUrl, creatorInclude, creatorReviewUrl, readAssignee, readCreator } from '@/lib/task-actors';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BATCH = 200;
const OPEN_STATUSES = ['TODO', 'IN_PROGRESS', 'CHANGES_REQUESTED'];

/**
 * Scheduled via QStash (suggested: hourly). Each run:
 *  1. emails assignees (students, mentors, parents) whose task is due within 24h (once per deadline),
 *  2. emails assignees (and a digest per task creator) when a task becomes overdue (once),
 *  3. creates the next occurrence of recurring tasks whose deadline is within 24h.
 * Reminder flags are claimed before sending so overlapping runs never double-send.
 */
async function handler() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3_600_000);
  const overdueWindowStart = new Date(now.getTime() - 7 * 864e5);

  // 1. Due soon
  const dueSoon = await prisma.studentTask.findMany({
    where: {
      status: { in: OPEN_STATUSES },
      dueSoonReminderSentAt: null,
      task: { isCancelled: false, deadline: { gt: now, lte: in24h } },
    },
    include: { ...assigneePeopleInclude, task: { select: { id: true, title: true, deadline: true } } },
    take: BATCH,
  });
  let dueSoonSent = 0;
  for (const st of dueSoon) {
    const assignee = readAssignee(st);
    if (!assignee) continue;
    const claimed = await prisma.studentTask.updateMany({
      where: { id: st.id, dueSoonReminderSentAt: null },
      data: { dueSoonReminderSentAt: now },
    });
    if (!claimed.count) continue;
    await sendAcademicNotification({
      recipients: [{ email: assignee.email, name: assignee.name }],
      subject: `Reminder: "${st.task.title}" is due soon`,
      heading: 'Task due within 24 hours',
      message: `Hi ${assignee.name}, your task "${st.task.title}" (${formatTaskKey(st.task.id)}) is due soon.`,
      details: [{ label: 'Deadline', value: st.task.deadline!.toUTCString() }],
      actionLabel: 'Open My Tasks',
      actionUrl: assigneeTasksUrl(assignee.role, st.id),
    }).catch((err) => console.error('Due-soon reminder failed:', err));
    dueSoonSent += 1;
  }

  // 2. Newly overdue
  const overdue = await prisma.studentTask.findMany({
    where: {
      status: { in: OPEN_STATUSES },
      overdueReminderSentAt: null,
      task: { isCancelled: false, deadline: { lt: now, gte: overdueWindowStart } },
    },
    include: {
      ...assigneePeopleInclude,
      task: {
        select: {
          id: true,
          title: true,
          deadline: true,
          creatorRole: true,
          creatorId: true,
          creatorAdminEmail: true,
          creatorName: true,
          ...creatorInclude,
        },
      },
    },
    take: BATCH,
  });
  // One digest per creator (a mentor, or the admin who created the task), keyed by email.
  const creatorDigest = new Map<string, { name: string; email: string; url?: string; lines: string[] }>();
  let overdueSent = 0;
  for (const st of overdue) {
    const assignee = readAssignee(st);
    if (!assignee) continue;
    const claimed = await prisma.studentTask.updateMany({
      where: { id: st.id, overdueReminderSentAt: null },
      data: { overdueReminderSentAt: now },
    });
    if (!claimed.count) continue;
    const creator = readCreator(st.task);
    await sendAcademicNotification({
      recipients: [{ email: assignee.email, name: assignee.name }],
      subject: `Overdue: "${st.task.title}"`,
      heading: 'A task is overdue',
      message: `Hi ${assignee.name}, "${st.task.title}" passed its deadline. Please finish it or message ${
        creator.role === 'ADMIN' ? 'the admin team' : 'your mentor'
      } if you need more time.`,
      details: [{ label: 'Was due', value: st.task.deadline!.toUTCString() }],
      actionLabel: 'Open My Tasks',
      actionUrl: assigneeTasksUrl(assignee.role, st.id),
    }).catch((err) => console.error('Overdue reminder failed:', err));
    overdueSent += 1;

    if (!creator.email) continue;
    const key = creator.email.toLowerCase();
    const entry = creatorDigest.get(key) ?? {
      name: creator.name,
      email: creator.email,
      url:
        creator.role === 'TEACHER'
          ? getApplicationUrl('/teacher-dashboard?tab=tasks&deadlineFilter=overdue')
          : creatorReviewUrl(creator),
      lines: [],
    };
    entry.lines.push(`${assignee.name} — ${st.task.title} (${formatTaskKey(st.task.id)})`);
    creatorDigest.set(key, entry);
  }
  for (const m of creatorDigest.values()) {
    await sendAcademicNotification({
      recipients: [{ email: m.email, name: m.name }],
      subject: `${m.lines.length} task item(s) just became overdue`,
      heading: 'Overdue tasks',
      message: 'These tasks passed their deadline without being finished:',
      details: m.lines.slice(0, 25).map((line, i) => ({ label: String(i + 1), value: line })),
      actionLabel: 'Open Task Board',
      actionUrl: m.url,
    }).catch((err) => console.error('Overdue digest failed:', err));
  }

  // 3. Recurring tasks
  const recurring = await prisma.task.findMany({
    where: {
      recurrence: { not: null },
      nextOccurrenceCreatedAt: null,
      isCancelled: false,
      deadline: { lte: in24h },
    },
    select: { id: true },
    take: BATCH,
  });
  let spawned = 0;
  for (const t of recurring) {
    try {
      if (await spawnNextOccurrence(t.id)) spawned += 1;
    } catch (err) {
      console.error(`Failed to spawn next occurrence for task ${t.id}:`, err);
    }
  }

  return NextResponse.json({ success: true, dueSoonSent, overdueSent, creatorDigests: creatorDigest.size, spawned });
}

export const POST = verifySignatureAppRouter(async () => {
  try {
    return await handler();
  } catch (error) {
    console.error('Task reminders job failed:', error);
    return NextResponse.json({ error: 'Failed to process task reminders' }, { status: 500 });
  }
});
