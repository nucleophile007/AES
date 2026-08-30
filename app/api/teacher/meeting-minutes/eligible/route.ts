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
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);
    const previousDateKey = [
      previousDate.getUTCFullYear(),
      String(previousDate.getUTCMonth() + 1).padStart(2, '0'),
      String(previousDate.getUTCDate()).padStart(2, '0'),
    ].join('-');
    const previousBounds = zonedDayBounds(previousDateKey, timezone);

    const credentials = await getTeacherCalendarCredentials(user.email);
    if (!credentials.teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    if (!credentials.accessToken) {
      return NextResponse.json({
        error: credentials.needsReconnect ? 'Google Calendar needs reconnection' : 'Google Calendar is not connected',
        needsReconnect: credentials.needsReconnect,
      }, { status: 409 });
    }

    const events = await listCalendarEvents(
      credentials.accessToken,
      credentials.teacher.googleRefreshToken || undefined,
      previousBounds.start,
      bounds.end
    );
    const attendeeEmails = Array.from(new Set(events.flatMap((event) =>
      (event.attendees || []).map((attendee) => normalizeEmail(attendee.email)).filter(Boolean)
    )));
    const linkedStudents = attendeeEmails.length ? await prisma.student.findMany({
      where: {
        email: { in: attendeeEmails, mode: 'insensitive' },
        teacherLinks: { some: { teacherId: credentials.teacher.id } },
      },
      select: { id: true, name: true, email: true },
    }) : [];
    const studentByEmail = new Map(linkedStudents.map((student) => [normalizeEmail(student.email), student]));
    const googleEventIds = events.flatMap((event) => event.id ? [event.id] : []);
    const existingMeetings = googleEventIds.length ? await prisma.meetingMinuteMeeting.findMany({
      where: { teacherId: credentials.teacher.id, googleCalendarEventId: { in: googleEventIds } },
      select: { googleCalendarEventId: true, requests: { select: { studentId: true, status: true } } },
    }) : [];
    const requestByEventAndStudent = new Map(existingMeetings.flatMap((meeting) =>
      meeting.googleCalendarEventId
        ? meeting.requests.map((minuteRequest) => [`${meeting.googleCalendarEventId}:${minuteRequest.studentId}`, minuteRequest.status] as const)
        : []
    ));

    const meetings = events.filter((event) => isEligibleGoogleMeeting(event)).flatMap((event) => {
      const times = googleEventDateTimes(event);
      if (!event.id || !times) return [];
      const rawAttendees = (event.attendees || [])
        .filter((attendee) => !attendee.self && attendee.email)
        .map((attendee) => ({ email: attendee.email!, name: attendee.displayName || attendee.email! }));
      const matchedStudents = Array.from(new Map(rawAttendees.flatMap((attendee) => {
        const student = studentByEmail.get(normalizeEmail(attendee.email));
        return student ? [[student.id, student] as const] : [];
      })).values()).map((student) => ({
        ...student,
        requestStatus: requestByEventAndStudent.get(`${event.id}:${student.id}`) || null,
      }));
      const unmatchedAttendees = rawAttendees.filter((attendee) => !studentByEmail.has(normalizeEmail(attendee.email)));
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
      }];
    });

    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch meetings';
    return NextResponse.json({ error: message }, { status: message === 'Invalid date or timezone' ? 400 : 500 });
  }
}
