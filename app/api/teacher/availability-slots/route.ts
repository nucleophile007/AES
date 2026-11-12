import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { localDateTimeToUtc } from '@/lib/mentor-calendar';
import { hasTeacherScheduleConflict } from '@/lib/mentor-calendar-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email },
      select: { id: true, name: true, email: true },
    });
    if (!teacher) return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });

    const slots = await prisma.mentorAvailabilitySlot.findMany({
      where: { teacherId: teacher.id, startsAt: { gte: new Date() } },
      include: {
        requests: {
          include: { student: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { startsAt: 'asc' },
    });
    return NextResponse.json({ success: true, slots });
  } catch (error) {
    console.error('Failed to load mentor availability slots:', error);
    return NextResponse.json({ error: 'Failed to load availability slots' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email },
      select: { id: true, name: true, email: true },
    });
    if (!teacher) return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });

    const body = await request.json();
    const startsAt = localDateTimeToUtc(body.startLocal, body.timezone);
    const endsAt = localDateTimeToUtc(body.endLocal, body.timezone);
    if (!startsAt || !endsAt) {
      return NextResponse.json(
        { error: 'Enter valid local start and end times. Times skipped or repeated by daylight saving changes are not supported.' },
        { status: 400 }
      );
    }
    if (startsAt <= new Date() || endsAt <= startsAt) {
      return NextResponse.json({ error: 'The start must be in the future and the end must follow the start.' }, { status: 400 });
    }

    const slot = await prisma.$transaction(async (tx) => {
      if (await hasTeacherScheduleConflict(tx, teacher.id, startsAt, endsAt, body.timezone)) {
        throw new Error('This time overlaps another available slot or scheduled class.');
      }
      return tx.mentorAvailabilitySlot.create({
        data: {
          teacherId: teacher.id,
          startsAt,
          endsAt,
          timezone: body.timezone,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ success: true, slot }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('overlaps another')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'Availability changed at the same time. Refresh and try again.' }, { status: 409 });
    }
    console.error('Failed to create mentor availability slot:', error);
    return NextResponse.json({ error: 'Failed to create availability slot' }, { status: 500 });
  }
}
