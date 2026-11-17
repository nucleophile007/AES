import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdminRequest, privateJson } from '@/lib/task-admin';

/** Resolves one assignee row to its task id (for ?open=<studentTaskId> links in emails). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ studentTaskId: string }> }) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  const id = Number((await params).studentTaskId);
  if (!Number.isInteger(id) || id <= 0) return privateJson({ success: false, error: 'Not found' }, { status: 404 });
  const item = await prisma.studentTask.findUnique({ where: { id }, select: { id: true, taskId: true } });
  if (!item) return privateJson({ success: false, error: 'Not found' }, { status: 404 });
  return privateJson({ success: true, taskId: item.taskId, studentTaskId: item.id });
}
