import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  refreshAccessToken,
} from '@/lib/google-calendar';
import { getUserFromRequest, hasRole } from '../../../../../lib/auth';

interface SyncRequest {
  teacherEmail: string;
  action: 'create' | 'update' | 'delete';
  scheduleId: number;
  timezone?: string; // User's timezone from browser
  eventData?: {
    title?: string;
    description?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    meetingLink?: string;
    studentName?: string;
    subject?: string;
    googleCalendarEventId?: string;
  };
}

function buildGoogleAttendees(schedule: {
  student: { email: string; name: string };
  group?: {
    members: Array<{ student: { email: string; name: string } }>;
  } | null;
}) {
  const recipients = schedule.group
    ? schedule.group.members.map((member) => ({
        email: member.student.email,
        displayName: member.student.name,
      }))
    : [{ email: schedule.student.email, displayName: schedule.student.name }];

  return Array.from(
    new Map(recipients.filter((recipient) => !!recipient.email).map((recipient) => [recipient.email.toLowerCase(), recipient])).values()
  );
}

async function getValidAccessToken(teacher: {
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  googleTokenExpiry: Date | null;
  email: string;
}): Promise<string | null> {
  if (!teacher.googleAccessToken) return null;

  // Check if token is expired
  const isExpired = teacher.googleTokenExpiry
    ? new Date() > new Date(teacher.googleTokenExpiry)
    : false;

  if (!isExpired) {
    return teacher.googleAccessToken;
  }

  // Try to refresh the token
  if (teacher.googleRefreshToken) {
    const newTokens = await refreshAccessToken(teacher.googleRefreshToken);
    if (newTokens) {
      // Update the token in the database
      await prisma.teacher.update({
        where: { email: teacher.email },
        data: {
          googleAccessToken: newTokens.accessToken,
          googleTokenExpiry: newTokens.expiry,
        },
      });
      return newTokens.accessToken;
    }
    
    // Refresh token is invalid (expired after 7 days in testing mode)
    // Auto-disconnect to prompt user to reconnect
    console.log('Refresh token expired for', teacher.email, '- auto-disconnecting');
    await prisma.teacher.update({
      where: { email: teacher.email },
      data: {
        googleCalendarConnected: false,
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      },
    });
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const body: SyncRequest = await request.json();
    const { teacherEmail, action, scheduleId, eventData, timezone } = body;
    const fallbackGoogleEventId = eventData?.googleCalendarEventId?.trim() || null;

    // Default to America/Los_Angeles if no timezone provided
    const userTimezone = timezone || 'America/Los_Angeles';

    if (!action || !scheduleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (teacherEmail && teacherEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Get authenticated teacher with Google Calendar credentials
    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        email: true,
        googleCalendarConnected: true,
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    if (!teacher.googleCalendarConnected) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }

    const accessToken = await getValidAccessToken(teacher);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unable to authenticate with Google Calendar', needsReconnect: true },
        { status: 401 }
      );
    }

    // Get the schedule record
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        student: true,
        group: {
          include: {
            members: {
              include: {
                student: true,
              },
            },
          },
        },
      },
    });

    if (!schedule && action !== 'delete') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    if (!schedule && action === 'delete' && !fallbackGoogleEventId) {
      return NextResponse.json(
        { error: 'Schedule not found and Google event ID missing' },
        { status: 404 }
      );
    }

    if (schedule && schedule.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    let result;

    switch (action) {
      case 'create': {
        if (!eventData || !schedule) {
          return NextResponse.json(
            { error: 'Event data is required for create action' },
            { status: 400 }
          );
        }
        const { title, date, startTime, endTime } = eventData;
        if (!title || !date || !startTime || !endTime) {
          return NextResponse.json(
            { error: 'Missing required event fields for create action' },
            { status: 400 }
          );
        }

        const startDateTime = `${date}T${startTime}:00`;
        const endDateTime = `${date}T${endTime}:00`;

        const description = `Student: ${eventData.studentName || schedule.student.name}\nSubject: ${eventData.subject || schedule.subject}${eventData.description ? `\n\n${eventData.description}` : ''}`;
        const attendees = buildGoogleAttendees(schedule);

        const googleEventId = await createCalendarEvent(
          accessToken,
          teacher.googleRefreshToken || undefined,
          {
            title,
            description,
            startTime: startDateTime,
            endTime: endDateTime,
            location: eventData.location,
            meetingLink: eventData.meetingLink,
            timezone: userTimezone,
            attendees,
            reminderMinutes: 60,
          }
        );

        if (googleEventId) {
          await prisma.classSchedule.update({
            where: { id: scheduleId },
            data: { googleCalendarEventId: googleEventId },
          });
        }

        result = { success: true, googleEventId };
        break;
      }

      case 'update': {
        if (!eventData || !schedule) {
          return NextResponse.json(
            { error: 'Event data is required for update action' },
            { status: 400 }
          );
        }
        const { title, date, startTime, endTime } = eventData;
        if (!title || !date || !startTime || !endTime) {
          return NextResponse.json(
            { error: 'Missing required event fields for update action' },
            { status: 400 }
          );
        }

        if (!schedule.googleCalendarEventId) {
          const startDateTime = `${date}T${startTime}:00`;
          const endDateTime = `${date}T${endTime}:00`;

          const description = `Student: ${eventData.studentName || schedule.student.name}\nSubject: ${eventData.subject || schedule.subject}${eventData.description ? `\n\n${eventData.description}` : ''}`;
          const attendees = buildGoogleAttendees(schedule);

          const googleEventId = await createCalendarEvent(
            accessToken,
            teacher.googleRefreshToken || undefined,
            {
              title,
              description,
              startTime: startDateTime,
              endTime: endDateTime,
              location: eventData.location,
              meetingLink: eventData.meetingLink,
              timezone: userTimezone,
              attendees,
              reminderMinutes: 60,
            }
          );

          if (googleEventId) {
            await prisma.classSchedule.update({
              where: { id: scheduleId },
              data: { googleCalendarEventId: googleEventId },
            });
          }

          result = { success: true, googleEventId, created: true };
        } else {
          const startDateTime = `${date}T${startTime}:00`;
          const endDateTime = `${date}T${endTime}:00`;

          const description = `Student: ${eventData.studentName || schedule.student.name}\nSubject: ${eventData.subject || schedule.subject}${eventData.description ? `\n\n${eventData.description}` : ''}`;
          const attendees = buildGoogleAttendees(schedule);

          await updateCalendarEvent(
            accessToken,
            teacher.googleRefreshToken || undefined,
            schedule.googleCalendarEventId,
            {
              title,
              description,
              startTime: startDateTime,
              endTime: endDateTime,
              location: eventData.location,
              meetingLink: eventData.meetingLink,
              timezone: userTimezone,
              attendees,
              reminderMinutes: 60,
            }
          );

          result = { success: true, updated: true };
        }
        break;
      }

      case 'delete': {
        const googleEventId = schedule?.googleCalendarEventId || fallbackGoogleEventId;

        if (googleEventId) {
          try {
            await deleteCalendarEvent(
              accessToken,
              teacher.googleRefreshToken || undefined,
              googleEventId
            );
          } catch (error) {
            console.warn('Error deleting from Google Calendar:', error);
          }
        }

        if (schedule?.googleCalendarEventId) {
          await prisma.classSchedule.update({
            where: { id: scheduleId },
            data: { googleCalendarEventId: null },
          });
        }

        result = {
          success: true,
          deleted: true,
          scheduleFound: !!schedule,
          googleEventDeleted: !!googleEventId,
        };
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Google Calendar' },
      { status: 500 }
    );
  }
}

