import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';

export const runtime = 'nodejs';
export const maxDuration = 60;

type JobPayload = {
  teacherId?: number;
  scheduleIds?: number[];
  recurrencePattern?: string | null;
};

type ScheduleForProcessing = {
  id: number;
  title: string;
  subject: string;
  description: string | null;
  location: string | null;
  meetingLink: string | null;
  date: Date;
  startTime: string;
  endTime: string;
  timezone: string | null;
  startDateTime: Date | null;
  endDateTime: Date | null;
  student: {
    name: string;
    email: string;
  };
  group: {
    name: string;
    members: Array<{
      student: {
        name: string;
        email: string;
      };
    }>;
  } | null;
};

function getDateKey(input: string | Date): string {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const isoDatePart = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDatePart?.[1]) return isoDatePart[1];
  }
  return new Date(input).toISOString().split('T')[0];
}

function convertToUTC(dateStr: string, timeStr: string, timezone: string): Date {
  const dateKey = getDateKey(dateStr);
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = formatter.formatToParts(utcGuess);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value || '';

  const tzYear = Number(part('year'));
  const tzMonth = Number(part('month'));
  const tzDay = Number(part('day'));
  const tzHour = Number(part('hour'));
  const tzMinute = Number(part('minute'));
  const tzSecond = Number(part('second'));

  const asIfUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond);
  const offsetMs = asIfUtc - utcGuess.getTime();

  return new Date(utcGuess.getTime() - offsetMs);
}

function getReminderScheduledFor(classStartUtc: Date): Date | null {
  const leadMinutes = Number(process.env.SCHEDULE_REMINDER_LEAD_MINUTES);
  if (!Number.isFinite(leadMinutes) || leadMinutes <= 0) {
    throw new Error('SCHEDULE_REMINDER_LEAD_MINUTES must be a positive number.');
  }

  const normalizedLeadMinutes = Math.floor(leadMinutes);
  const reminderScheduledFor = new Date(classStartUtc.getTime() - normalizedLeadMinutes * 60 * 1000);
  return reminderScheduledFor.getTime() > Date.now() ? reminderScheduledFor : null;
}

function isGoogleMeetLink(link?: string | null): boolean {
  if (!link) return false;
  return /https?:\/\/(meet\.google\.com)\//i.test(link);
}

