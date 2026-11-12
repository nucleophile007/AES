import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar';
import { getTeacherCalendarCredentials } from '@/lib/teacher-calendar';
import { calendarScheduleTimes, hasTeacherScheduleConflict } from '@/lib/mentor-calendar-server';
import { sendBookingNotification, zonedDate, zonedTime } from '@/lib/mentor-calendar';

type RouteContext = { params: Promise<{ id: string }> };
type Decision = 'approve' | 'decline' | 'cancel' | 'retry-google-sync' | 'retry-google-cancel';

async function syncGoogleCalendar(bookingId: number, userEmail: string) {
  const booking = await prisma.mentorSlotBooking.findFirst({
    where: { id: bookingId, status: 'APPROVED', slot: { teacher: { email: userEmail } } },
    include: {
      student: { select: { name: true, email: true } },
      slot: { include: { teacher: { select: { name: true, email: true } } } },
      classSchedule: true,
    },
  });
  if (!booking?.classSchedule) throw new Error('Approved booking schedule not found.');
  if (booking.classSchedule.googleCalendarEventId) {
    return { synced: true, notificationWarning: null };
  }

  const credentials = await getTeacherCalendarCredentials(userEmail);
  if (!credentials.teacher) throw new Error('Mentor profile not found.');
  if (!credentials.accessToken) {
    if (credentials.needsReconnect) {
      await prisma.mentorSlotBooking.update({
        where: { id: booking.id },
        data: { googleSyncError: 'Reconnect Google Calendar to sync this session.' },
      });
    }
    return { synced: false, notificationWarning: credentials.needsReconnect
      ? 'The booking was approved, but the mentor must reconnect Google Calendar before it can sync.'
      : null };
  }

  try {
    const eventId = await createCalendarEvent(credentials.accessToken, credentials.teacher.googleRefreshToken || undefined, {
      title: `Mentoring session: ${booking.student.name}`,
      description: `Mentor: ${booking.slot.teacher.name}\nStudent: ${booking.student.name}\nBooked through AES.`,
      startTime: booking.slot.startsAt.toISOString(),
      endTime: booking.slot.endsAt.toISOString(),
      timezone: booking.slot.timezone,
      attendees: [{ email: booking.student.email, displayName: booking.student.name }],
    });
    if (!eventId) throw new Error('Google Calendar did not return an event ID.');
    await prisma.classSchedule.update({
      where: { id: booking.classSchedule.id },
      data: { googleCalendarEventId: eventId },
    });
    await prisma.mentorSlotBooking.update({ where: { id: booking.id }, data: { googleSyncError: null } });
    return { synced: true, notificationWarning: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google Calendar sync failed.';
    await prisma.mentorSlotBooking.update({ where: { id: booking.id }, data: { googleSyncError: message } });
    return { synced: false, notificationWarning: 'The booking was saved, but Google Calendar sync failed. Use Retry Google Sync after resolving the connection.' };
  }
}

async function cancelGoogleCalendar(bookingId: number, userEmail: string) {
  const booking = await prisma.mentorSlotBooking.findFirst({
    where: { id: bookingId, status: 'CANCELLED', slot: { teacher: { email: userEmail } } },
    include: { classSchedule: true },
  });
  if (!booking?.classSchedule?.googleCalendarEventId) {
    return { synced: true, notificationWarning: null };
  }
  const credentials = await getTeacherCalendarCredentials(userEmail);
  if (!credentials.accessToken) {
    await prisma.mentorSlotBooking.update({
      where: { id: booking.id },
      data: { googleSyncError: 'Reconnect Google Calendar to remove the cancelled session event.' },
    });
    return { synced: false, notificationWarning: 'The session was cancelled in AES, but Google Calendar is disconnected. Reconnect it and retry removal.' };
  }
  try {
    await deleteCalendarEvent(credentials.accessToken, credentials.teacher?.googleRefreshToken || undefined, booking.classSchedule.googleCalendarEventId);
    await prisma.classSchedule.update({
      where: { id: booking.classSchedule.id },
      data: { googleCalendarEventId: null },
    });
    await prisma.mentorSlotBooking.update({ where: { id: booking.id }, data: { googleSyncError: null } });
    return { synced: true, notificationWarning: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google Calendar removal failed.';
    await prisma.mentorSlotBooking.update({ where: { id: booking.id }, data: { googleSyncError: message } });
    return { synced: false, notificationWarning: 'The session was cancelled in AES, but removing it from Google Calendar failed.' };
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const id = Number((await context.params).id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid booking request ID' }, { status: 400 });
    const body = await request.json();
    const decision = body.decision as Decision;
    if (!['approve', 'decline', 'cancel', 'retry-google-sync', 'retry-google-cancel'].includes(decision)) {
      return NextResponse.json({ error: 'Choose approve, decline, cancel, or a Google Calendar retry action.' }, { status: 400 });
    }

    if (decision === 'retry-google-sync') {
      const result = await syncGoogleCalendar(id, user.email);
      return NextResponse.json({ success: true, ...result });
    }
    if (decision === 'retry-google-cancel') {
      const result = await cancelGoogleCalendar(id, user.email);
      return NextResponse.json({ success: true, ...result });
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.mentorSlotBooking.findFirst({
        where: { id, slot: { teacher: { email: user.email } } },
        include: {
          student: { select: { id: true, name: true, email: true } },
          slot: { include: { teacher: { select: { id: true, name: true, email: true } } } },
        },
      });
      if (!booking) throw new Error('Booking request not found.');
      if (decision === 'cancel') {
        if (booking.status !== 'APPROVED') throw new Error('Only approved sessions can be cancelled.');
        const updated = await tx.mentorSlotBooking.update({
          where: { id },
          data: { status: 'CANCELLED', respondedAt: new Date() },
        });
        await tx.mentorAvailabilitySlot.update({ where: { id: booking.slotId }, data: { status: 'CANCELLED' } });
        if (booking.classScheduleId) {
          await tx.classSchedule.update({ where: { id: booking.classScheduleId }, data: { status: 'cancelled' } });
        }
        return { booking: { ...booking, ...updated }, otherPending: [] };
      }
      if (booking.status !== 'PENDING') throw new Error('This request has already been decided.');
      if (decision === 'decline') {
        const updated = await tx.mentorSlotBooking.update({
          where: { id },
          data: { status: 'DECLINED', respondedAt: new Date() },
        });
        return { booking: { ...booking, ...updated }, otherPending: [] };
      }
      if (booking.slot.status !== 'OPEN' || booking.slot.startsAt <= new Date()) {
        throw new Error('This availability is no longer bookable.');
      }
      if (await hasTeacherScheduleConflict(
        tx,
        booking.slot.teacherId,
        booking.slot.startsAt,
        booking.slot.endsAt,
        booking.slot.timezone,
        booking.slot.id
      )) throw new Error('This time now conflicts with another scheduled class.');

      const otherPending = await tx.mentorSlotBooking.findMany({
        where: { slotId: booking.slotId, id: { not: booking.id }, status: 'PENDING' },
        include: { student: { select: { name: true, email: true } } },
      });
      const teacherStudent = await tx.teacherStudent.findFirst({
        where: { teacherId: booking.slot.teacherId, studentId: booking.studentId },
        select: { program: true },
      });
      if (!teacherStudent) throw new Error('This student is no longer linked to the mentor.');

      const times = calendarScheduleTimes(booking.slot.startsAt, booking.slot.endsAt, booking.slot.timezone);
      const classSchedule = await tx.classSchedule.create({
        data: {
          title: `Mentoring session with ${booking.student.name}`,
          description: 'Booked through AES mentor availability.',
          subject: teacherStudent.program,
          date: times.date,
          startTime: times.startTime,
          endTime: times.endTime,
          startDateTime: booking.slot.startsAt,
          endDateTime: booking.slot.endsAt,
          timezone: booking.slot.timezone,
          status: 'upcoming',
          teacherId: booking.slot.teacherId,
          studentId: booking.studentId,
        },
      });
      const updated = await tx.mentorSlotBooking.update({
        where: { id },
        data: { status: 'APPROVED', respondedAt: new Date(), classScheduleId: classSchedule.id },
      });
      await tx.mentorAvailabilitySlot.update({
        where: { id: booking.slotId },
        data: { status: 'BOOKED' },
      });
      if (otherPending.length > 0) {
        await tx.mentorSlotBooking.updateMany({
          where: { id: { in: otherPending.map((item) => item.id) }, status: 'PENDING' },
          data: { status: 'DECLINED', respondedAt: new Date() },
        });
      }
      return { booking: { ...booking, ...updated, classSchedule }, otherPending };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    const when = `${zonedDate(result.booking.slot.startsAt, result.booking.slot.timezone)} ${zonedTime(result.booking.slot.startsAt, result.booking.slot.timezone)} - ${zonedTime(result.booking.slot.endsAt, result.booking.slot.timezone)} (${result.booking.slot.timezone})`;
    const statusText = decision === 'approve' ? 'approved' : decision === 'cancel' ? 'cancelled' : 'declined';
    const emailResults = await Promise.all([
      sendBookingNotification({
        recipients: [result.booking.student.email, result.booking.slot.teacher.email],
        subject: `Mentor session request ${statusText}`,
        title: `${result.booking.student.name}'s mentor session request was ${statusText}`,
        details: [
          `Student: ${result.booking.student.name}`,
          `Mentor: ${result.booking.slot.teacher.name}`,
          `When: ${when}`,
          ...(decision === 'approve' ? ['The session has been added to the AES schedule.'] : []),
          ...(decision === 'cancel' ? ['The session was removed from the AES schedule.'] : []),
        ],
        replyTo: result.booking.slot.teacher.email,
      }),
      ...result.otherPending.map((other) => sendBookingNotification({
        recipients: [other.student.email],
        subject: 'Mentor availability is no longer open',
        title: 'Another request was approved for this time',
        details: [
          `Mentor: ${result.booking.slot.teacher.name}`,
          `When: ${when}`,
          'Please choose another available time in your AES dashboard.',
        ],
        replyTo: result.booking.slot.teacher.email,
      })),
    ]);

    const syncResult = decision === 'approve'
      ? await syncGoogleCalendar(id, user.email)
      : decision === 'cancel'
        ? await cancelGoogleCalendar(id, user.email)
        : { notificationWarning: null };
    return NextResponse.json({
      success: true,
      booking: result.booking,
      notificationWarning: [...emailResults, syncResult.notificationWarning].filter(Boolean).join(' ') || null,
    });
  } catch (error) {
    if (error instanceof Error && /not found|already been decided|Only approved|no longer bookable|conflicts with|no longer linked/.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('not found') ? 404 : 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'This availability changed while you were responding. Refresh and try again.' }, { status: 409 });
    }
    console.error('Failed to update mentor booking request:', error);
    return NextResponse.json({ error: 'Failed to update booking request' }, { status: 500 });
  }
}
