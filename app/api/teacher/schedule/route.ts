import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { Prisma } from '../../../../generated/prisma';
import { sendMail } from '../../../../lib/mailer';

// Helper function to generate random colors based on subject
function generateRandomColor(subject: string): string {
  const colors = [
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Yellow
    '#34A853', // Green
    '#FF6D01', // Orange
    '#46BDC6', // Teal
    '#7F45E5', // Purple
    '#F06292', // Pink
  ];

  // Simple hash function to create consistent colors for the same subject
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = ((hash << 5) - hash) + subject.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Convert a date and time string from a specific timezone to UTC
 * @param dateStr - Date string (YYYY-MM-DD) or ISO string
 * @param timeStr - Time string (HH:MM)
 * @param timezone - Source timezone (e.g., 'America/Los_Angeles')
 * @returns Date object in UTC
 */
function convertToUTC(dateStr: string, timeStr: string, timezone: string): Date {
  const dateKey = getDateKey(dateStr);
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // Initial UTC guess for the intended wall clock time.
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  // Convert guess to local parts in requested timezone.
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

function parseTimeToMinutes(time: string): number {
  if (!/^\d{2}:\d{2}$/.test(time)) return Number.NaN;
  const [hours, minutes] = time.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return Number.NaN;
  return hours * 60 + minutes;
}

function hasTimeOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const aStart = parseTimeToMinutes(startA);
  const aEnd = parseTimeToMinutes(endA);
  const bStart = parseTimeToMinutes(startB);
  const bEnd = parseTimeToMinutes(endB);

  return aStart < bEnd && aEnd > bStart;
}

function getDateKey(input: string | Date): string {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const isoDatePart = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDatePart?.[1]) return isoDatePart[1];
  }
  return new Date(input).toISOString().split('T')[0];
}

function getDayBoundsFromDateKey(dateKey: string): { gte: Date; lt: Date } {
  const dayStart = new Date(`${dateKey}T00:00:00.000Z`);
  const nextDay = new Date(dayStart);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return { gte: dayStart, lt: nextDay };
}

function getReminderScheduledFor(classStartUtc: Date): Date | null {
  const leadMinutes = Number(process.env.SCHEDULE_REMINDER_LEAD_MINUTES || '60');
  const normalizedLeadMinutes = Number.isFinite(leadMinutes) && leadMinutes > 0 ? Math.floor(leadMinutes) : 60;
  const reminderScheduledFor = new Date(classStartUtc.getTime() - normalizedLeadMinutes * 60 * 1000);
  return reminderScheduledFor.getTime() > Date.now() ? reminderScheduledFor : null;
}

