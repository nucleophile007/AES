import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBookingNotification, zonedDate, zonedTime } from '@/lib/mentor-calendar';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'student')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const id = Number((await context.params).id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid booking request ID' }, { status: 400 });
    const booking = await prisma.mentorSlotBooking.findFirst({
      where: { id, student: { email: user.email } },
      include: {
        student: { select: { name: true, email: true } },
        slot: { include: { teacher: { select: { name: true, email: true } } } },
      },
    });
    if (!booking) return NextResponse.json({ error: 'Booking request not found' }, { status: 404 });
    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending requests can be withdrawn.' }, { status: 409 });
    }

    const updated = await prisma.mentorSlotBooking.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'CANCELLED', respondedAt: new Date() },
    });
    if (updated.count !== 1) return NextResponse.json({ error: 'This request has already changed.' }, { status: 409 });

    const when = `${zonedDate(booking.slot.startsAt, booking.slot.timezone)} ${zonedTime(booking.slot.startsAt, booking.slot.timezone)} - ${zonedTime(booking.slot.endsAt, booking.slot.timezone)} (${booking.slot.timezone})`;
    const notificationWarning = await sendBookingNotification({
      recipients: [booking.student.email, booking.slot.teacher.email],
      subject: 'Mentor session request withdrawn',
      title: `${booking.student.name} withdrew a booking request`,
      details: [
        `Student: ${booking.student.name}`,
        `Mentor: ${booking.slot.teacher.name}`,
        `When: ${when}`,
      ],
      replyTo: booking.student.email,
    });

    return NextResponse.json({ success: true, notificationWarning });
  } catch (error) {
    console.error('Failed to withdraw mentor booking request:', error);
    return NextResponse.json({ error: 'Failed to withdraw booking request' }, { status: 500 });
  }
}
