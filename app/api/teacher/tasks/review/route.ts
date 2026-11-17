import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { reviewTaskItem } from '@/lib/task-review';

/** A mentor approves, requests changes on, or reopens one student's copy of their own task. */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email },
      select: { id: true, name: true, email: true },
    });
    if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });

    const body = await request.json();
    const studentTaskId = Number(body?.studentTaskId);
    if (!Number.isFinite(studentTaskId)) {
      return NextResponse.json({ success: false, error: 'Invalid studentTaskId' }, { status: 400 });
    }

    const result = await reviewTaskItem({ kind: 'teacher', ...teacher }, studentTaskId, body.action, body.feedback);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('Error reviewing student task:', error);
    return NextResponse.json({ success: false, error: 'Internal server error reviewing task' }, { status: 500 });
  }
}