async function updateMeetingMinutesRaw(args: {
  scheduleId: number;
  meetingMinutes: string | null;
  updatedAt: Date;
  groupId: number | null;
  teacherId: number;
  date: Date;
  startTime: string;
  endTime: string;
  subject: string;
}) {
  await prisma.$executeRaw`
    UPDATE "ClassSchedule"
    SET "meetingMinutes" = ${args.meetingMinutes},
        "updatedAt" = ${args.updatedAt}
    WHERE "id" = ${args.scheduleId}
  `;

  if (args.groupId) {
    await prisma.$executeRaw`
      UPDATE "ClassSchedule"
      SET "meetingMinutes" = ${args.meetingMinutes},
          "updatedAt" = ${args.updatedAt}
      WHERE "teacherId" = ${args.teacherId}
        AND "groupId" = ${args.groupId}
        AND "date" = ${args.date}
        AND "startTime" = ${args.startTime}
        AND "endTime" = ${args.endTime}
        AND "subject" = ${args.subject}
    `;
  }
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

async function sendScheduleInvitations(args: {
  teacherName: string;
  teacherEmail: string;
  title: string;
  subject: string;
  description?: string | null;
  location?: string | null;
  meetingLink?: string | null;
  startUtc: Date;
  endUtc: Date;
  startTime: string;
  endTime: string;
  timezone: string;
  recipients: Array<{ email: string; name: string }>;
  groupName?: string;
}) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: args.timezone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const localStart = formatter.format(args.startUtc);
  const localEnd = formatter.format(args.endUtc);
  const meetLink = isGoogleMeetLink(args.meetingLink) ? args.meetingLink : null;

  const sendTasks = args.recipients.map((recipient) => {
    const titlePrefix = args.groupName ? `Group Class: ${args.groupName}` : 'Class Invitation';
    const mailSubject = `${titlePrefix} • ${args.title}`;

    const details = [
      `Class: ${args.title}`,
      `Subject: ${args.subject}`,
      `Teacher: ${args.teacherName}`,
      `When: ${localStart} - ${localEnd} (${args.timezone})`,
      `Location: ${args.location || 'Online'}`,
      args.meetingLink ? `Meeting Link: ${args.meetingLink}` : '',
      args.description ? `Notes: ${args.description}` : '',
    ].filter(Boolean).join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
        <p>Hi ${recipient.name},</p>
        <p>You have a new class invitation from <strong>${args.teacherName}</strong>.</p>
        <p><strong>${args.title}</strong> (${args.subject})</p>
        <ul>
          <li><strong>When:</strong> ${localStart} - ${localEnd} (${args.timezone})</li>
          <li><strong>Location:</strong> ${args.location || 'Online'}</li>
          ${args.groupName ? `<li><strong>Group:</strong> ${args.groupName}</li>` : ''}
        </ul>
        ${args.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${args.meetingLink}">${args.meetingLink}</a></p>` : ''}
        ${meetLink ? `<p><a href="${meetLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none;">Join Google Meet</a></p>` : ''}
        ${args.description ? `<p><strong>Notes:</strong><br/>${args.description}</p>` : ''}
        <p>An invite file is attached so you can add this class to your calendar.</p>
      </div>
    `;

    const ics = buildCalendarInviteICS({
      uid: `${args.startUtc.getTime()}-${recipient.email}-aes-schedule`,
      title: args.groupName ? `${args.title} (${args.groupName})` : args.title,
      description: details,
      location: args.location || args.meetingLink || '',
      startUtc: args.startUtc,
      endUtc: args.endUtc,
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

  return {
    attempted: results.length,
    sent,
    failed,
  };
}

type ScheduleWithParticipants = {
  id: number;
  title: string;
  subject: string;
  description: string | null;
  meetingMinutes: string | null;
  location: string | null;
  meetingLink: string | null;
  timezone: string | null;
  startDateTime: Date | null;
  endDateTime: Date | null;
  reminderJobId: string | null;
  student: {
    name: string;
    email: string;
  };
  teacher: {
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

function formatWithTimezone(date: Date, timezone: string): string {
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

function getUniqueScheduleRecipients(schedule: ScheduleWithParticipants): Array<{ email: string; name: string }> {
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

async function sendScheduleStatusEmail(args: {
  type: 'rescheduled' | 'cancelled';
  schedule: ScheduleWithParticipants;
  previousStartUtc?: Date | null;
}) {
  const timezone = args.schedule.timezone || 'America/Los_Angeles';
  const recipients = getUniqueScheduleRecipients(args.schedule);
  if (recipients.length === 0) return;

  const currentStart = args.schedule.startDateTime ? formatWithTimezone(args.schedule.startDateTime, timezone) : 'TBD';
  const previousStart = args.previousStartUtc ? formatWithTimezone(args.previousStartUtc, timezone) : null;

  const subjectPrefix = args.type === 'cancelled' ? 'Class Cancelled' : 'Class Rescheduled';
  const bodyStatusLine = args.type === 'cancelled'
    ? 'This class has been cancelled.'
    : 'This class has been rescheduled.';

  await Promise.allSettled(
    recipients.map((recipient) => {
      const text = [
        `Hi ${recipient.name},`,
        '',
        bodyStatusLine,
        `Class: ${args.schedule.title}`,
        `Subject: ${args.schedule.subject}`,
        `Teacher: ${args.schedule.teacher.name}`,
        args.type === 'rescheduled' ? `New Time: ${currentStart} (${timezone})` : '',
        args.type === 'rescheduled' && previousStart ? `Previous Time: ${previousStart} (${timezone})` : '',
        `Location: ${args.schedule.location || 'Online'}`,
        args.schedule.group ? `Group: ${args.schedule.group.name}` : '',
        args.schedule.meetingLink ? `Meeting Link: ${args.schedule.meetingLink}` : '',
      ].filter(Boolean).join('\n');

      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
          <p>Hi ${recipient.name},</p>
          <p><strong>${bodyStatusLine}</strong></p>
          <ul>
            <li><strong>Class:</strong> ${args.schedule.title}</li>
            <li><strong>Subject:</strong> ${args.schedule.subject}</li>
            <li><strong>Teacher:</strong> ${args.schedule.teacher.name}</li>
            ${args.type === 'rescheduled' ? `<li><strong>New Time:</strong> ${currentStart} (${timezone})</li>` : ''}
            ${args.type === 'rescheduled' && previousStart ? `<li><strong>Previous Time:</strong> ${previousStart} (${timezone})</li>` : ''}
            <li><strong>Location:</strong> ${args.schedule.location || 'Online'}</li>
            ${args.schedule.group ? `<li><strong>Group:</strong> ${args.schedule.group.name}</li>` : ''}
          </ul>
          ${args.schedule.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${args.schedule.meetingLink}">${args.schedule.meetingLink}</a></p>` : ''}
        </div>
      `;

      return sendMail({
        to: recipient.email,
        subject: `${subjectPrefix} • ${args.schedule.title}`,
        text,
        html,
        replyTo: args.schedule.teacher.email,
      });
    })
  );
}

async function sendScheduleUpdatedEmail(args: {
  schedule: ScheduleWithParticipants;
  previousStartUtc: Date | null;
  minutesOverride?: string | null;
  changedFields: {
    subjectChanged: boolean;
    descriptionChanged: boolean;
    meetingLinkChanged: boolean;
    timeChanged: boolean;
    meetingMinutesChanged: boolean;
  };
}) {
  const timezone = args.schedule.timezone || 'America/Los_Angeles';
  const recipients = getUniqueScheduleRecipients(args.schedule);
  if (recipients.length === 0) return;

  const currentStart = args.schedule.startDateTime
    ? formatWithTimezone(args.schedule.startDateTime, timezone)
    : 'TBD';
  const previousStart = args.previousStartUtc
    ? formatWithTimezone(args.previousStartUtc, timezone)
    : null;

  const onlyMeetingMinutesChanged =
    args.changedFields.meetingMinutesChanged &&
    !args.changedFields.subjectChanged &&
    !args.changedFields.descriptionChanged &&
    !args.changedFields.meetingLinkChanged &&
    !args.changedFields.timeChanged;

  const subjectPrefix = onlyMeetingMinutesChanged
    ? 'Meeting Minutes Updated'
    : 'Class Updated';

  const changedItems = [
    args.changedFields.subjectChanged ? 'Subject' : null,
    args.changedFields.descriptionChanged ? 'Description' : null,
    args.changedFields.meetingLinkChanged ? 'Meeting link' : null,
    args.changedFields.timeChanged ? 'Time' : null,
    args.changedFields.meetingMinutesChanged ? 'Meeting minutes' : null,
  ].filter(Boolean) as string[];

  const minutesText = args.minutesOverride ?? args.schedule.meetingMinutes;

  await Promise.allSettled(
    recipients.map((recipient) => {
      const text = [
        `Hi ${recipient.name},`,
        '',
        `The class details were updated by ${args.schedule.teacher.name}.`,
        `Class: ${args.schedule.title}`,
        `Subject: ${args.schedule.subject}`,
        `When: ${currentStart} (${timezone})`,
        previousStart && args.changedFields.timeChanged ? `Previous Time: ${previousStart} (${timezone})` : '',
        `Location: ${args.schedule.location || 'Online'}`,
        args.schedule.group ? `Group: ${args.schedule.group.name}` : '',
        args.schedule.meetingLink ? `Meeting Link: ${args.schedule.meetingLink}` : '',
        changedItems.length > 0 ? `Updated fields: ${changedItems.join(', ')}` : '',
        minutesText ? `Meeting Minutes: ${minutesText}` : '',
      ].filter(Boolean).join('\n');

      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
          <p>Hi ${recipient.name},</p>
          <p><strong>The class details were updated by ${args.schedule.teacher.name}.</strong></p>
          <ul>
            <li><strong>Class:</strong> ${args.schedule.title}</li>
            <li><strong>Subject:</strong> ${args.schedule.subject}</li>
            <li><strong>When:</strong> ${currentStart} (${timezone})</li>
            ${previousStart && args.changedFields.timeChanged ? `<li><strong>Previous Time:</strong> ${previousStart} (${timezone})</li>` : ''}
            <li><strong>Location:</strong> ${args.schedule.location || 'Online'}</li>
            ${args.schedule.group ? `<li><strong>Group:</strong> ${args.schedule.group.name}</li>` : ''}
            ${changedItems.length > 0 ? `<li><strong>Updated fields:</strong> ${changedItems.join(', ')}</li>` : ''}
          </ul>
          ${args.schedule.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${args.schedule.meetingLink}">${args.schedule.meetingLink}</a></p>` : ''}
          ${minutesText ? `<p><strong>Meeting Minutes:</strong><br/>${minutesText}</p>` : ''}
        </div>
      `;

      return sendMail({
        to: recipient.email,
        subject: `${subjectPrefix} • ${args.schedule.title}`,
        text,
        html,
        replyTo: args.schedule.teacher.email,
      });
    })
  );
}

async function sendPastMeetingMinutesUpdatedEmail(args: {
  schedule: ScheduleWithParticipants;
  meetingMinutesText?: string | null;
}) {
  const timezone = args.schedule.timezone || 'America/Los_Angeles';
  const recipients = getUniqueScheduleRecipients(args.schedule);
  if (recipients.length === 0) return;

  const scheduleTime = args.schedule.startDateTime
    ? formatWithTimezone(args.schedule.startDateTime, timezone)
    : 'TBD';

  const minutesText = args.meetingMinutesText ?? args.schedule.meetingMinutes;

  await Promise.allSettled(
    recipients.map((recipient) => {
      const text = [
        `Hi ${recipient.name},`,
        '',
        'Minutes of meeting have been updated for your completed class.',
        `Class: ${args.schedule.title}`,
        `Subject: ${args.schedule.subject}`,
        `When: ${scheduleTime} (${timezone})`,
        args.schedule.group ? `Group: ${args.schedule.group.name}` : '',
        '',
        'Updated Minutes of Meeting:',
        minutesText || 'No minutes provided.',
      ].filter(Boolean).join('\n');

      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
          <p>Hi ${recipient.name},</p>
          <p><strong>Minutes of meeting have been updated for your completed class.</strong></p>
          <ul>
            <li><strong>Class:</strong> ${args.schedule.title}</li>
            <li><strong>Subject:</strong> ${args.schedule.subject}</li>
            <li><strong>When:</strong> ${scheduleTime} (${timezone})</li>
            ${args.schedule.group ? `<li><strong>Group:</strong> ${args.schedule.group.name}</li>` : ''}
          </ul>
          <p><strong>Updated Minutes of Meeting:</strong></p>
          <p style="white-space:pre-wrap;">${minutesText || 'No minutes provided.'}</p>
        </div>
      `;

      return sendMail({
        to: recipient.email,
        subject: `Minutes of Meeting Updated • ${args.schedule.title}`,
        text,
        html,
        replyTo: args.schedule.teacher.email,
      });
    })
  );
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Extract query parameters
    const url = new URL(request.url);
    const teacherEmail = url.searchParams.get('teacherEmail');
    const studentId = url.searchParams.get('studentId');

    // Check if user is authorized (must be a teacher)
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    let teacher;
    if (teacherEmail) {
      // Fetch teacher by email
      teacher = await prisma.teacher.findUnique({
        where: { email: teacherEmail },
        select: { id: true, name: true, email: true }
      });
    } else {
      // Use authenticated user's email
      teacher = await prisma.teacher.findUnique({
        where: { email: user.email },
        select: { id: true, name: true, email: true }
      });
    }

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Build query filter based on parameters
    const filter: any = {
      teacherId: teacher.id
    };

    // Add student filter if provided.
    // Include:
    // 1) individual schedules assigned directly to the student
    // 2) group schedules where this student is a member of the group
    if (studentId) {
      const parsedStudentId = parseInt(studentId);
      const memberships = await prisma.studentGroupMember.findMany({
        where: {
          studentId: parsedStudentId,
          group: {
            teacherId: teacher.id,
          },
        },
        select: {
          groupId: true,
        },
      });

      const groupIds = memberships.map((membership) => membership.groupId);

      filter.OR = [
        { studentId: parsedStudentId },
        ...(groupIds.length ? [{ groupId: { in: groupIds } }] : []),
      ];
    }

    // Fetch class schedules
    const schedules = await prisma.classSchedule.findMany({
      where: filter,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            grade: true,
            program: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    let schedulesWithMinutes: typeof schedules = schedules;
    if (
      schedules.length > 0 &&
      !Object.prototype.hasOwnProperty.call(schedules[0], 'meetingMinutes')
    ) {
      const ids = schedules.map((schedule) => schedule.id);
      const rows = await prisma.$queryRaw<Array<{ id: number; meetingMinutes: string | null }>>`
        SELECT id, "meetingMinutes"
        FROM "ClassSchedule"
        WHERE id = ANY(ARRAY[${Prisma.join(ids)}]::int[])
      `;
      const minutesMap = new Map(rows.map((row) => [row.id, row.meetingMinutes]));
      schedulesWithMinutes = schedules.map((schedule) => ({
        ...schedule,
        meetingMinutes: minutesMap.get(schedule.id) ?? null,
      }));
    }

    // Format dates for JSON response
    const formattedSchedules = schedulesWithMinutes.map(schedule => {
      // Create a new object to avoid type issues
      return {
        ...schedule,
        date: schedule.date ? new Date(schedule.date).toISOString() : null,
        createdAt: schedule.createdAt ? new Date(schedule.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: schedule.updatedAt ? new Date(schedule.updatedAt).toISOString() : new Date().toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      schedules: formattedSchedules
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch schedules'
    }, { status: 500 });
  }
}

// POST endpoint to create or update a class schedule
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is authorized (must be a teacher)
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const requestData = await request.json();
    const {
      id,
      title,
      description,
      meetingMinutes,
      studentId,
      teacherId,
      subject,
      startTime,
      endTime,
      location,
      meetingLink,
      status,
      color,
      timezone, // Client's timezone for proper UTC conversion
      groupId   // Group ID if scheduled via a group
    } = requestData;
    
    // Default to America/Los_Angeles if no timezone provided (for backward compatibility)
    const clientTimezone = timezone || 'America/Los_Angeles';
    
    // Parse groupId if provided
    const parsedGroupId = groupId ? parseInt(groupId) : null;
    const parsedStudentId = parseInt(studentId);
    const normalizedMeetingMinutes = typeof meetingMinutes === 'string' && meetingMinutes.trim().length > 0
      ? meetingMinutes.trim()
      : null;
    if (!id && normalizedMeetingMinutes) {
      return NextResponse.json({
        success: false,
        error: 'Minutes of Meeting can only be added after the class ends.'
      }, { status: 400 });
    }

    // Validate required fields
    if (!title || !studentId || !subject || !startTime || !endTime) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, studentId, subject, startTime, endTime'
      }, { status: 400 });
    }

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid start or end time format'
      }, { status: 400 });
    }

    if (endMinutes <= startMinutes) {
      return NextResponse.json({
        success: false,
        error: 'End time must be after start time'
      }, { status: 400 });
    }

    const nowUtc = new Date();

    // Determine the teacher ID to use (from request or from user)
    let finalTeacherId = teacherId;
    if (!finalTeacherId) {
      // Get the teacher ID from the authenticated user
      const teacher = await prisma.teacher.findUnique({
        where: { email: user.email },
        select: { id: true }
      });

      if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
      }

      finalTeacherId = teacher.id;
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: parsedStudentId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    let schedule;
    let createdSchedulesForInvitation: Array<{
      id: number;
      title: string;
      subject: string;
      description: string | null;
      location: string | null;
      meetingLink: string | null;
      startTime: string;
      endTime: string;
      startDateTime: Date | null;
      endDateTime: Date | null;
      date: Date;
    }> = [];

    if (id) {
      // Update existing schedule
      // Get existing schedule to know the date for DateTime conversion
      const existingSchedule = await prisma.classSchedule.findUnique({
        where: { id: parseInt(id) },
        include: {
          student: {
            select: {
              name: true,
              email: true,
            },
          },
          teacher: {
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
      });

      if (!existingSchedule) {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
      }
      
      const scheduleDate = requestData.date 
        ? new Date(requestData.date) 
        : existingSchedule?.date;

      if (!scheduleDate) {
        return NextResponse.json({
          success: false,
          error: 'Date is required to update this schedule'
        }, { status: 400 });
      }

      const existingDateKey = getDateKey(existingSchedule.date);
      const incomingDateKey = getDateKey(scheduleDate);
      const existingTimezone = existingSchedule.timezone || clientTimezone || 'America/Los_Angeles';
      const existingEndUtc = existingSchedule.endDateTime
        ? new Date(existingSchedule.endDateTime)
        : convertToUTC(existingSchedule.date.toISOString(), existingSchedule.endTime, existingTimezone);
      const isPastMeeting = existingEndUtc <= nowUtc;
      const changedFields = {
        subjectChanged: existingSchedule.subject !== subject,
        descriptionChanged: (existingSchedule.description || '') !== (description || ''),
        meetingLinkChanged: (existingSchedule.meetingLink || '') !== ((requestData.meetingLink as string) || ''),
        timeChanged:
          existingSchedule.startTime !== startTime ||
          existingSchedule.endTime !== endTime ||
          existingDateKey !== incomingDateKey,
        meetingMinutesChanged: (existingSchedule.meetingMinutes || '') !== (normalizedMeetingMinutes || ''),
      };
      const hasAnyEditableChange = Object.values(changedFields).some(Boolean);

      if (isPastMeeting) {
        const pastInvalidChanges =
          changedFields.subjectChanged ||
          changedFields.descriptionChanged ||
          changedFields.meetingLinkChanged ||
          changedFields.timeChanged;

        if (pastInvalidChanges) {
          return NextResponse.json({
            success: false,
            error: 'For past meetings, only Minutes of Meeting can be updated.'
          }, { status: 400 });
        }
        } else if (changedFields.meetingMinutesChanged) {
          return NextResponse.json({
            success: false,
            error: 'Minutes of Meeting can only be updated after the class ends.'
          }, { status: 400 });
      }

      const updateStartUtc = convertToUTC(scheduleDate.toISOString(), startTime, clientTimezone);

      if (changedFields.timeChanged) {
        if (updateStartUtc <= nowUtc) {
          return NextResponse.json({
            success: false,
            error: 'Classes can only be scheduled for future times in your timezone'
          }, { status: 400 });
        }

        const scheduleDateKey = getDateKey(scheduleDate);
        const scheduleDayBounds = getDayBoundsFromDateKey(scheduleDateKey);

        const conflictingSchedule = await prisma.classSchedule.findFirst({
          where: {
            teacherId: finalTeacherId,
            studentId: parsedStudentId,
            id: { not: parseInt(id) },
            date: {
              gte: scheduleDayBounds.gte,
              lt: scheduleDayBounds.lt,
            },
          },
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            date: true,
          }
        });

        if (
          conflictingSchedule &&
          hasTimeOverlap(startTime, endTime, conflictingSchedule.startTime, conflictingSchedule.endTime)
        ) {
          return NextResponse.json({
            success: false,
            error: `Time overlap with existing class \"${conflictingSchedule.title}\" (${conflictingSchedule.startTime} - ${conflictingSchedule.endTime})`,
            conflict: conflictingSchedule
          }, { status: 409 });
        }
      }
      
      const updateData: any = {
        title,
        description,
        subject,
        location,
        startTime, // Just store the time string directly
        endTime,   // Just store the time string directly
        meetingLink: requestData.meetingLink,
        status: requestData.status || "scheduled",
        color: requestData.color || generateRandomColor(subject),
        updatedAt: new Date(),
        timezone: clientTimezone,
      };

      if (changedFields.timeChanged) {
        updateData.reminderSentAt = null;
        updateData.reminderJobId = null;
      }

      // Only update date if provided
      if (requestData.date) {
        updateData.date = new Date(requestData.date);
      }
      
      // Add UTC DateTime fields if we have the date
      if (changedFields.timeChanged && scheduleDate && startTime && endTime) {
        updateData.startDateTime = updateStartUtc;
        updateData.endDateTime = convertToUTC(scheduleDate.toISOString(), endTime, clientTimezone);
      }

      schedule = await prisma.classSchedule.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      if (isPastMeeting && changedFields.meetingMinutesChanged) {
        const minutesUpdatedAt = new Date();
        await updateMeetingMinutesRaw({
          scheduleId: schedule.id,
          meetingMinutes: normalizedMeetingMinutes,
          updatedAt: minutesUpdatedAt,
          groupId: existingSchedule.groupId ?? null,
          teacherId: existingSchedule.teacherId,
          date: existingSchedule.date,
          startTime: existingSchedule.startTime,
          endTime: existingSchedule.endTime,
          subject: existingSchedule.subject,
        });
      }

      if (changedFields.timeChanged) {
        const updatedStartUtc = schedule.startDateTime
          ? new Date(schedule.startDateTime)
          : convertToUTC(schedule.date.toISOString(), schedule.startTime, clientTimezone);

        const reminderScheduledFor = getReminderScheduledFor(updatedStartUtc);

        schedule = await prisma.classSchedule.update({
          where: { id: schedule.id },
          data: {
            reminderJobId: null,
            reminderScheduledFor,
            reminderSentAt: null,
          },
        });
      }

      const updatedScheduleWithParticipants = await prisma.classSchedule.findUnique({
        where: { id: schedule.id },
        include: {
          student: {
            select: {
              name: true,
              email: true,
            },
          },
          teacher: {
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
      });

      if (updatedScheduleWithParticipants && hasAnyEditableChange) {
        if (isPastMeeting && changedFields.meetingMinutesChanged) {
          await sendPastMeetingMinutesUpdatedEmail({
            schedule: updatedScheduleWithParticipants,
            meetingMinutesText: normalizedMeetingMinutes,
          });
        } else {
          await sendScheduleUpdatedEmail({
            schedule: updatedScheduleWithParticipants,
            previousStartUtc: existingSchedule.startDateTime,
            minutesOverride: isPastMeeting ? normalizedMeetingMinutes : undefined,
            changedFields,
          });
        }
      }
    } else {
      // Create new schedule - date is required
      if (!requestData.date) {
        return NextResponse.json(
          { success: false, error: 'Date is required for new schedule' },
          { status: 400 }
        );
      }

      const { isRecurring, recurrencePattern, recurrenceEndDate } = requestData;

      if (isRecurring && recurrencePattern && recurrenceEndDate) {
        // Handle recurrence
        const startDate = new Date(requestData.date);
        const endDate = new Date(recurrenceEndDate);

        if (endDate < startDate) {
          return NextResponse.json({
            success: false,
            error: 'Recurrence end date cannot be before start date'
          }, { status: 400 });
        }

        const eventsToCreate = [];

        let currentDate = new Date(startDate);

        // Loop to generate dates
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString();
          const occurrenceStartUtc = convertToUTC(dateStr, startTime, clientTimezone);

          if (occurrenceStartUtc <= nowUtc) {
            return NextResponse.json({
              success: false,
              error: `Recurring class on ${getDateKey(currentDate)} starts in the past. Please choose future dates/times only.`
            }, { status: 400 });
          }

          eventsToCreate.push({
            title,
            description,
            studentId: parsedStudentId,
            teacherId: finalTeacherId,
            groupId: parsedGroupId,
            subject,
            date: new Date(currentDate),
            startTime,
            endTime,
            startDateTime: occurrenceStartUtc,
            endDateTime: convertToUTC(dateStr, endTime, clientTimezone),
            timezone: clientTimezone,
            location,
            meetingLink: requestData.meetingLink || null,
            status: "scheduled",
            color: generateRandomColor(subject),
            updatedAt: new Date()
          }); // removed createdAt to let DB handle default or add if needed

          // Increment date based on pattern
          if (recurrencePattern === 'weekly') {
            currentDate.setDate(currentDate.getDate() + 7);
          } else if (recurrencePattern === 'biweekly') {
            currentDate.setDate(currentDate.getDate() + 14);
          } else if (recurrencePattern === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          } else {
            break; // Unknown pattern, prevent infinite loop
          }
        }

        if (eventsToCreate.length > 0) {
          const occurrenceDateKeys = eventsToCreate.map((event) => getDateKey(event.date));
          const minDateKey = occurrenceDateKeys.reduce((min, current) => current < min ? current : min, occurrenceDateKeys[0]);
          const maxDateKey = occurrenceDateKeys.reduce((max, current) => current > max ? current : max, occurrenceDateKeys[0]);
          const minBounds = getDayBoundsFromDateKey(minDateKey);
          const maxBounds = getDayBoundsFromDateKey(maxDateKey);

          const existingSchedules = await prisma.classSchedule.findMany({
            where: {
              teacherId: finalTeacherId,
              studentId: parsedStudentId,
              date: {
                gte: minBounds.gte,
                lt: maxBounds.lt,
              },
            },
            select: {
              id: true,
              title: true,
              date: true,
              startTime: true,
              endTime: true,
            }
          });

          const conflict = eventsToCreate.find((candidate) => {
            const candidateDateKey = getDateKey(candidate.date);
            return existingSchedules.some((existing) => {
              if (getDateKey(existing.date) !== candidateDateKey) return false;
              return hasTimeOverlap(candidate.startTime, candidate.endTime, existing.startTime, existing.endTime);
            });
          });

          if (conflict) {
            const candidateDateKey = getDateKey(conflict.date);
            const conflictingSchedule = existingSchedules.find((existing) => {
              if (getDateKey(existing.date) !== candidateDateKey) return false;
              return hasTimeOverlap(conflict.startTime, conflict.endTime, existing.startTime, existing.endTime);
            });

            return NextResponse.json({
              success: false,
              error: `Recurring schedule conflict on ${candidateDateKey} with \"${conflictingSchedule?.title}\" (${conflictingSchedule?.startTime} - ${conflictingSchedule?.endTime})`,
              conflict: conflictingSchedule
            }, { status: 409 });
          }

          const createdSchedules = await prisma.$transaction(
            eventsToCreate.map((eventData) => prisma.classSchedule.create({ data: eventData }))
          );

          schedule = createdSchedules[0];
          createdSchedulesForInvitation = createdSchedules;
        } else {
          // Should not happen if start <= end
          return NextResponse.json({ success: false, error: 'Invalid date range for recurrence' }, { status: 400 });
        }

      } else {
        // Single event creation
        const dateStr = new Date(requestData.date).toISOString();
        const singleStartUtc = convertToUTC(dateStr, startTime, clientTimezone);

        if (singleStartUtc <= nowUtc) {
          return NextResponse.json({
            success: false,
            error: 'Classes can only be scheduled for future times in your timezone'
          }, { status: 400 });
        }

        const scheduleDateKey = getDateKey(requestData.date);
        const scheduleDayBounds = getDayBoundsFromDateKey(scheduleDateKey);

        const existingSchedules = await prisma.classSchedule.findMany({
          where: {
            teacherId: finalTeacherId,
            studentId: parsedStudentId,
            date: {
              gte: scheduleDayBounds.gte,
              lt: scheduleDayBounds.lt,
            },
          },
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            date: true,
          }
        });

        const conflictingSchedule = existingSchedules.find((existing) =>
          hasTimeOverlap(startTime, endTime, existing.startTime, existing.endTime)
        );

        if (conflictingSchedule) {
          return NextResponse.json({
            success: false,
            error: `Time overlap with existing class \"${conflictingSchedule.title}\" (${conflictingSchedule.startTime} - ${conflictingSchedule.endTime})`,
            conflict: conflictingSchedule
          }, { status: 409 });
        }

        schedule = await prisma.classSchedule.create({
          data: {
            title,
            description,
            studentId: parsedStudentId,
            teacherId: finalTeacherId,
            groupId: parsedGroupId,
            subject,
            date: new Date(requestData.date),
            startTime, // Just store the time string directly
            endTime,   // Just store the time string directly
            startDateTime: singleStartUtc,
            endDateTime: convertToUTC(dateStr, endTime, clientTimezone),
            timezone: clientTimezone,
            location,
            meetingLink: requestData.meetingLink || null,
            status: "scheduled",
            color: generateRandomColor(subject),
            updatedAt: new Date()
          } as any
        });

        createdSchedulesForInvitation = [schedule];
      }
    }

    let invitationStatus: { attempted: number; sent: number; failed: number } | undefined;
    let reminderSchedulingStatus: { scheduled: number; skipped: number; failed: number } | undefined;

    if (!id && createdSchedulesForInvitation.length > 0) {
      const teacherInfo = await prisma.teacher.findUnique({
        where: { id: finalTeacherId },
        select: { name: true, email: true }
      });

      let groupName: string | undefined;
      let recipients: Array<{ email: string; name: string }> = [];

      if (parsedGroupId) {
        const group = await prisma.studentGroup.findUnique({
          where: { id: parsedGroupId },
          select: {
            name: true,
            teacherId: true,
            members: {
              select: {
                student: {
                  select: {
                    email: true,
                    name: true,
                  }
                }
              }
            }
          }
        });

        if (group && group.teacherId === finalTeacherId) {
          groupName = group.name;
          recipients = group.members
            .map((member) => ({
              email: member.student.email,
              name: member.student.name,
            }))
            .filter((recipient) => !!recipient.email);
        }
      } else {
        const invitationStudent = await prisma.student.findUnique({
          where: { id: parsedStudentId },
          select: { email: true, name: true }
        });

        if (invitationStudent?.email) {
          recipients = [{ email: invitationStudent.email, name: invitationStudent.name }];
        }
      }

      const uniqueRecipients = Array.from(
        new Map(recipients.map((recipient) => [recipient.email.toLowerCase(), recipient])).values()
      );

      if (teacherInfo && uniqueRecipients.length > 0) {
        const inviteResults = await Promise.allSettled(
          createdSchedulesForInvitation.map(async (createdSchedule) => {
            const startUtc = createdSchedule.startDateTime
              ? new Date(createdSchedule.startDateTime)
              : convertToUTC(createdSchedule.date.toISOString(), createdSchedule.startTime, clientTimezone);

            const endUtc = createdSchedule.endDateTime
              ? new Date(createdSchedule.endDateTime)
              : convertToUTC(createdSchedule.date.toISOString(), createdSchedule.endTime, clientTimezone);

            return sendScheduleInvitations({
              teacherName: teacherInfo.name || 'Your teacher',
              teacherEmail: teacherInfo.email,
              title: createdSchedule.title,
              subject: createdSchedule.subject,
              description: createdSchedule.description,
              location: createdSchedule.location,
              meetingLink: createdSchedule.meetingLink,
              startUtc,
              endUtc,
              startTime: createdSchedule.startTime,
              endTime: createdSchedule.endTime,
              timezone: clientTimezone,
              recipients: uniqueRecipients,
              groupName,
            });
          })
        );

        invitationStatus = inviteResults.reduce(
          (acc, result) => {
            if (result.status === 'fulfilled') {
              acc.attempted += result.value.attempted;
              acc.sent += result.value.sent;
              acc.failed += result.value.failed;
            }
            return acc;
          },
          { attempted: 0, sent: 0, failed: 0 }
        );
      }
    }

    if (!id && createdSchedulesForInvitation.length > 0) {
      const reminderResults = await Promise.allSettled(
        createdSchedulesForInvitation.map(async (createdSchedule) => {
          const startUtc = createdSchedule.startDateTime
            ? new Date(createdSchedule.startDateTime)
            : convertToUTC(createdSchedule.date.toISOString(), createdSchedule.startTime, clientTimezone);

          const reminderScheduledFor = getReminderScheduledFor(startUtc);

          await prisma.classSchedule.update({
            where: { id: createdSchedule.id },
            data: {
              reminderJobId: null,
              reminderScheduledFor,
              reminderSentAt: null,
            },
          });

          return reminderScheduledFor;
        })
      );

      reminderSchedulingStatus = reminderResults.reduce(
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
    }

    // Format dates for response
    const formattedSchedule = {
      ...schedule,
      date: schedule.date ? new Date(schedule.date).toISOString() : null,
      createdAt: schedule.createdAt ? new Date(schedule.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: schedule.updatedAt ? new Date(schedule.updatedAt).toISOString() : new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      schedule: formattedSchedule,
      invitationStatus,
      reminderSchedulingStatus
    }, { status: id ? 200 : 201 });

  } catch (error: any) {
    console.error('Error saving schedule:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save schedule'
    }, { status: 500 });
  }
}

// DELETE endpoint to remove a class schedule
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is authorized (must be a teacher)
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Extract the schedule ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing schedule ID'
      }, { status: 400 });
    }

    // Verify the schedule belongs to this teacher
    const teacherEmail = user.email;
    const teacher = await prisma.teacher.findUnique({
      where: { email: teacherEmail },
      select: { id: true }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const schedule = await prisma.classSchedule.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
        teacher: {
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
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Check if the schedule belongs to this teacher
    if (schedule.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this schedule' }, { status: 403 });
    }

    await sendScheduleStatusEmail({
      type: 'cancelled',
      schedule,
    });

    // Delete the schedule
    await prisma.classSchedule.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete schedule'
    }, { status: 500 });
  }
}
