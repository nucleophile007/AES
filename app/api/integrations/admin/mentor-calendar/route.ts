import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function hasValidServiceKey(request: NextRequest, expectedKey: string): boolean {
  const authorization = request.headers.get('authorization') || '';
  const providedKey = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const provided = Buffer.from(providedKey);
  const expected = Buffer.from(expectedKey);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function GET(request: NextRequest) {
  const serviceKey = process.env.AES_ADMIN_CALENDAR_API_KEY;
  if (!serviceKey || serviceKey.length < 32) {
    console.error('AES_ADMIN_CALENDAR_API_KEY must be configured with at least 32 characters.');
    return NextResponse.json({ error: 'Admin calendar integration is not configured.' }, { status: 503 });
  }
  if (!hasValidServiceKey(request, serviceKey)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const start = new Date(searchParams.get('start') || '');
  const end = new Date(searchParams.get('end') || '');
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end) {
    return NextResponse.json({ error: 'A valid start and end date are required.' }, { status: 400 });
  }
  if (end.getTime() - start.getTime() > 93 * 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: 'Calendar range cannot exceed 93 days.' }, { status: 400 });
  }

  try {
    const slots = await prisma.mentorAvailabilitySlot.findMany({
      where: { startsAt: { gte: start, lt: end } },
      include: {
        teacher: { select: { id: true, name: true, email: true, programs: true } },
        requests: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                grade: true,
                parentName: true,
                parentEmail: true,
                parentPhone: true,
              },
            },
            classSchedule: {
              select: {
                status: true,
                meetingLink: true,
                location: true,
                googleCalendarEventId: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ startsAt: 'asc' }, { teacher: { name: 'asc' } }],
    });
    const teachers = await prisma.teacher.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, teachers, slots }, {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    });
  } catch (error) {
    console.error('Failed to load integration mentor calendar:', error);
    return NextResponse.json({ error: 'Failed to load mentor calendar.' }, { status: 500 });
  }
}
