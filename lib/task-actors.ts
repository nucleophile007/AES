import type { Prisma } from '../generated/prisma';
import { prisma } from './prisma';
import type { AuthUser } from './auth';
import { getApplicationUrl, sendAcademicNotification } from './academic-notifications';
import type { TaskAssigneeRole } from './tasks';

/**
 * A task row (StudentTask) belongs to exactly one assignee: a student, a mentor
 * (Teacher) or a parent. The database enforces this with StudentTask_assignee_check.
 * Tasks are created by a mentor (creatorId) or an admin (creatorAdminEmail),
 * enforced by Task_creator_check.
 */

export interface TaskAssignee {
  role: TaskAssigneeRole;
  id: number;
  name: string;
  email: string;
}

/** Role strings stored in TaskActivity.performedByRole / TaskComment.authorRole. */
export type TaskActorRole = 'student' | 'teacher' | 'parent' | 'admin';

export function assigneeActorRole(role: TaskAssigneeRole): TaskActorRole {
  return role === 'STUDENT' ? 'student' : role === 'TEACHER' ? 'teacher' : 'parent';
}

export function assigneeRoleForUser(role: AuthUser['role']): TaskAssigneeRole {
  return role === 'student' ? 'STUDENT' : role === 'teacher' ? 'TEACHER' : 'PARENT';
}

/** Filter for rows assigned to this person. */
export function assigneeWhere(a: Pick<TaskAssignee, 'role' | 'id'>): Prisma.StudentTaskWhereInput {
  switch (a.role) {
    case 'STUDENT':
      return { assigneeRole: 'STUDENT', studentId: a.id };
    case 'TEACHER':
      return { assigneeRole: 'TEACHER', assigneeTeacherId: a.id };
    case 'PARENT':
      return { assigneeRole: 'PARENT', assigneeParentId: a.id };
  }
}

/** Columns for creating a row assigned to this person. */
export function assigneeColumns(a: Pick<TaskAssignee, 'role' | 'id'>) {
  return {
    assigneeRole: a.role,
    studentId: a.role === 'STUDENT' ? a.id : null,
    assigneeTeacherId: a.role === 'TEACHER' ? a.id : null,
    assigneeParentId: a.role === 'PARENT' ? a.id : null,
  };
}

export interface AssignmentOwnerFields {
  assigneeRole: string;
  studentId: number | null;
  assigneeTeacherId: number | null;
  assigneeParentId: number | null;
}

export function isAssignedTo(row: AssignmentOwnerFields, a: Pick<TaskAssignee, 'role' | 'id'>): boolean {
  if (row.assigneeRole !== a.role) return false;
  if (a.role === 'STUDENT') return row.studentId === a.id;
  if (a.role === 'TEACHER') return row.assigneeTeacherId === a.id;
  return row.assigneeParentId === a.id;
}

/** Includes the assignee's name/email whichever kind they are. */
export const assigneePeopleInclude = {
  student: { select: { id: true, name: true, email: true, grade: true, program: true, schoolName: true } },
  assigneeTeacher: { select: { id: true, name: true, email: true } },
  assigneeParent: { select: { id: true, name: true, email: true } },
} satisfies Prisma.StudentTaskInclude;

type Person = { id: number; name: string; email: string };

export function readAssignee(
  row: AssignmentOwnerFields & {
    student?: Person | null;
    assigneeTeacher?: Person | null;
    assigneeParent?: Person | null;
  }
): TaskAssignee | null {
  const person =
    row.assigneeRole === 'STUDENT'
      ? row.student
      : row.assigneeRole === 'TEACHER'
        ? row.assigneeTeacher
        : row.assigneeRole === 'PARENT'
          ? row.assigneeParent
          : null;
  if (!person) return null;
  return { role: row.assigneeRole as TaskAssigneeRole, id: person.id, name: person.name, email: person.email };
}

