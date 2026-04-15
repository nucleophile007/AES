import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isGoogleMeetLink(link?: string | null): boolean {
  if (!link) return false;
  return /https?:\/\/(meet\.google\.com)\//i.test(link);
}

function formatReminderDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

type LoadedSchedule = Awaited<ReturnType<typeof loadSchedule>>;
type ReminderSchedule = NonNullable<LoadedSchedule>;

function getUniqueRecipients(schedule: ReminderSchedule): Array<{ email: string; name: string }> {
  const recipients: Array<{ email: string; name: string }> = schedule.group
    ? schedule.group.members
        .map((member) => ({
          email: member.student.email,
          name: member.student.name,
        }))
        .filter((recipient: { email: string; name: string }) => !!recipient.email)
    : [{ email: schedule.student.email, name: schedule.student.name }];

  return Array.from(
    new Map(recipients.map((recipient: { email: string; name: string }) => [recipient.email.toLowerCase(), recipient])).values()
  );
}

async function claimScheduleReminder(scheduleId: number): Promise<boolean> {
  const claimResult = await prisma.classSchedule.updateMany({
    where: {
      id: scheduleId,
      reminderSentAt: null,
    },
    data: {
      reminderSentAt: new Date(),
    },
  });

  return claimResult.count > 0;
}

