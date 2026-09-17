import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCalendarEvent } from '@/lib/google-calendar';
import { getTeacherCalendarCredentials } from '@/lib/teacher-calendar';
import { getGoogleMeetingLink, googleEventDateTimes, isEligibleGoogleMeeting, normalizeEmail } from '@/lib/meeting-minutes';
import { getApplicationUrl, sendAcademicNotification } from '@/lib/academic-notifications';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
  const teacher = await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true } });
  if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
  const status = request.nextUrl.searchParams.get('status');
  const allowed = new Set(['ASSIGNED', 'SUBMITTED', 'APPROVED']);
  const requests = await prisma.meetingMinuteRequest.findMany({
    where: { meeting: { teacherId: teacher.id }, ...(status && allowed.has(status) ? { status: status as 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' } : {}) },
    include: { student: { select: { id: true, name: true, email: true } }, meeting: true },
    orderBy: [{ meeting: { startDateTime: 'desc' } }, { updatedAt: 'desc' }],
  });
  return NextResponse.json({ success: true, requests });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    const body = await request.json();
    const eventId = typeof body.googleCalendarEventId === 'string' ? body.googleCalendarEventId.trim() : '';
    const studentIds: number[] = Array.from(new Set<number>(Array.isArray(body.studentIds) ? body.studentIds.map(Number).filter((id: number) => Number.isInteger(id)) : []));
    const timezone = typeof body.timezone === 'string' ? body.timezone : 'America/Los_Angeles';
    if (!eventId || !studentIds.length) return NextResponse.json({ error: 'Meeting and at least one student are required' }, { status: 400 });

    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email },
      select: { id: true, email: true },
    });
    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

    const isAesSchedule = eventId.startsWith('aes:schedule:');
    const scheduleId = isAesSchedule ? Number(eventId.replace('aes:schedule:', '')) : null;

    let title = 'Untitled meeting';
    let description: string | null = null;
    let meetingLink: string | null = null;
    let location: string | null = null;
    let startDateTime = new Date();
    let endDateTime = new Date();
    let googleCalendarEventId: string | null = isAesSchedule ? null : eventId;
    let classScheduleId: number | null = scheduleId;
    let attendeeEmails = new Set<string>();

    if (isAesSchedule && scheduleId) {
      const schedule = await prisma.classSchedule.findUnique({
        where: { id: scheduleId },
        include: {
          student: true,
          group: { include: { members: { include: { student: true } } } },
        },
      });
      if (!schedule || schedule.teacherId !== teacher.id) {
        return NextResponse.json({ error: 'Class schedule not found or access denied' }, { status: 404 });
      }
      title = schedule.title || `Class with ${schedule.student.name}`;
      description = schedule.description || null;
      meetingLink = schedule.meetingLink || null;
      location = schedule.location || null;
      googleCalendarEventId = schedule.googleCalendarEventId || null;
      classScheduleId = schedule.id;

      const [startH, startM] = (schedule.startTime || '00:00').split(':').map(Number);
      const [endH, endM] = (schedule.endTime || '00:00').split(':').map(Number);
      const sDate = new Date(schedule.date);
      sDate.setHours(startH || 0, startM || 0, 0, 0);
      const eDate = new Date(schedule.date);
      eDate.setHours(endH || 0, endM || 0, 0, 0);
      startDateTime = sDate;
      endDateTime = eDate;

      const rawAttendees = schedule.group
        ? schedule.group.members.map((m) => m.student)
        : [schedule.student];
      attendeeEmails = new Set(rawAttendees.map((s) => normalizeEmail(s.email)));
    } else {
      const credentials = await getTeacherCalendarCredentials(user.email);
      if (!credentials.accessToken) return NextResponse.json({ error: 'Google Calendar is not connected', needsReconnect: credentials.needsReconnect }, { status: 409 });
      const event = await getCalendarEvent(credentials.accessToken, credentials.teacher?.googleRefreshToken || undefined, eventId);
      const times = googleEventDateTimes(event);
      if (!isEligibleGoogleMeeting(event) || !times) return NextResponse.json({ error: 'Meeting is not an eligible completed event organized by you' }, { status: 400 });

      title = event.summary || 'Untitled meeting';
      description = event.description || null;
      meetingLink = getGoogleMeetingLink(event);
      location = event.location || null;
      startDateTime = times.start;
      endDateTime = times.end;
      attendeeEmails = new Set((event.attendees || []).map((attendee) => normalizeEmail(attendee.email)).filter(Boolean));
    }

    const students = await prisma.student.findMany({
      where: { id: { in: studentIds }, teacherLinks: { some: { teacherId: teacher.id } } },
      select: { id: true, name: true, email: true },
    });
    const validStudents = students.filter((student) => attendeeEmails.has(normalizeEmail(student.email)));
    if (validStudents.length !== studentIds.length) return NextResponse.json({ error: 'One or more students are not linked attendees of this meeting' }, { status: 403 });

    const result = await prisma.$transaction(async (tx) => {
      const meeting = classScheduleId
        ? await tx.meetingMinuteMeeting.upsert({
            where: { teacherId_classScheduleId: { teacherId: teacher.id, classScheduleId } },
            update: { title, description, meetingLink, location, startDateTime, endDateTime, timezone },
            create: {
              teacherId: teacher.id,
              source: 'AES_SCHEDULE',
              classScheduleId,
              googleCalendarEventId,
              title, description, meetingLink, location, startDateTime, endDateTime, timezone,
            },
          })
        : await tx.meetingMinuteMeeting.upsert({
            where: { teacherId_googleCalendarEventId: { teacherId: teacher.id, googleCalendarEventId: eventId } },
            update: { title, description, meetingLink, location, startDateTime, endDateTime, timezone },
            create: {
              teacherId: teacher.id,
              source: 'GOOGLE',
              googleCalendarEventId: eventId,
              title, description, meetingLink, location, startDateTime, endDateTime, timezone,
            },
          });

      let created = 0;
      const createdStudentIds: number[] = [];
      for (const student of validStudents) {
        const existing = await tx.meetingMinuteRequest.findUnique({ where: { meetingId_studentId: { meetingId: meeting.id, studentId: student.id } }, select: { id: true } });
        if (!existing) {
          await tx.meetingMinuteRequest.create({ data: { meetingId: meeting.id, studentId: student.id } });
          created++;
          createdStudentIds.push(student.id);
        }
      }
      return { meetingId: meeting.id, created, existing: validStudents.length - created, createdStudentIds };
    });

    const notification = await sendAcademicNotification({
      recipients: validStudents.filter((student) => result.createdStudentIds.includes(student.id)).map((student) => ({ email: student.email, name: student.name })),
      subject: `Meeting minutes assigned: ${title}`,
      heading: 'Meeting minutes have been assigned',
      message: 'Your teacher asked you to write and submit the minutes for a completed meeting.',
      details: [
        { label: 'Meeting', value: title },
        { label: 'Date', value: startDateTime.toLocaleString('en-US', { timeZone: timezone }) },
      ],
      actionLabel: 'Write meeting minutes',
      actionUrl: getApplicationUrl('/student-dashboard?tab=meeting-minutes'),
      replyTo: teacher.email,
    });
    return NextResponse.json({ success: true, ...result, notification });
  } catch (error) {
    console.error('Meeting minute assignment failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to assign meeting minutes' }, { status: 500 });
  }
}
