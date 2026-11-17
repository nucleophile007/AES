import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Admin task management: who can act on which task row. Prisma, email and
 * realtime are mocked; nothing touches a database.
 */

const mocks = vi.hoisted(() => ({
  prisma: {
    studentTask: { findUnique: vi.fn(), update: vi.fn() },
    taskActivity: { create: vi.fn() },
    taskComment: { findFirst: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
  sendAcademicNotification: vi.fn(() => Promise.resolve({ attempted: 1, sent: 1, failed: 0 })),
}));

vi.mock('./prisma', () => ({ prisma: mocks.prisma }));
vi.mock('./academic-notifications', () => ({
  sendAcademicNotification: mocks.sendAcademicNotification,
  getApplicationUrl: (path: string) => `https://app.test${path}`,
}));
vi.mock('./pusher-server', () => ({ getPusherServer: () => ({ trigger: () => Promise.resolve() }) }));

import { taskActorLabel, taskAssigneeName, taskCreatorName } from './tasks';
import {
  assigneeColumns,
  assigneeTasksPath,
  assigneeWhere,
  creatorReviewUrl,
  isAssignedTo,
  readAssignee,
  readCreator,
} from './task-actors';
import { feedbackAfterReview, reviewTaskItem, reviewerColumns, reviewerOwnsTask } from './task-review';
import { performAssigneeAction } from './task-assignee-actions';
import { addTaskComment } from './task-comments';
import { adminScopeWhere, authenticateAdminRequest, readAdminScope } from './task-admin';

const row = (over: Partial<Record<string, unknown>> = {}) => ({
  assigneeRole: 'STUDENT',
  studentId: 7,
  assigneeTeacherId: null,
  assigneeParentId: null,
  ...over,
});

const mentorTask = { creatorRole: 'TEACHER', creatorId: 3, creatorAdminEmail: null, creatorName: null };
const adminTask = { creatorRole: 'ADMIN', creatorId: null, creatorAdminEmail: 'ops@acharya.test', creatorName: 'Ops' };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.prisma.$transaction.mockImplementation(async (fn: (tx: typeof mocks.prisma) => unknown) => fn(mocks.prisma));
});

describe('display helpers', () => {
  it('names the creator for mentor and admin tasks', () => {
    expect(taskCreatorName({ creatorRole: 'TEACHER', creator: { name: 'Jane' } })).toBe('Jane');
    expect(taskCreatorName({ creatorRole: 'ADMIN', creatorName: 'Ops' })).toBe('Ops');
    expect(taskCreatorName({ creatorRole: 'ADMIN' })).toBe('ACHARYA Admin');
  });

  it('names the assignee whatever kind they are', () => {
    expect(taskAssigneeName({ student: { name: 'Sam' } })).toBe('Sam');
    expect(taskAssigneeName({ assigneeTeacher: { name: 'Mo' } })).toBe('Mo');
    expect(taskAssigneeName({ assigneeParent: { name: 'Pat' } })).toBe('Pat');
  });

  it('labels actor roles', () => {
    expect(taskActorLabel('teacher')).toBe('mentor');
    expect(taskActorLabel('admin')).toBe('admin');
  });
});

describe('assignee helpers', () => {
  it('builds one where clause and one set of columns per role', () => {
    expect(assigneeWhere({ role: 'TEACHER', id: 4 })).toEqual({ assigneeRole: 'TEACHER', assigneeTeacherId: 4 });
    expect(assigneeColumns({ role: 'PARENT', id: 9 })).toEqual({
      assigneeRole: 'PARENT',
      studentId: null,
      assigneeTeacherId: null,
      assigneeParentId: 9,
    });
  });

  it('matches only the exact assignee', () => {
    const parentRow = row({ assigneeRole: 'PARENT', studentId: null, assigneeParentId: 9 });
    expect(isAssignedTo(parentRow, { role: 'PARENT', id: 9 })).toBe(true);
    // Same id, different kind of person.
    expect(isAssignedTo(parentRow, { role: 'STUDENT', id: 9 })).toBe(false);
    expect(isAssignedTo(row(), { role: 'TEACHER', id: 7 })).toBe(false);
  });

  it('reads the assignee and creator', () => {
    expect(
      readAssignee({ ...row({ assigneeRole: 'TEACHER', studentId: null, assigneeTeacherId: 4 }), assigneeTeacher: { id: 4, name: 'Mo', email: 'mo@x.test' } })
    ).toEqual({ role: 'TEACHER', id: 4, name: 'Mo', email: 'mo@x.test' });
    expect(readCreator(adminTask)).toMatchObject({ role: 'ADMIN', teacherId: null, email: 'ops@acharya.test' });
  });

  it('links each assignee to their own dashboard', () => {
    expect(assigneeTasksPath('TEACHER', 5)).toBe('/teacher-dashboard?tab=tasks&space=assigned&open=5');
    expect(assigneeTasksPath('PARENT')).toBe('/parent-dashboard?tab=tasks&space=assigned');
    expect(assigneeTasksPath('STUDENT', 1)).toBe('/student-dashboard?tab=tasks&open=1');
  });

  it('links admins to the admin app only when it is configured', () => {
    const before = process.env.ADMIN_APP_URL;
    delete process.env.ADMIN_APP_URL;
    expect(creatorReviewUrl(readCreator(adminTask), 2)).toBeUndefined();
    process.env.ADMIN_APP_URL = 'https://admin.test/';
    expect(creatorReviewUrl(readCreator(adminTask), 2)).toBe('https://admin.test/admin/tasks?open=2');
    process.env.ADMIN_APP_URL = before;
  });
});

