import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { loadAssignee } from '@/lib/task-actors';
import { addTaskComment } from '@/lib/task-comments';

/**
 * Comments from mentors, students and parents. The author is resolved from the
 * database (not the token); access rules live in lib/task-comments.ts.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

    const body = await request.json();
    const studentTaskId = Number(body?.studentTaskId);
    if (!Number.isInteger(studentTaskId)) {
      return NextResponse.json({ success: false, error: 'Invalid studentTaskId' }, { status: 400 });
    }

    const person = await loadAssignee(user);
    if (!person) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });

    const result = await addTaskComment(
      { role: user.role, id: person.id, name: person.name, email: person.email },
      studentTaskId,
      body
    );
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error adding comment' }, { status: 500 });
  }
}
