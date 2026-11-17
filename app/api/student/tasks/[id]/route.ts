import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { loadAssignee } from '@/lib/task-actors';
import { getAssigneeTaskDetail, performAssigneeAction } from '@/lib/task-assignee-actions';

type RouteContext = { params: Promise<{ id: string }> };

/** A student's own task. The shared logic lives in lib/task-assignee-actions.ts. */
async function resolve(request: NextRequest, params: RouteContext['params']) {
  const user = await getUserFromRequest(request);
  if (!user) return { error: NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }) };
  if (!hasRole(user, 'student')) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 }) };
  }
  const studentTaskId = Number((await params).id);
  if (!Number.isFinite(studentTaskId)) {
    return { error: NextResponse.json({ success: false, error: 'Invalid task ID' }, { status: 400 }) };
  }
  const student = await loadAssignee(user);
  if (!student) return { error: NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 }) };
  return { student, studentTaskId };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await resolve(request, params);
    if (ctx.error) return ctx.error;
    const task = await getAssigneeTaskDetail(ctx.student, ctx.studentTaskId);
    if (!task) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error fetching student task details:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await resolve(request, params);
    if (ctx.error) return ctx.error;
    const body = await request.json();
    const result = await performAssigneeAction(ctx.student, ctx.studentTaskId, body ?? {});
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('Error updating student task:', error);
    return NextResponse.json({ success: false, error: 'Internal server error updating task' }, { status: 500 });
  }
}
