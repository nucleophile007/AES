import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '../generated/prisma';
import { prisma } from './prisma';
import { buildStudentTaskWhere, type TaskListQuery } from './task-server';
import { isTaskAssigneeRole } from './tasks';
import type { TaskAssignee } from './task-actors';
import type { TaskReviewer } from './task-review';

/**
 * Server-to-server access for the admin app (AES-Admin). The admin app checks
 * the admin's Google sign-in against its allowlist, then calls these endpoints
 * with a shared key and the acting admin's email/name in headers. AES trusts
 * the headers only when the key matches.
 */

export interface AdminActor {
  email: string;
  name: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function keysMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function authenticateAdminRequest(
  request: NextRequest
): { admin: AdminActor; error?: undefined } | { admin?: undefined; error: NextResponse } {
  const serviceKey = process.env.AES_ADMIN_TASKS_API_KEY;
  if (!serviceKey || serviceKey.length < 32) {
    console.error('AES_ADMIN_TASKS_API_KEY must be configured with at least 32 characters.');
    return { error: NextResponse.json({ success: false, error: 'Admin task integration is not configured.' }, { status: 503 }) };
  }
  const authorization = request.headers.get('authorization') || '';
  const provided = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!keysMatch(provided, serviceKey)) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 }) };
  }
  const email = (request.headers.get('x-admin-email') || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { error: NextResponse.json({ success: false, error: 'Acting admin email is required.' }, { status: 400 }) };
  }
  const rawName = (request.headers.get('x-admin-name') || '').trim().slice(0, 100);
  return { admin: { email, name: rawName || email.split('@')[0] } };
}

export function adminReviewer(admin: AdminActor): TaskReviewer {
  return { kind: 'admin', email: admin.email, name: admin.name };
}

export function adminActivity(admin: AdminActor) {
  return { performedById: 0, performedByRole: 'admin', performedByName: admin.name };
}

export const privateJson = (body: unknown, init?: { status?: number }) =>
  NextResponse.json(body, { status: init?.status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });

// ---------------------------------------------------------------------------
// Scope: which tasks the admin board shows
// ---------------------------------------------------------------------------

export type AdminTaskSource = 'all' | 'admin' | 'mentor';

export interface AdminTaskScope {
  source: AdminTaskSource;
  creatorTeacherId: number | null;
  assigneeRole: 'STUDENT' | 'TEACHER' | 'PARENT' | null;
}

export function readAdminScope(searchParams: URLSearchParams): AdminTaskScope {
  const source = searchParams.get('source');
  const teacherId = Number(searchParams.get('creatorTeacherId'));
  const assigneeRole = searchParams.get('assigneeRole');
  return {
    source: source === 'admin' || source === 'mentor' ? source : 'all',
    creatorTeacherId: Number.isInteger(teacherId) && teacherId > 0 ? teacherId : null,
    assigneeRole: isTaskAssigneeRole(assigneeRole) ? assigneeRole : null,
  };
}

export function adminScopeWhere(scope: AdminTaskScope): Prisma.StudentTaskWhereInput {
  const task: Prisma.TaskWhereInput = {};
  if (scope.source === 'admin') task.creatorRole = 'ADMIN';
  if (scope.source === 'mentor' || scope.creatorTeacherId) task.creatorRole = 'TEACHER';
  if (scope.creatorTeacherId) task.creatorId = scope.creatorTeacherId;
  return {
    ...(Object.keys(task).length ? { task } : {}),
    ...(scope.assigneeRole ? { assigneeRole: scope.assigneeRole } : {}),
  };
}

export function buildAdminTaskWhere(
  scope: AdminTaskScope,
  query: TaskListQuery,
  opts: { ignoreStatus?: boolean } = {}
): Prisma.StudentTaskWhereInput {
  return buildStudentTaskWhere(adminScopeWhere(scope), query, { searchStudents: true, ignoreStatus: opts.ignoreStatus });
}

// ---------------------------------------------------------------------------
// Assignees chosen by an admin
// ---------------------------------------------------------------------------

export const MAX_ADMIN_ASSIGNEES = 1000;

const toIds = (v: unknown) =>
  Array.isArray(v) ? Array.from(new Set(v.map(Number).filter((n) => Number.isInteger(n) && n > 0))) : [];

/**
 * Admins can assign to any student, mentor or parent account. Every id must
 * exist; at least one person is required (unless `allowEmpty`, used when editing).
 */
export async function resolveAdminAssignees(
  input: { studentIds?: unknown; teacherIds?: unknown; parentIds?: unknown },
  opts: { allowEmpty?: boolean } = {}
): Promise<{ ok: true; assignees: TaskAssignee[] } | { ok: false; error: string }> {
  const studentIds = toIds(input.studentIds);
  const teacherIds = toIds(input.teacherIds);
  const parentIds = toIds(input.parentIds);
  const total = studentIds.length + teacherIds.length + parentIds.length;
  if (!total && !opts.allowEmpty) return { ok: false, error: 'Please choose at least one student, mentor or parent' };
  if (total > MAX_ADMIN_ASSIGNEES) {
    return { ok: false, error: `You can assign a task to at most ${MAX_ADMIN_ASSIGNEES} people at once` };
  }

  const select = { id: true, name: true, email: true } as const;
  const [students, teachers, parents] = await Promise.all([
    studentIds.length ? prisma.student.findMany({ where: { id: { in: studentIds } }, select }) : [],
    teacherIds.length ? prisma.teacher.findMany({ where: { id: { in: teacherIds } }, select }) : [],
    parentIds.length ? prisma.parentAccount.findMany({ where: { id: { in: parentIds } }, select }) : [],
  ]);
  if (students.length !== studentIds.length) return { ok: false, error: 'One or more students were not found' };
  if (teachers.length !== teacherIds.length) return { ok: false, error: 'One or more mentors were not found' };
  if (parents.length !== parentIds.length) return { ok: false, error: 'One or more parents were not found' };

  return {
    ok: true,
    assignees: [
      ...students.map((p) => ({ role: 'STUDENT' as const, ...p })),
      ...teachers.map((p) => ({ role: 'TEACHER' as const, ...p })),
      ...parents.map((p) => ({ role: 'PARENT' as const, ...p })),
    ],
  };
}

/** Key for de-duplicating assignees across roles. */
export const assigneeKey = (a: { role: string; id: number }) => `${a.role}:${a.id}`;