async function loadSchedule(scheduleId: number) {
  return prisma.classSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
          members: {
            select: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function sendReminderForSchedule(schedule: ReminderSchedule) {
  const timezone = schedule.timezone || 'America/Los_Angeles';
  const startUtc = schedule.startDateTime;

  if (!startUtc) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: 1,
    };
  }

  const recipients = getUniqueRecipients(schedule);

  if (recipients.length === 0) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: 1,
    };
  }

  const localStart = formatReminderDate(startUtc, timezone);
  const meetLink = isGoogleMeetLink(schedule.meetingLink) ? schedule.meetingLink : null;

  const emailResults = await Promise.allSettled(
    recipients.map((recipient) =>
      sendMail({
        to: recipient.email,
        subject: `Reminder: ${schedule.title} starts in 1 hour`,
        replyTo: schedule.teacher.email || undefined,
        text: [
          `Hi ${recipient.name},`,
          '',
          `Reminder: Your class starts in about 1 hour.`,
          `Class: ${schedule.title}`,
          `Subject: ${schedule.subject}`,
          `Teacher: ${schedule.teacher.name}`,
          `Start: ${localStart} (${timezone})`,
          `Location: ${schedule.location || 'Online'}`,
          schedule.group ? `Group: ${schedule.group.name}` : '',
          schedule.meetingLink ? `Meeting Link: ${schedule.meetingLink}` : '',
          '',
          'Please be ready a few minutes early.',
        ].filter(Boolean).join('\n'),
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
            <p>Hi ${recipient.name},</p>
            <p><strong>Reminder:</strong> Your class starts in about <strong>1 hour</strong>.</p>
            <ul>
              <li><strong>Class:</strong> ${schedule.title}</li>
              <li><strong>Subject:</strong> ${schedule.subject}</li>
              <li><strong>Teacher:</strong> ${schedule.teacher.name}</li>
              <li><strong>Start:</strong> ${localStart} (${timezone})</li>
              <li><strong>Location:</strong> ${schedule.location || 'Online'}</li>
              ${schedule.group ? `<li><strong>Group:</strong> ${schedule.group.name}</li>` : ''}
            </ul>
            ${schedule.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${schedule.meetingLink}">${schedule.meetingLink}</a></p>` : ''}
            ${meetLink ? `<p><a href="${meetLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none;">Join Google Meet</a></p>` : ''}
            <p>Please be ready a few minutes early.</p>
          </div>
        `,
      })
    )
  );

  const sent = emailResults.filter((result) => result.status === 'fulfilled').length;
  const failed = emailResults.length - sent;

  if (sent === 0 && failed > 0) {
    await prisma.classSchedule.update({
      where: { id: schedule.id },
      data: { reminderSentAt: null },
    });
    throw new Error(`Reminder sending failed for schedule ${schedule.id}`);
  }

  return {
    attempted: emailResults.length,
    sent,
    failed,
    skipped: 0,
  };
}

async function handler(request: Request) {
  try {
    let payload: { scheduleId?: number } | null = null;
    try {
      payload = await request.json();
    } catch {
      payload = null;
    }

    const directScheduleId = Number(payload?.scheduleId);

    if (Number.isFinite(directScheduleId) && directScheduleId > 0) {
      const schedule = await loadSchedule(directScheduleId);

      if (!schedule) {
        return NextResponse.json({
          success: true,
          mode: 'direct',
          scheduleId: directScheduleId,
          skipped: 'schedule-not-found',
        });
      }

      const claimed = await claimScheduleReminder(schedule.id);

      if (!claimed) {
        return NextResponse.json({
          success: true,
          mode: 'direct',
          scheduleId: schedule.id,
          skipped: 'already-processed',
        });
      }

      const result = await sendReminderForSchedule(schedule);

      return NextResponse.json({
        success: true,
        mode: 'direct',
        scheduleId: schedule.id,
        result,
      });
    }

    const leadMinutes = parsePositiveInt(process.env.SCHEDULE_REMINDER_LEAD_MINUTES, 60);
    const windowMinutes = parsePositiveInt(process.env.SCHEDULE_REMINDER_WINDOW_MINUTES, 5);
    const batchLimit = parsePositiveInt(process.env.SCHEDULE_REMINDER_BATCH_LIMIT, 100);
    const skipGoogleManaged = process.env.SCHEDULE_REMINDER_SKIP_WHEN_GOOGLE_EVENT !== 'false';

    const now = new Date();
    const windowStart = new Date(now.getTime() + (leadMinutes - windowMinutes) * 60 * 1000);
    const windowEnd = new Date(now.getTime() + (leadMinutes + windowMinutes) * 60 * 1000);

    const schedules = await prisma.classSchedule.findMany({
      where: {
        startDateTime: {
          gte: windowStart,
          lt: windowEnd,
        },
        reminderSentAt: null,
        status: {
          in: ['scheduled', 'upcoming'],
        },
        ...(skipGoogleManaged
          ? {
              googleCalendarEventId: null,
            }
          : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            members: {
              select: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
      take: batchLimit,
    });

    const summary = {
      matchedSchedules: schedules.length,
      batchLimit,
      claimedSchedules: 0,
      processedSchedules: 0,
      sentEmails: 0,
      failedEmails: 0,
      skippedSchedules: 0,
      skippedGoogleManaged: 0,
      requeuedSchedules: 0,
      scheduleErrors: 0,
    };

    if (skipGoogleManaged) {
      const googleManagedCount = await prisma.classSchedule.count({
        where: {
          startDateTime: {
            gte: windowStart,
            lt: windowEnd,
          },
          reminderSentAt: null,
          status: {
            in: ['scheduled', 'upcoming'],
          },
          NOT: {
            googleCalendarEventId: null,
          },
        },
      });
      summary.skippedGoogleManaged = googleManagedCount;
    }

    for (const schedule of schedules) {
      let scheduleClaimed = false;
      try {
        if (!(await claimScheduleReminder(schedule.id))) {
          summary.skippedSchedules += 1;
          continue;
        }

        scheduleClaimed = true;
        summary.claimedSchedules += 1;

        const result = await sendReminderForSchedule(schedule);
        summary.sentEmails += result.sent;
        summary.failedEmails += result.failed;
        summary.skippedSchedules += result.skipped;
        summary.processedSchedules += 1;
      } catch (scheduleError) {
        summary.scheduleErrors += 1;
        if (scheduleClaimed) {
          await prisma.classSchedule.update({
            where: { id: schedule.id },
            data: { reminderSentAt: null },
          });
          summary.requeuedSchedules += 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      leadMinutes,
      windowMinutes,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      summary,
      skipGoogleManaged,
    });
  } catch (error: any) {
    console.error('Error sending schedule reminders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

export const POST = verifySignatureAppRouter(handler);