describe('review ownership', () => {
  const admin = { kind: 'admin' as const, email: 'a@x.test', name: 'A' };
  const mentor = { kind: 'teacher' as const, id: 3, name: 'Jane', email: 'j@x.test' };

  it('mentors review only their own tasks; admins only admin tasks', () => {
    expect(reviewerOwnsTask(mentor, mentorTask)).toBe(true);
    expect(reviewerOwnsTask({ ...mentor, id: 4 }, mentorTask)).toBe(false);
    expect(reviewerOwnsTask(mentor, adminTask)).toBe(false);
    expect(reviewerOwnsTask(admin, adminTask)).toBe(true);
    expect(reviewerOwnsTask(admin, mentorTask)).toBe(false);
  });

  it('approving clears an earlier change request unless new feedback is given', () => {
    expect(feedbackAfterReview('APPROVE', '', 'Please add a sentence')).toBeNull();
    expect(feedbackAfterReview('APPROVE', 'Great work', 'Please add a sentence')).toBe('Great work');
    expect(feedbackAfterReview('REOPEN', '', 'Please add a sentence')).toBe('Please add a sentence');
    expect(feedbackAfterReview('REQUEST_CHANGES', 'Fix X', null)).toBe('Fix X');
  });

  it('records who reviewed', () => {
    expect(reviewerColumns(admin)).toEqual({ reviewedById: null, reviewedByAdminEmail: 'a@x.test' });
    expect(reviewerColumns(mentor)).toEqual({ reviewedById: 3, reviewedByAdminEmail: null });
  });

  it('admins cannot review a mentor task (404, nothing written)', async () => {
    mocks.prisma.studentTask.findUnique.mockResolvedValue({
      ...row(),
      id: 1,
      taskId: 10,
      status: 'SUBMITTED',
      task: { ...mentorTask, isCancelled: false, title: 'T' },
      student: { id: 7, name: 'Sam', email: 's@x.test' },
    });
    const res = await reviewTaskItem(admin, 1, 'APPROVE', '');
    expect(res.status).toBe(404);
    expect(mocks.prisma.studentTask.update).not.toHaveBeenCalled();
  });

  it('admins approve admin tasks and the assignee is emailed', async () => {
    mocks.prisma.studentTask.findUnique.mockResolvedValue({
      ...row({ assigneeRole: 'PARENT', studentId: null, assigneeParentId: 9 }),
      id: 1,
      taskId: 10,
      status: 'SUBMITTED',
      mentorFeedback: null,
      completedAt: null,
      task: { ...adminTask, isCancelled: false, title: 'Upload form' },
      assigneeParent: { id: 9, name: 'Pat', email: 'p@x.test' },
    });
    mocks.prisma.studentTask.update.mockResolvedValue({ id: 1, status: 'COMPLETED' });
    const res = await reviewTaskItem(admin, 1, 'APPROVE', 'Thanks');
    expect(res.status).toBe(200);
    expect(mocks.prisma.studentTask.update.mock.calls[0][0].data).toMatchObject({
      status: 'COMPLETED',
      reviewedById: null,
      reviewedByAdminEmail: 'a@x.test',
    });
    expect(mocks.prisma.taskActivity.create.mock.calls[0][0].data).toMatchObject({ performedByRole: 'admin' });
    expect(mocks.sendAcademicNotification).toHaveBeenCalledWith(
      expect.objectContaining({ recipients: [{ email: 'p@x.test', name: 'Pat' }] })
    );
  });
});

