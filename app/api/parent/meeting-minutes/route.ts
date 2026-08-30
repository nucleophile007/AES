import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  if (!hasRole(user, 'parent')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
  const normalizedEmail = user.email.trim().toLowerCase();
  const requests = await prisma.meetingMinuteRequest.findMany({
    where: {
      status: 'APPROVED',
      student: {
        OR: [
          { parentAccountId: user.id },
          { parentEmail: { equals: normalizedEmail, mode: 'insensitive' } },
        ],
      },
    },
    select: {
      id: true, status: true, creationMode: true, teacherFinalText: true, approvedAt: true,
      student: { select: { id: true, name: true, email: true } },
      meeting: { select: { id: true, title: true, description: true, startDateTime: true, endDateTime: true, timezone: true, teacher: { select: { name: true, email: true } } } },
    },
    orderBy: { meeting: { startDateTime: 'desc' } },
  });
  return NextResponse.json({ success: true, requests });
}
