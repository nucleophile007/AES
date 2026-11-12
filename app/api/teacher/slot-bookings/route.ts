import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const bookings = await prisma.mentorSlotBooking.findMany({
      where: { slot: { teacher: { email: user.email } } },
      include: {
        student: { select: { id: true, name: true, email: true, parentEmail: true } },
        slot: true,
        classSchedule: { select: { id: true, googleCalendarEventId: true } },
      },
      orderBy: [{ status: 'asc' }, { slot: { startsAt: 'asc' } }],
    });
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Failed to load mentor booking requests:', error);
    return NextResponse.json({ error: 'Failed to load booking requests' }, { status: 500 });
  }
}