// Bulk sync all existing events
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const { teacherEmail, timezone } = await request.json();
    const userTimezone = timezone || 'America/Los_Angeles';

    if (teacherEmail && String(teacherEmail).toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        email: true,
        googleCalendarConnected: true,
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!teacher || !teacher.googleCalendarConnected) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }

    const accessToken = await getValidAccessToken(teacher);
    if (!accessToken) {
      return NextResponse.json({ error: 'Unable to authenticate' }, { status: 401 });
    }

    const schedules = await prisma.classSchedule.findMany({
      where: {
        teacherId: teacher.id,
        googleCalendarEventId: null,
      },
      include: {
        student: true,
        group: {
          include: {
            members: {
              include: {
                student: true,
              },
            },
          },
        },
      },
    });

    let synced = 0;
    let failed = 0;

    for (const schedule of schedules) {
      try {
        const dateStr = schedule.date.toISOString().split('T')[0];
        const startDateTime = `${dateStr}T${schedule.startTime}:00`;
        const endDateTime = `${dateStr}T${schedule.endTime}:00`;

        const description = `Student: ${schedule.student.name}\nSubject: ${schedule.subject}${schedule.description ? `\n\n${schedule.description}` : ''}`;
        const attendees = buildGoogleAttendees(schedule);

        const googleEventId = await createCalendarEvent(
          accessToken,
          teacher.googleRefreshToken || undefined,
          {
            title: schedule.title,
            description,
            startTime: startDateTime,
            endTime: endDateTime,
            location: schedule.location || undefined,
            meetingLink: schedule.meetingLink || undefined,
            timezone: userTimezone,
            attendees,
            reminderMinutes: 60,
          }
        );

        if (googleEventId) {
          await prisma.classSchedule.update({
            where: { id: schedule.id },
            data: { googleCalendarEventId: googleEventId },
          });
          synced++;
        }
      } catch (error) {
        console.error(`Failed to sync schedule ${schedule.id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      failed,
      total: schedules.length,
    });
  } catch (error) {
    console.error('Error bulk syncing to Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to bulk sync' },
      { status: 500 }
    );
  }
}
