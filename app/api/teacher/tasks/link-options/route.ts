import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';

/** Assignments, resources and meetings a mentor can link a task to. */
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || !hasRole(user, 'teacher')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const teacher = await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true } });
  if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });

  const since = new Date(Date.now() - 120 * 864e5);
  const [assignments, resources, meetings] = await Promise.all([
    prisma.assignment.findMany({
      where: { teacherId: teacher.id },
      select: { id: true, title: true, dueDate: true },
      orderBy: { dueDate: 'desc' },
      take: 100,
    }),
    prisma.resource.findMany({
      where: { teacherId: teacher.id },
      select: { id: true, title: true, type: true },
      orderBy: { id: 'desc' },
      take: 100,
    }),
    prisma.meetingMinuteMeeting.findMany({
      where: { teacherId: teacher.id, startDateTime: { gte: since } },
      select: { id: true, title: true, startDateTime: true },
      orderBy: { startDateTime: 'desc' },
      take: 100,
    }),
  ]);
  return NextResponse.json({ success: true, assignments, resources, meetings });
}
