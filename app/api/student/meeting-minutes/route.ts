import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  if (!hasRole(user, 'student')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
  const requests = await prisma.meetingMinuteRequest.findMany({
    where: { studentId: user.id },
    include: { meeting: { include: { teacher: { select: { id: true, name: true, email: true } } } } },
    orderBy: { meeting: { startDateTime: 'desc' } },
  });
  return NextResponse.json({ success: true, requests });
}
