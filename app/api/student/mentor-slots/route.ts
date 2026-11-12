import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBookingNotification, zonedDate, zonedTime } from '@/lib/mentor-calendar';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'student')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const student = await prisma.student.findUnique({
      where: { email: user.email },
      select: { id: true, isActivated: true },
    });
    if (!student || !student.isActivated) return NextResponse.json({ error: 'Active student profile not found' }, { status: 404 });

    const teacherLinks = await prisma.teacherStudent.findMany({
      where: { studentId: student.id },
      include: { teacher: { select: { id: true, name: true, email: true } } },
    });
    const teacherIds = [...new Set(teacherLinks.map((link) => link.teacherId))];
    const teachers = Array.from(new Map(teacherLinks.map(({ teacher }) => [teacher.id, teacher])).values());
    if (teacherIds.length === 0) return NextResponse.json({ success: true, teachers: [], slots: [], requests: [] });

    const [slots, requests] = await Promise.all([
      prisma.mentorAvailabilitySlot.findMany({
        where: {
          teacherId: { in: teacherIds },
          status: 'OPEN',
          startsAt: { gte: new Date() },
        },
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          requests: {
            where: { studentId: student.id },
            select: { id: true, status: true, message: true, createdAt: true },
          },
        },
        orderBy: { startsAt: 'asc' },
      }),
      prisma.mentorSlotBooking.findMany({
        where: { studentId: student.id, slot: { teacherId: { in: teacherIds } } },
        include: {
          slot: {
            include: { teacher: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { slot: { startsAt: 'desc' } },
      }),
    ]);

    return NextResponse.json({ success: true, teachers, slots, requests });
  } catch (error) {
    console.error('Failed to load linked mentor availability:', error);
    return NextResponse.json({ error: 'Failed to load mentor availability' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'student')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const student = await prisma.student.findUnique({
      where: { email: user.email },
      select: { id: true, name: true, email: true, isActivated: true },
    });
    if (!student || !student.isActivated) return NextResponse.json({ error: 'Active student profile not found' }, { status: 404 });

    const body = await request.json();
    const slotId = Number(body.slotId);
    if (!Number.isInteger(slotId) || slotId <= 0) return NextResponse.json({ error: 'Invalid availability slot ID' }, { status: 400 });
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (message.length > 500) return NextResponse.json({ error: 'The note must be 500 characters or fewer.' }, { status: 400 });

    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.mentorAvailabilitySlot.findUnique({
        where: { id: slotId },
        include: { teacher: { select: { id: true, name: true, email: true } } },
      });
      if (!slot) throw new Error('Availability slot not found.');
      if (slot.status !== 'OPEN' || slot.startsAt <= new Date()) throw new Error('This availability is no longer open.');
      const linked = await tx.teacherStudent.findFirst({
        where: { teacherId: slot.teacherId, studentId: student.id },
        select: { id: true },
      });
      if (!linked) throw new Error('You can only request time with a linked mentor.');
      const existing = await tx.mentorSlotBooking.findUnique({
        where: { slotId_studentId: { slotId: slot.id, studentId: student.id } },
        select: { id: true, status: true },
      });
      if (existing?.status === 'PENDING') throw new Error('You have already requested this time.');
      if (existing?.status === 'APPROVED') throw new Error('This time has already been approved.');
      const booking = existing
        ? await tx.mentorSlotBooking.update({
            where: { id: existing.id },
            data: { status: 'PENDING', message: message || null, respondedAt: null },
          })
        : await tx.mentorSlotBooking.create({
            data: { slotId: slot.id, studentId: student.id, message: message || null },
          });
      return tx.mentorSlotBooking.findUniqueOrThrow({
        where: { id: booking.id },
        include: {
          slot: { include: { teacher: { select: { id: true, name: true, email: true } } } },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    const when = `${zonedDate(booking.slot.startsAt, booking.slot.timezone)} ${zonedTime(booking.slot.startsAt, booking.slot.timezone)} - ${zonedTime(booking.slot.endsAt, booking.slot.timezone)} (${booking.slot.timezone})`;
    const notificationWarning = await sendBookingNotification({
      recipients: [student.email, booking.slot.teacher.email],
      subject: 'Mentor session booking request',
      title: `${student.name} requested a mentor session`,
      details: [
        `Student: ${student.name} (${student.email})`,
        `Mentor: ${booking.slot.teacher.name}`,
        `When: ${when}`,
        ...(message ? [`Student note: ${message}`] : []),
        'The request is pending mentor approval.',
      ],
      replyTo: student.email,
    });

    return NextResponse.json({ success: true, booking, notificationWarning }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && /not found|no longer open|linked mentor|already requested|already been approved/.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('not found') ? 404 : 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already requested this time.' }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'Availability changed at the same time. Refresh and try again.' }, { status: 409 });
    }
    console.error('Failed to request mentor availability:', error);
    return NextResponse.json({ error: 'Failed to submit booking request' }, { status: 500 });
  }
}
