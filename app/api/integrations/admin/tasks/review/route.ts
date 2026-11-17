import { NextRequest } from 'next/server';
import { reviewTaskItem } from '@/lib/task-review';
import { adminReviewer, authenticateAdminRequest, privateJson } from '@/lib/task-admin';

/** Any admin reviews an assignee's copy of any task (on mentor tasks, the mentor is emailed too). */
export async function POST(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  try {
    const body = await request.json().catch(() => null);
    const studentTaskId = Number(body?.studentTaskId);
    if (!Number.isInteger(studentTaskId)) {
      return privateJson({ success: false, error: 'Invalid studentTaskId' }, { status: 400 });
    }
    const result = await reviewTaskItem(adminReviewer(auth.admin), studentTaskId, body.action, body.feedback);
    return privateJson(result.body, { status: result.status });
  } catch (error) {
    console.error('Admin task review failed:', error);
    return privateJson({ success: false, error: 'Internal server error reviewing task' }, { status: 500 });
  }
}
