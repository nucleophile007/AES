import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { localDateTimeToUtc, sendBookingNotification, zonedDate, zonedTime } from '@/lib/mentor-calendar';
import { hasTeacherScheduleConflict } from '@/lib/mentor-calendar-server';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const id = Number((await context.params).id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid availability slot ID' }, { status: 400 });
    const body = await request.json();
    const timezone = typeof body.timezone === 'string' ? body.timezone : '';
    const startsAt = localDateTimeToUtc(body.startLocal, timezone);
    const endsAt = localDateTimeToUtc(body.endLocal, timezone);
    if (!startsAt || !endsAt || startsAt <= new Date() || endsAt <= startsAt) {
      return NextResponse.json({ error: 'Enter a valid future start and end time.' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const slot = await tx.mentorAvailabilitySlot.findFirst({
        where: { id, teacher: { email: user.email } },
        include: { requests: { where: { status: 'PENDING' }, select: { id: true } } },
      });
      if (!slot) throw new Error('Availability slot not found.');
      if (slot.status !== 'OPEN') throw new Error('Only open availability can be changed.');
      if (slot.requests.length > 0) throw new Error('This slot has pending requests. Decide those requests before changing it.');
      const teacher = await tx.teacher.findUnique({ where: { id: slot.teacherId }, select: { id: true } });
      if (!teacher) throw new Error('Mentor profile not found.');
      if (await hasTeacherScheduleConflict(tx, teacher.id, startsAt, endsAt, timezone, slot.id)) {
        throw new Error('This time overlaps another available slot or scheduled class.');
      }
      return tx.mentorAvailabilitySlot.update({
        where: { id },
        data: { startsAt, endsAt, timezone },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ success: true, slot: updated });
  } catch (error) {
    if (error instanceof Error && /not found|Only open|pending requests|overlaps another/.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('not found') ? 404 : 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'Availability changed at the same time. Refresh and try again.' }, { status: 409 });
    }
    console.error('Failed to update mentor availability slot:', error);
    return NextResponse.json({ error: 'Failed to update availability slot' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const id = Number((await context.params).id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid availability slot ID' }, { status: 400 });

    const slot = await prisma.$transaction(async (tx) => {
      const existing = await tx.mentorAvailabilitySlot.findFirst({
        where: { id, teacher: { email: user.email } },
        include: {
          teacher: { select: { name: true, email: true } },
          requests: {
            where: { status: 'PENDING' },
            include: { student: { select: { id: true, name: true, email: true } } },
          },
        },
      });
      if (!existing) throw new Error('Availability slot not found.');
      if (existing.status !== 'OPEN') throw new Error('Only open slots can be removed here.');
      const closed = await tx.mentorAvailabilitySlot.updateMany({
        where: { id, status: 'OPEN' },
        data: { status: 'CANCELLED' },
      });
      if (closed.count !== 1) throw new Error('Availability changed before it could be removed.');
      await tx.mentorSlotBooking.updateMany({
        where: { slotId: id, status: 'PENDING' },
        data: { status: 'DECLINED', respondedAt: new Date() },
      });
      return existing;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    const details = [
      `Mentor: ${slot.teacher.name}`,
      `When: ${zonedDate(slot.startsAt, slot.timezone)} ${zonedTime(slot.startsAt, slot.timezone)} - ${zonedTime(slot.endsAt, slot.timezone)} (${slot.timezone})`,
      'The mentor is no longer available at this time.',
    ];
    const emailResults = await Promise.all(slot.requests.map((booking) => sendBookingNotification({
      recipients: [booking.student.email],
      subject: 'Mentor availability request cancelled',
      title: 'This requested time is no longer available',
      details,
      replyTo: slot.teacher.email,
    })));

    return NextResponse.json({
      success: true,
      notificationWarning: emailResults.some(Boolean)
        ? 'The slot was removed, but one or more students could not be notified by email.'
        : null,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Availability slot not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error && /Only open|Availability changed/.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'Availability changed while being removed. Refresh and try again.' }, { status: 409 });
    }
    console.error('Failed to remove mentor availability slot:', error);
    return NextResponse.json({ error: 'Failed to remove availability slot' }, { status: 500 });
  }
}