describe('assignee actions', () => {
  const mentorAssignee = { role: 'TEACHER' as const, id: 4, name: 'Mo', email: 'mo@x.test' };

  it('a mentor works on a task the admin team assigned to them', async () => {
    mocks.prisma.studentTask.findUnique.mockResolvedValue({
      ...row({ assigneeRole: 'TEACHER', studentId: null, assigneeTeacherId: 4 }),
      id: 2,
      status: 'TODO',
      startedAt: null,
      task: { ...adminTask, id: 10, isCancelled: false, checklist: null, creator: null },
    });
    mocks.prisma.studentTask.update.mockResolvedValue({ id: 2, status: 'IN_PROGRESS' });
    const res = await performAssigneeAction(mentorAssignee, 2, { action: 'START' });
    expect(res.status).toBe(200);
    expect(mocks.prisma.taskActivity.create.mock.calls[0][0].data).toMatchObject({
      performedByRole: 'teacher',
      details: 'Task started by mentor (Status: In Progress)',
    });
  });

  it("a mentor can't act on a student's row through the assignee route", async () => {
    mocks.prisma.studentTask.findUnique.mockResolvedValue({
      ...row({ studentId: 4 }),
      id: 3,
      status: 'TODO',
      task: { ...mentorTask, id: 11, isCancelled: false },
    });
    const res = await performAssigneeAction(mentorAssignee, 3, { action: 'START' });
    expect(res.status).toBe(404);
    expect(mocks.prisma.studentTask.update).not.toHaveBeenCalled();
  });
});

describe('comments', () => {
  it('admins cannot comment on mentor tasks', async () => {
    mocks.prisma.studentTask.findUnique.mockResolvedValue({
      ...row(),
      id: 1,
      taskId: 10,
      task: { ...mentorTask, title: 'T', creator: { id: 3, name: 'Jane', email: 'j@x.test' } },
      student: { id: 7, name: 'Sam', email: 's@x.test' },
    });
    const res = await addTaskComment({ role: 'admin', id: 0, name: 'Ops', email: 'ops@x.test' }, 1, { content: 'hi' });
    expect(res.status).toBe(404);
    expect(mocks.prisma.taskComment.create).not.toHaveBeenCalled();
  });

  it('a parent comments on their own admin task and the creating admin is emailed', async () => {
    mocks.prisma.studentTask.findUnique.mockResolvedValue({
      ...row({ assigneeRole: 'PARENT', studentId: null, assigneeParentId: 9 }),
      id: 1,
      taskId: 10,
      task: { ...adminTask, title: 'Upload form', creator: null },
      assigneeParent: { id: 9, name: 'Pat', email: 'p@x.test' },
    });
    mocks.prisma.taskComment.findFirst.mockResolvedValue(null);
    mocks.prisma.taskComment.create.mockResolvedValue({ id: 5 });
    const res = await addTaskComment({ role: 'parent', id: 9, name: 'Pat', email: 'p@x.test' }, 1, { content: 'Done?' });
    expect(res.status).toBe(200);
    expect(mocks.sendAcademicNotification).toHaveBeenCalledWith(
      expect.objectContaining({ recipients: [{ email: 'ops@acharya.test', name: 'Ops' }] })
    );
  });
});

describe('admin integration auth and scope', () => {
  const KEY = 'k'.repeat(40);
  const req = (headers: Record<string, string>) =>
    new NextRequest('https://app.test/api/integrations/admin/tasks', { headers });

  beforeEach(() => {
    process.env.AES_ADMIN_TASKS_API_KEY = KEY;
  });

  it('requires the shared key and an acting admin email', () => {
    expect(authenticateAdminRequest(req({})).error?.status).toBe(401);
    expect(authenticateAdminRequest(req({ authorization: `Bearer ${KEY}x` })).error?.status).toBe(401);
    expect(authenticateAdminRequest(req({ authorization: `Bearer ${KEY}` })).error?.status).toBe(400);
    const ok = authenticateAdminRequest(req({ authorization: `Bearer ${KEY}`, 'x-admin-email': 'Ops@X.test', 'x-admin-name': 'Ops' }));
    expect(ok.admin).toEqual({ email: 'ops@x.test', name: 'Ops' });
  });

  it('refuses to run with a short or missing key', () => {
    process.env.AES_ADMIN_TASKS_API_KEY = 'short';
    expect(authenticateAdminRequest(req({ authorization: 'Bearer short', 'x-admin-email': 'a@x.test' })).error?.status).toBe(503);
  });

  it('filters by source, mentor and assignee type', () => {
    expect(adminScopeWhere(readAdminScope(new URLSearchParams('source=admin')))).toEqual({ task: { creatorRole: 'ADMIN' } });
    expect(adminScopeWhere(readAdminScope(new URLSearchParams('creatorTeacherId=3&assigneeRole=PARENT')))).toEqual({
      task: { creatorRole: 'TEACHER', creatorId: 3 },
      assigneeRole: 'PARENT',
    });
    expect(adminScopeWhere(readAdminScope(new URLSearchParams('source=bogus&assigneeRole=nope')))).toEqual({});
  });
});
