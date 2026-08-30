import { qstash } from '@/lib/qstash';
import { getApplicationUrl } from '@/lib/academic-notifications';

export async function scheduleAssignmentReminderJobs(args: {
  assignmentId: number;
  studentIds: number[];
  dueDate: Date;
}): Promise<{ queued: number; failed: number; skipped: number }> {
  const reminderUrl = getApplicationUrl('/api/jobs/assignment-reminder');
  if (!reminderUrl) return { queued: 0, failed: 0, skipped: args.studentIds.length * 3 };

  const reminders = [
    { kind: 'due-24h', sendAt: args.dueDate.getTime() - 24 * 60 * 60 * 1000 },
    { kind: 'due-1h', sendAt: args.dueDate.getTime() - 60 * 60 * 1000 },
    { kind: 'overdue', sendAt: args.dueDate.getTime() + 60 * 60 * 1000 },
  ];
  const futureReminders = reminders.filter((reminder) => reminder.sendAt > Date.now());
  const skipped = (reminders.length - futureReminders.length) * args.studentIds.length;
  const results = await Promise.allSettled(args.studentIds.flatMap((studentId) => futureReminders.map((reminder) =>
    qstash.publishJSON({
      url: reminderUrl,
      body: {
        assignmentId: args.assignmentId,
        studentId,
        expectedDueDate: args.dueDate.toISOString(),
        kind: reminder.kind,
      },
      notBefore: Math.floor(reminder.sendAt / 1000),
      deduplicationId: `assignment-${args.assignmentId}-student-${studentId}-${args.dueDate.getTime()}-${reminder.kind}`,
      retries: 3,
    })
  )));
  const queued = results.filter((result) => result.status === 'fulfilled').length;
  return { queued, failed: results.length - queued, skipped };
}