function formatUtcForICS(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICS(value?: string | null): string {
  if (!value) return '';
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function buildCalendarInviteICS(args: {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  startUtc: Date;
  endUtc: Date;
}): string {
  const dtStamp = formatUtcForICS(new Date());
  const dtStart = formatUtcForICS(args.startUtc);
  const dtEnd = formatUtcForICS(args.endUtc);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AES//Class Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${escapeICS(args.uid)}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(args.title)}`,
    `DESCRIPTION:${escapeICS(args.description || '')}`,
    `LOCATION:${escapeICS(args.location || '')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function getUniqueRecipients(schedule: ScheduleForProcessing): Array<{ email: string; name: string }> {
  const recipients = schedule.group
    ? schedule.group.members.map((member) => ({
        email: member.student.email,
        name: member.student.name,
      }))
    : [{ email: schedule.student.email, name: schedule.student.name }];

  return Array.from(
    new Map(recipients.filter((recipient) => !!recipient.email).map((recipient) => [recipient.email.toLowerCase(), recipient])).values()
  );
}

function getScheduleWindowUtc(schedule: ScheduleForProcessing): { startUtc: Date; endUtc: Date } {
  const timezone = schedule.timezone || 'America/Los_Angeles';
  const dateIso = schedule.date.toISOString();

  const startUtc = schedule.startDateTime
    ? new Date(schedule.startDateTime)
    : convertToUTC(dateIso, schedule.startTime, timezone);
  const endUtc = schedule.endDateTime
    ? new Date(schedule.endDateTime)
    : convertToUTC(dateIso, schedule.endTime, timezone);

  return { startUtc, endUtc };
}

async function sendSingleScheduleInvitations(args: {
  teacherName: string;
  teacherEmail: string;
  schedule: ScheduleForProcessing;
}) {
  const schedule = args.schedule;
  const timezone = schedule.timezone || 'America/Los_Angeles';
  const recipients = getUniqueRecipients(schedule);
  if (recipients.length === 0) return { attempted: 0, sent: 0, failed: 0 };

  const { startUtc, endUtc } = getScheduleWindowUtc(schedule);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const localStart = formatter.format(startUtc);
  const localEnd = formatter.format(endUtc);
  const meetLink = isGoogleMeetLink(schedule.meetingLink) ? schedule.meetingLink : null;

  const sendTasks = recipients.map((recipient) => {
    const titlePrefix = schedule.group ? `Group Class: ${schedule.group.name}` : 'Class Invitation';
    const mailSubject = `${titlePrefix} • ${schedule.title}`;

    const details = [
      `Class: ${schedule.title}`,
      `Subject: ${schedule.subject}`,
      `Teacher: ${args.teacherName}`,
      `When: ${localStart} - ${localEnd} (${timezone})`,
      `Location: ${schedule.location || 'Online'}`,
      schedule.meetingLink ? `Meeting Link: ${schedule.meetingLink}` : '',
      schedule.description ? `Notes: ${schedule.description}` : '',
    ].filter(Boolean).join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
        <p>Hi ${recipient.name},</p>
        <p>You have a new class invitation from <strong>${args.teacherName}</strong>.</p>
        <p><strong>${schedule.title}</strong> (${schedule.subject})</p>
        <ul>
          <li><strong>When:</strong> ${localStart} - ${localEnd} (${timezone})</li>
          <li><strong>Location:</strong> ${schedule.location || 'Online'}</li>
          ${schedule.group ? `<li><strong>Group:</strong> ${schedule.group.name}</li>` : ''}
        </ul>
        ${schedule.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${schedule.meetingLink}">${schedule.meetingLink}</a></p>` : ''}
        ${meetLink ? `<p><a href="${meetLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none;">Join Google Meet</a></p>` : ''}
        ${schedule.description ? `<p><strong>Notes:</strong><br/>${schedule.description}</p>` : ''}
        <p>An invite file is attached so you can add this class to your calendar.</p>
      </div>
    `;

    const ics = buildCalendarInviteICS({
      uid: `${startUtc.getTime()}-${recipient.email}-aes-schedule`,
      title: schedule.group ? `${schedule.title} (${schedule.group.name})` : schedule.title,
      description: details,
      location: schedule.location || schedule.meetingLink || '',
      startUtc,
      endUtc,
    });

    return sendMail({
      to: recipient.email,
      subject: mailSubject,
      html,
      text: details,
      replyTo: args.teacherEmail,
      attachments: [
        {
          filename: 'class-invitation.ics',
          content: ics,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        },
      ],
    });
  });

  const results = await Promise.allSettled(sendTasks);
  const sent = results.filter((result) => result.status === 'fulfilled').length;
  const failed = results.length - sent;

  return { attempted: results.length, sent, failed };
}

async function sendRecurringSummary(args: {
  teacherName: string;
  teacherEmail: string;
  schedules: ScheduleForProcessing[];
  recurrencePattern: string;
}) {
  const firstSchedule = args.schedules[0];
  if (!firstSchedule) return { attempted: 0, sent: 0, failed: 0 };

  const timezone = firstSchedule.timezone || 'America/Los_Angeles';
  const recipients = getUniqueRecipients(firstSchedule);
  if (recipients.length === 0) return { attempted: 0, sent: 0, failed: 0 };

  const windows = args.schedules
    .map((schedule) => getScheduleWindowUtc(schedule))
    .sort((first, second) => first.startUtc.getTime() - second.startUtc.getTime());

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const firstWindow = windows[0];
  const lastWindow = windows[windows.length - 1];

  const patternLabelMap: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
  };

  const patternLabel = patternLabelMap[args.recurrencePattern] || args.recurrencePattern;
  const previewLines = windows
    .slice(0, 5)
    .map((window) => `${formatter.format(window.startUtc)} - ${formatter.format(window.endUtc)}`);
  const hasMorePreviewItems = windows.length > previewLines.length;

  const sendTasks = recipients.map((recipient) => {
    const subjectPrefix = firstSchedule.group ? `Group Class Series: ${firstSchedule.group.name}` : 'Class Series Scheduled';
    const subject = `${subjectPrefix} • ${firstSchedule.title}`;

    const text = [
      `Hi ${recipient.name},`,
      '',
      `${args.teacherName} scheduled a recurring class series.`,
      `Class: ${firstSchedule.title}`,
      `Subject: ${firstSchedule.subject}`,
      `Pattern: ${patternLabel}`,
      `Occurrences: ${windows.length}`,
      `First Class: ${formatter.format(firstWindow.startUtc)} - ${formatter.format(firstWindow.endUtc)} (${timezone})`,
      `Last Class: ${formatter.format(lastWindow.startUtc)} - ${formatter.format(lastWindow.endUtc)} (${timezone})`,
      `Location: ${firstSchedule.location || 'Online'}`,
      firstSchedule.group ? `Group: ${firstSchedule.group.name}` : '',
      firstSchedule.meetingLink ? `Meeting Link: ${firstSchedule.meetingLink}` : '',
      firstSchedule.description ? `Notes: ${firstSchedule.description}` : '',
      '',
      'Upcoming classes:',
      ...previewLines,
      hasMorePreviewItems ? `...and ${windows.length - previewLines.length} more` : '',
    ].filter(Boolean).join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
        <p>Hi ${recipient.name},</p>
        <p><strong>${args.teacherName}</strong> scheduled a recurring class series.</p>
        <ul>
          <li><strong>Class:</strong> ${firstSchedule.title}</li>
          <li><strong>Subject:</strong> ${firstSchedule.subject}</li>
          <li><strong>Pattern:</strong> ${patternLabel}</li>
          <li><strong>Occurrences:</strong> ${windows.length}</li>
          <li><strong>First Class:</strong> ${formatter.format(firstWindow.startUtc)} - ${formatter.format(firstWindow.endUtc)} (${timezone})</li>
          <li><strong>Last Class:</strong> ${formatter.format(lastWindow.startUtc)} - ${formatter.format(lastWindow.endUtc)} (${timezone})</li>
          <li><strong>Location:</strong> ${firstSchedule.location || 'Online'}</li>
          ${firstSchedule.group ? `<li><strong>Group:</strong> ${firstSchedule.group.name}</li>` : ''}
        </ul>
        ${firstSchedule.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${firstSchedule.meetingLink}">${firstSchedule.meetingLink}</a></p>` : ''}
        ${firstSchedule.description ? `<p><strong>Notes:</strong><br/>${firstSchedule.description}</p>` : ''}
        <p><strong>Upcoming classes:</strong></p>
        <ul>
          ${previewLines.map((line) => `<li>${line}</li>`).join('')}
          ${hasMorePreviewItems ? `<li>...and ${windows.length - previewLines.length} more</li>` : ''}
        </ul>
      </div>
    `;

    return sendMail({
      to: recipient.email,
      subject,
      text,
      html,
      replyTo: args.teacherEmail,
    });
  });

  const results = await Promise.allSettled(sendTasks);
  const sent = results.filter((result) => result.status === 'fulfilled').length;
  const failed = results.length - sent;

  return { attempted: results.length, sent, failed };
}

async function handler(request: Request) {
  try {
    let payload: JobPayload | null = null;

    try {
      payload = await request.json();
    } catch {
      payload = null;
    }

    const teacherId = Number(payload?.teacherId);
    const scheduleIds = Array.isArray(payload?.scheduleIds)
      ? Array.from(new Set(payload!.scheduleIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)))
      : [];

    if (!Number.isInteger(teacherId) || teacherId <= 0 || scheduleIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    if (scheduleIds.length > 200) {
      return NextResponse.json({ success: false, error: 'Too many schedules in one job' }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, name: true, email: true },
    });

    if (!teacher) {
      return NextResponse.json({ success: true, skipped: 'teacher-not-found' });
    }

    const schedules = await prisma.classSchedule.findMany({
      where: {
        id: { in: scheduleIds },
        teacherId: teacher.id,
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            name: true,
            members: {
              select: {
                student: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { startDateTime: 'asc' },
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    if (schedules.length === 0) {
      return NextResponse.json({ success: true, skipped: 'schedules-not-found' });
    }

    const invitationSummary =
      payload?.recurrencePattern && schedules.length > 1
        ? await sendRecurringSummary({
            teacherName: teacher.name || 'Your teacher',
            teacherEmail: teacher.email,
            schedules: schedules as ScheduleForProcessing[],
            recurrencePattern: payload.recurrencePattern,
          })
        : (await Promise.allSettled(
            schedules.map((schedule) =>
              sendSingleScheduleInvitations({
                teacherName: teacher.name || 'Your teacher',
                teacherEmail: teacher.email,
                schedule: schedule as ScheduleForProcessing,
              })
            )
          )).reduce(
            (acc, result) => {
              if (result.status === 'fulfilled') {
                acc.attempted += result.value.attempted;
                acc.sent += result.value.sent;
                acc.failed += result.value.failed;
              } else {
                acc.failed += 1;
              }
              return acc;
            },
            { attempted: 0, sent: 0, failed: 0 }
          );

    const reminderResults = await Promise.allSettled(
      schedules.map(async (schedule) => {
        const { startUtc } = getScheduleWindowUtc(schedule as ScheduleForProcessing);
        const reminderScheduledFor = getReminderScheduledFor(startUtc);

        await prisma.classSchedule.update({
          where: { id: schedule.id },
          data: {
            reminderJobId: null,
            reminderScheduledFor,
            reminderSentAt: null,
          },
        });

        return reminderScheduledFor;
      })
    );

    const reminderSummary = reminderResults.reduce(
      (acc, result) => {
        if (result.status === 'rejected') {
          acc.failed += 1;
          return acc;
        }

        if (result.value) {
          acc.scheduled += 1;
        } else {
          acc.skipped += 1;
        }

        return acc;
      },
      { scheduled: 0, skipped: 0, failed: 0 }
    );

    return NextResponse.json({
      success: true,
      processedSchedules: schedules.length,
      invitationSummary,
      reminderSummary,
    });
  } catch (error) {
    console.error('Error processing schedule post-create job:', error);
    return NextResponse.json({ error: 'Failed to process schedule post-create job' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
