import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'parent')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });

    const children = await prisma.student.findMany({
      where: { parentEmail: { equals: user.email, mode: 'insensitive' }, isActivated: true },
      select: { id: true, name: true, email: true },
    });
    const childIds = children.map((child) => child.id);
    if (childIds.length === 0) return NextResponse.json({ success: true, children, bookings: [] });

    const bookings = await prisma.mentorSlotBooking.findMany({
      where: { studentId: { in: childIds } },
      include: {
        student: { select: { id: true, name: true } },
        slot: {
          include: {
            teacher: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { slot: { startsAt: 'asc' } },
    });

    return NextResponse.json({ success: true, children, bookings });
  } catch (error) {
    console.error('Failed to load parent mentor calendar:', error);
    return NextResponse.json({ error: 'Failed to load child booking status' }, { status: 500 });
  }
}
