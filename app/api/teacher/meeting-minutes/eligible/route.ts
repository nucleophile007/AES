import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listCalendarEvents } from '@/lib/google-calendar';
import { getTeacherCalendarCredentials } from '@/lib/teacher-calendar';
import {
  getGoogleMeetingLink,
  googleEventDateTimes,
  isEligibleGoogleMeeting,
  normalizeEmail,
  zonedDayBounds,
} from '@/lib/meeting-minutes';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const date = request.nextUrl.searchParams.get('date');
    const timezone = request.nextUrl.searchParams.get('timezone') || 'America/Los_Angeles';
    if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    const bounds = zonedDayBounds(date, timezone);
    const [year, month, day] = date.split('-').map(Number);
    const previousDate = new Date(Date.UTC(year, month - 1, day));
    previousDate.setUTCDate(previousDate.getUTCDate() - 7);
    const previousDateKey = [
      previousDate.getUTCFullYear(),
      String(previousDate.getUTCMonth() + 1).padStart(2, '0'),
      String(previousDate.getUTCDate()).padStart(2, '0'),
    ].join('-');
    const previousBounds = zonedDayBounds(previousDateKey, timezone);

    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email },
      select: { id: true, email: true, googleCalendarConnected: true },
    });
    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

    // 1. Fetch Google Calendar events if connected
    let googleEvents: any[] = [];
    try {
      const credentials = await getTeacherCalendarCredentials(user.email);
      if (credentials.accessToken) {
        googleEvents = await listCalendarEvents(
          credentials.accessToken,
          credentials.teacher?.googleRefreshToken || undefined,
          previousBounds.start,
          bounds.end
        );
      }
    } catch (gcalError) {
      console.warn('Google Calendar fetch error in meeting minutes eligible route (falling back to database schedules):', gcalError);
    }

    // 2. Fetch completed AES ClassSchedule database items for past 7 days
    const dbSchedules = await prisma.classSchedule.findMany({
      where: {
        teacherId: teacher.id,
        date: { gte: previousBounds.start, lte: bounds.end },
        status: { notIn: ['cancelled'] },
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        group: {
          include: {
            members: {
              include: {
                student: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    const now = new Date();
    const completedDbSchedules = dbSchedules.filter((schedule) => {
      const [endH, endM] = (schedule.endTime || '23:59').split(':').map(Number);
      const scheduleEnd = new Date(schedule.date);
      scheduleEnd.setHours(endH || 0, endM || 0, 0, 0);
      return scheduleEnd <= now;
    });

    // 3. Fetch existing meeting minute requests for status mapping
    const existingMeetings = await prisma.meetingMinuteMeeting.findMany({
      where: { teacherId: teacher.id },
      select: {
        id: true,
        googleCalendarEventId: true,
        classScheduleId: true,
        requests: { select: { studentId: true, status: true } },
      },
    });

    const requestByEventAndStudent = new Map<string, string>();
    for (const meeting of existingMeetings) {
      for (const req of meeting.requests) {
        if (meeting.googleCalendarEventId) {
          requestByEventAndStudent.set(`${meeting.googleCalendarEventId}:${req.studentId}`, req.status);
        }
        if (meeting.classScheduleId) {
          requestByEventAndStudent.set(`schedule:${meeting.classScheduleId}:${req.studentId}`, req.status);
        }
      }
    }

    // 4. Process Google Calendar meetings
    const attendeeEmails = Array.from(new Set(googleEvents.flatMap((event) =>
      (event.attendees || []).map((attendee: any) => normalizeEmail(attendee.email)).filter(Boolean)
    )));
    const linkedStudents = attendeeEmails.length ? await prisma.student.findMany({
      where: {
        email: { in: attendeeEmails, mode: 'insensitive' },
        teacherLinks: { some: { teacherId: teacher.id } },
      },
      select: { id: true, name: true, email: true },
    }) : [];
    const studentByEmail = new Map(linkedStudents.map((student) => [normalizeEmail(student.email), student]));

    const processedGoogleEventIds = new Set<string>();
    const googleMeetings = googleEvents.filter((event) => isEligibleGoogleMeeting(event, now)).flatMap((event) => {
      const times = googleEventDateTimes(event);
      if (!event.id || !times) return [];
      processedGoogleEventIds.add(event.id);

      const rawAttendees = (event.attendees || [])
        .filter((attendee: any) => !attendee.self && attendee.email)
        .map((attendee: any) => ({ email: attendee.email!, name: attendee.displayName || attendee.email! }));
      const matchedStudents = Array.from(new Map<number, { id: number; name: string; email: string }>(rawAttendees.flatMap((attendee: any) => {
        const student = studentByEmail.get(normalizeEmail(attendee.email));
        return student ? [[student.id, student] as const] : [];
      })).values()).map((student) => ({
        ...student,
        requestStatus: requestByEventAndStudent.get(`${event.id}:${student.id}`) || null,
      }));
      const unmatchedAttendees = rawAttendees.filter((attendee: any) => !studentByEmail.has(normalizeEmail(attendee.email)));
      return [{
        id: event.id,
        title: event.summary || 'Untitled meeting',
        description: event.description || null,
        startDateTime: times.start.toISOString(),
        endDateTime: times.end.toISOString(),
        location: event.location || null,
        meetingLink: getGoogleMeetingLink(event),
        attendees: matchedStudents,
        unmatchedAttendees,
        source: 'GOOGLE' as const,
      }];
    });

    // 5. Process AES ClassSchedule database items (deduplicated against Google events)
    const dbMeetings = completedDbSchedules.flatMap((schedule) => {
      if (schedule.googleCalendarEventId && processedGoogleEventIds.has(schedule.googleCalendarEventId)) {
        return []; // Already included via Google Calendar API
      }

      const meetingId = schedule.googleCalendarEventId || `aes:schedule:${schedule.id}`;
      const [startH, startM] = (schedule.startTime || '00:00').split(':').map(Number);
      const [endH, endM] = (schedule.endTime || '00:00').split(':').map(Number);
      const startDate = new Date(schedule.date);
      startDate.setHours(startH || 0, startM || 0, 0, 0);
      const endDate = new Date(schedule.date);
      endDate.setHours(endH || 0, endM || 0, 0, 0);

      const rawAttendees = schedule.group
        ? schedule.group.members.map((m) => m.student)
        : [schedule.student];
      const attendees = rawAttendees.map((student) => ({
        ...student,
        requestStatus:
          requestByEventAndStudent.get(`${meetingId}:${student.id}`) ||
          requestByEventAndStudent.get(`schedule:${schedule.id}:${student.id}`) ||
          null,
      }));

      return [{
        id: meetingId,
        title: schedule.title || `Class with ${schedule.student.name}`,
        description: schedule.description || null,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        location: schedule.location || null,
        meetingLink: schedule.meetingLink || null,
        attendees,
        unmatchedAttendees: [],
        source: 'AES_SCHEDULE' as const,
        scheduleId: schedule.id,
      }];
    });

    // Merge and sort by startDateTime descending
    const meetings = [...googleMeetings, ...dbMeetings].sort(
      (a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime()
    );

    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch meetings';
    return NextResponse.json({ error: message }, { status: message === 'Invalid date or timezone' ? 400 : 500 });
  }
}
