import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';

/** Resolves a student task item to its parent task id (used by `?open=` deep links). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ studentTaskId: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user || !hasRole(user, 'teacher')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number((await params).studentTaskId);
  const teacher = await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true } });
  if (!teacher || !Number.isInteger(id)) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  const item = await prisma.studentTask.findFirst({
    where: { id, task: { creatorId: teacher.id } },
    select: { id: true, taskId: true },
  });
  if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, taskId: item.taskId, studentTaskId: item.id });
}
