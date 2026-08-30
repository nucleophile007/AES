import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCalendarEvent } from '@/lib/google-calendar';
import { getTeacherCalendarCredentials } from '@/lib/teacher-calendar';
import { getGoogleMeetingLink, googleEventDateTimes, isEligibleGoogleMeeting, normalizeEmail, validateMinutesText } from '@/lib/meeting-minutes';
import { getApplicationUrl, sendAcademicNotification } from '@/lib/academic-notifications';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const body = await request.json();
    const eventId = typeof body.googleCalendarEventId === 'string' ? body.googleCalendarEventId.trim() : '';
    const studentIds: number[] = Array.from(new Set<number>(Array.isArray(body.studentIds)
      ? body.studentIds.map(Number).filter((id: number) => Number.isInteger(id))
      : []));
    const timezone = typeof body.timezone === 'string' ? body.timezone : 'America/Los_Angeles';
    const minutes = validateMinutesText(body.minutes);
    const overrideExisting = body.overrideExisting === true;
    if (!eventId || studentIds.length === 0) {
      return NextResponse.json({ error: 'Meeting and at least one student are required' }, { status: 400 });
    }

    const credentials = await getTeacherCalendarCredentials(user.email);
    if (!credentials.teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    if (!credentials.accessToken) {
      return NextResponse.json({ error: 'Google Calendar is not connected', needsReconnect: credentials.needsReconnect }, { status: 409 });
    }
    const teacher = await prisma.teacher.findUnique({
      where: { id: credentials.teacher.id },
      select: { id: true, name: true, email: true },
    });
    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

    const event = await getCalendarEvent(credentials.accessToken, credentials.teacher.googleRefreshToken || undefined, eventId);
    const times = googleEventDateTimes(event);
    if (!isEligibleGoogleMeeting(event) || !times) {
      return NextResponse.json({ error: 'Meeting is not an eligible completed event organized by you' }, { status: 400 });
    }

    const attendeeEmails = new Set((event.attendees || []).map((attendee) => normalizeEmail(attendee.email)).filter(Boolean));
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds }, teacherLinks: { some: { teacherId: teacher.id } } },
      include: { parentAccount: { select: { name: true, email: true } } },
    });
    const validStudents = students.filter((student) => attendeeEmails.has(normalizeEmail(student.email)));
    if (validStudents.length !== studentIds.length) {
      return NextResponse.json({ error: 'One or more students are not linked attendees of this meeting' }, { status: 403 });
    }

    const meeting = await prisma.meetingMinuteMeeting.upsert({
      where: { teacherId_googleCalendarEventId: { teacherId: teacher.id, googleCalendarEventId: eventId } },
      update: {
        title: event.summary || 'Untitled meeting', description: event.description || null,
        meetingLink: getGoogleMeetingLink(event), location: event.location || null,
        startDateTime: times.start, endDateTime: times.end, timezone,
        attendeeSnapshot: (event.attendees || []).map((attendee) => ({ email: attendee.email, name: attendee.displayName, responseStatus: attendee.responseStatus })),
      },
      create: {
        teacherId: teacher.id, source: 'GOOGLE', googleCalendarEventId: eventId,
        title: event.summary || 'Untitled meeting', description: event.description || null,
        meetingLink: getGoogleMeetingLink(event), location: event.location || null,
        startDateTime: times.start, endDateTime: times.end, timezone,
        attendeeSnapshot: (event.attendees || []).map((attendee) => ({ email: attendee.email, name: attendee.displayName, responseStatus: attendee.responseStatus })),
      },
    });

    const existing = await prisma.meetingMinuteRequest.findMany({
      where: { meetingId: meeting.id, studentId: { in: studentIds } },
      include: { student: { select: { id: true, name: true, email: true } } },
    });
    const conflicts = existing.filter((item) => item.creationMode === 'STUDENT_ASSIGNED');
    if (conflicts.length > 0 && !overrideExisting) {
      return NextResponse.json({
        error: 'Some students already have student-assigned minutes for this meeting.',
        requiresConfirmation: true,
        conflicts: conflicts.map((item) => ({ studentId: item.studentId, studentName: item.student.name, status: item.status })),
      }, { status: 409 });
    }

    const now = new Date();
    await prisma.$transaction(validStudents.map((student) => prisma.meetingMinuteRequest.upsert({
      where: { meetingId_studentId: { meetingId: meeting.id, studentId: student.id } },
      create: {
        meetingId: meeting.id,
        studentId: student.id,
        creationMode: 'MENTOR_DIRECT',
        status: 'APPROVED',
        teacherFinalText: minutes,
        reviewedAt: now,
        approvedAt: now,
      },
      update: {
        creationMode: 'MENTOR_DIRECT',
        status: 'APPROVED',
        studentMinutes: null,
        submittedAt: null,
        teacherFinalText: minutes,
        reviewedAt: now,
        approvedAt: now,
      },
    })));

    const notification = await sendAcademicNotification({
      recipients: validStudents.flatMap((student) => [
        { email: student.email, name: student.name },
        {
          email: student.parentAccount?.email || student.parentEmail,
          name: student.parentAccount?.name || student.parentName,
        },
      ]),
      subject: `Meeting minutes • ${meeting.title}`,
      heading: 'Final meeting minutes from your mentor',
      message: `${teacher.name} prepared and shared the final minutes for ${meeting.title}.`,
      details: [
        { label: 'Meeting', value: meeting.title },
        { label: 'When', value: meeting.startDateTime.toLocaleString('en-US', { timeZone: meeting.timezone }) },
        { label: 'Mentor', value: teacher.name },
        { label: 'Final minutes', value: minutes },
      ],
      actionLabel: 'View meeting minutes',
      actionUrl: getApplicationUrl('/student-dashboard?tab=meeting-minutes'),
      replyTo: teacher.email,
    });

    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      recipients: validStudents.length,
      notification,
      notificationWarning: notification.failed > 0 ? 'Minutes were saved, but one or more email notifications failed.' : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send meeting minutes';
    console.error('Direct meeting minutes failed:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
