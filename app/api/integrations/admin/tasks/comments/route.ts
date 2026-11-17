import { NextRequest } from 'next/server';
import { addTaskComment } from '@/lib/task-comments';
import { authenticateAdminRequest, privateJson } from '@/lib/task-admin';

/** An admin comments on an admin-created task. Mentor tasks are view-only (404). Text only for now. */
export async function POST(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  try {
    const body = await request.json().catch(() => null);
    const studentTaskId = Number(body?.studentTaskId);
    if (!Number.isInteger(studentTaskId)) {
      return privateJson({ success: false, error: 'Invalid studentTaskId' }, { status: 400 });
    }
    const result = await addTaskComment(
      { role: 'admin', id: 0, name: auth.admin.name, email: auth.admin.email },
      studentTaskId,
      { content: body.content }
    );
    return privateJson(result.body, { status: result.status });
  } catch (error) {
    console.error('Admin task comment failed:', error);
    return privateJson({ success: false, error: 'Internal server error adding comment' }, { status: 500 });
  }
}