/** Looks the signed-in user up in their own table (by email, like the other task routes). */
export async function loadAssignee(user: AuthUser): Promise<TaskAssignee | null> {
  const select = { id: true, name: true, email: true } as const;
  const person =
    user.role === 'student'
      ? await prisma.student.findUnique({ where: { email: user.email }, select })
      : user.role === 'teacher'
        ? await prisma.teacher.findUnique({ where: { email: user.email }, select })
        : await prisma.parentAccount.findUnique({ where: { email: user.email }, select });
  return person ? { role: assigneeRoleForUser(user.role), ...person } : null;
}

/** Where the assignee works on their tasks. */
export function assigneeTasksPath(role: TaskAssigneeRole, studentTaskId?: number): string {
  const open = studentTaskId ? `&open=${studentTaskId}` : '';
  if (role === 'STUDENT') return `/student-dashboard?tab=tasks${open}`;
  if (role === 'TEACHER') return `/teacher-dashboard?tab=tasks&space=assigned${open}`;
  return `/parent-dashboard?tab=tasks&space=assigned${open}`;
}

export function assigneeTasksUrl(role: TaskAssigneeRole, studentTaskId?: number): string | undefined {
  return getApplicationUrl(assigneeTasksPath(role, studentTaskId));
}

// ---------------------------------------------------------------------------
// Creators
// ---------------------------------------------------------------------------

export interface TaskCreatorFields {
  creatorRole: string;
  creatorId: number | null;
  creatorAdminEmail: string | null;
  creatorName: string | null;
  creator?: Person | null;
}

export interface TaskCreatorContact {
  role: 'TEACHER' | 'ADMIN';
  teacherId: number | null;
  name: string;
  email: string | null;
}

export function readCreator(task: TaskCreatorFields): TaskCreatorContact {
  if (task.creatorRole === 'ADMIN') {
    return {
      role: 'ADMIN',
      teacherId: null,
      name: task.creatorName?.trim() || 'ACHARYA Admin',
      email: task.creatorAdminEmail,
    };
  }
  return {
    role: 'TEACHER',
    teacherId: task.creatorId,
    name: task.creator?.name || task.creatorName || 'Mentor',
    email: task.creator?.email ?? null,
  };
}

/** Link for the creator to review an item: mentor dashboard, or the admin app when ADMIN_APP_URL is set. */
export function creatorReviewUrl(creator: TaskCreatorContact, studentTaskId?: number): string | undefined {
  if (creator.role === 'TEACHER') {
    return getApplicationUrl(`/teacher-dashboard?tab=tasks${studentTaskId ? `&open=${studentTaskId}` : ''}`);
  }
  const adminBase = process.env.ADMIN_APP_URL?.replace(/\/$/, '');
  return adminBase ? `${adminBase}/admin/tasks${studentTaskId ? `?open=${studentTaskId}` : ''}` : undefined;
}

/**
 * Emails a mentor when an admin acts on a task the mentor created (edits it,
 * reviews or comments on a student's copy). No-op for admin-created tasks.
 * Fire-and-forget.
 */
export function notifyMentorOfAdminChange(
  task: TaskCreatorFields & { id: number; title: string },
  adminName: string,
  what: string,
  details: { label: string; value: string }[] = [],
  studentTaskId?: number
): void {
  const creator = readCreator(task);
  if (creator.role !== 'TEACHER' || !creator.email) return;
  void sendAcademicNotification({
    recipients: [{ email: creator.email, name: creator.name }],
    subject: `Admin update on your task: ${task.title}`,
    heading: 'An admin updated your task',
    message: `${adminName} from the ACHARYA admin team ${what} on your task "${task.title}".`,
    details,
    actionLabel: 'Open task',
    actionUrl: creatorReviewUrl(creator, studentTaskId),
  }).catch((err) => console.error('Mentor notification failed:', err));
}

export const creatorInclude = { creator: { select: { id: true, name: true, email: true } } } satisfies Prisma.TaskInclude;

/** Admin-created tasks given to students linked to this mentor (the mentor's read-only "From admin" view). */
export function adminTasksForMentorWhere(teacherId: number): Prisma.StudentTaskWhereInput {
  return {
    assigneeRole: 'STUDENT',
    task: { creatorRole: 'ADMIN' },
    student: { teacherLinks: { some: { teacherId } } },
  };
}
