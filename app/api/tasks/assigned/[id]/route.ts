import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { loadAssignee } from '@/lib/task-actors';
import { getAssigneeTaskDetail, performAssigneeAction } from '@/lib/task-assignee-actions';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * One of the signed-in user's own tasks (as the assignee). Works for students,
 * mentors and parents; mentors and parents receive tasks from the admin team.
 */
async function resolve(request: NextRequest, params: RouteContext['params']) {
  const user = await getUserFromRequest(request);
  if (!user) return { error: NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }) };
  const studentTaskId = Number((await params).id);
  if (!Number.isInteger(studentTaskId)) {
    return { error: NextResponse.json({ success: false, error: 'Invalid task ID' }, { status: 400 }) };
  }
  const assignee = await loadAssignee(user);
  if (!assignee) return { error: NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 }) };
  return { assignee, studentTaskId };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await resolve(request, params);
    if (ctx.error) return ctx.error;
    const task = await getAssigneeTaskDetail(ctx.assignee, ctx.studentTaskId);
    if (!task) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error fetching assigned task:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await resolve(request, params);
    if (ctx.error) return ctx.error;
    const body = await request.json().catch(() => ({}));
    const result = await performAssigneeAction(ctx.assignee, ctx.studentTaskId, body ?? {});
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('Error updating assigned task:', error);
    return NextResponse.json({ success: false, error: 'Internal server error updating task' }, { status: 500 });
  }
}
