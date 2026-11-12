import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { prisma } from './prisma';

/**
 * Writes to the database in DATABASE_URL, so it only runs when explicitly
 * enabled — point DATABASE_URL at a dev/test database first (never production):
 *
 *   RUN_DB_INTEGRATION_TESTS=1 npx vitest --run lib/tasks.integration.spec.ts
 *
 * It creates its own mentor and students (never reuses real accounts) and
 * deletes everything it created afterwards.
 */
const runIntegration = process.env.RUN_DB_INTEGRATION_TESTS === '1';

describe.skipIf(!runIntegration)('Task Management End-to-End Database Integration', () => {
  const runTag = `task-it-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let testTeacherId: number;
  let testStudent1Id: number;
  let testStudent2Id: number;
  let createdTaskId: number;

  beforeAll(async () => {
    const teacher = await prisma.teacher.create({
      data: { name: 'Integration Test Mentor', email: `${runTag}-mentor@example.invalid`, programs: ['General'] },
    });
    testTeacherId = teacher.id;

    const makeStudent = (n: number) =>
      prisma.student.create({
        data: {
          name: `Integration Student ${n}`,
          email: `${runTag}-student${n}@example.invalid`,
          grade: '11th',
          schoolName: 'Test High',
          parentName: `Test Parent ${n}`,
          parentEmail: `${runTag}-parent${n}@example.invalid`,
          parentPhone: '0000000000',
          program: 'General',
        },
      });
    const [s1, s2] = await Promise.all([makeStudent(1), makeStudent(2)]);
    testStudent1Id = s1.id;
    testStudent2Id = s2.id;
  }, 30000);

  afterAll(async () => {
    // Deleting the teacher/students cascades to Task, StudentTask, comments and activity.
    if (createdTaskId) await prisma.task.deleteMany({ where: { id: createdTaskId } });
    const studentIds = [testStudent1Id, testStudent2Id].filter(Boolean);
    if (studentIds.length) await prisma.student.deleteMany({ where: { id: { in: studentIds } } });
    if (testTeacherId) await prisma.teacher.deleteMany({ where: { id: testTeacherId } });
  }, 30000);

  it('creates a task assigned to multiple students with independent progress tracking', async () => {
    const task = await prisma.task.create({
      data: {
        title: 'Email Professor for Lab Visit',
        description: 'Send a professional email requesting a 15-minute lab tour.',
        category: 'Outreach',
        priority: 'HIGH',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        creatorId: testTeacherId,
        requireSubmissionNote: true,
        requireUrl: true,
        requireMentorApproval: true,
        studentTasks: {
          create: [
            { studentId: testStudent1Id, status: 'TODO' },
            { studentId: testStudent2Id, status: 'TODO' },
          ],
        },
      },
      include: {
        studentTasks: {
          include: { student: true },
        },
      },
    });

    createdTaskId = task.id;

    expect(task.id).toBeDefined();
    expect(task.studentTasks.length).toBe(2);

    const st1 = task.studentTasks.find((st) => st.studentId === testStudent1Id);
    const st2 = task.studentTasks.find((st) => st.studentId === testStudent2Id);

    expect(st1).toBeDefined();
    expect(st2).toBeDefined();
    expect(st1?.status).toBe('TODO');
    expect(st2?.status).toBe('TODO');

    // Student 1 starts their task
    const started = await prisma.studentTask.update({
      where: { id: st1!.id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
    expect(started.status).toBe('IN_PROGRESS');

    // Student 2's task MUST remain at TODO (independent tracking)
    const freshSt2 = await prisma.studentTask.findUnique({ where: { id: st2!.id } });
    expect(freshSt2?.status).toBe('TODO');

    // Student 1 submits for review with note & url
    const submitted = await prisma.studentTask.update({
      where: { id: st1!.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        submissionNote: 'Email sent to Dr. Robert at 10:30 AM',
        submissionUrl: 'https://example.com/draft-email',
      },
    });
    expect(submitted.status).toBe('SUBMITTED');
    expect(submitted.submissionNote).toContain('Dr. Robert');

    // Mentor requests changes
    const changesRequested = await prisma.studentTask.update({
      where: { id: st1!.id },
      data: {
        status: 'CHANGES_REQUESTED',
        mentorFeedback: 'Please CC your school counselor on the follow-up',
        reviewedAt: new Date(),
        reviewedById: testTeacherId,
      },
    });
    expect(changesRequested.status).toBe('CHANGES_REQUESTED');
    expect(changesRequested.mentorFeedback).toContain('counselor');

    // Student 1 updates and re-submits
    const reSubmitted = await prisma.studentTask.update({
      where: { id: st1!.id },
      data: {
        status: 'SUBMITTED',
        submissionNote: 'Sent follow-up with counselor in CC',
      },
    });
    expect(reSubmitted.status).toBe('SUBMITTED');

    // Mentor approves task
    const approved = await prisma.studentTask.update({
      where: { id: st1!.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        mentorFeedback: 'Looks great! Lab visit confirmed.',
      },
    });
    expect(approved.status).toBe('COMPLETED');
    expect(approved.completedAt).toBeDefined();

    // Student 2 remains completely independent at TODO
    const finalSt2 = await prisma.studentTask.findUnique({ where: { id: st2!.id } });
    expect(finalSt2?.status).toBe('TODO');
  }, 30000);

  it('supports threaded task comments and audit activity logs', async () => {
    const task = await prisma.task.findUnique({
      where: { id: createdTaskId },
      include: { studentTasks: true },
    });
    const st1 = task!.studentTasks[0];

    // Add comment
    const comment = await prisma.taskComment.create({
      data: {
        studentTaskId: st1.id,
        authorId: testStudent1Id,
        authorRole: 'student',
        authorName: 'Student One',
        content: 'Should I attach my resume as a PDF?',
      },
    });
    expect(comment.content).toContain('resume');

    // Add activity
    const activity = await prisma.taskActivity.create({
      data: {
        studentTaskId: st1.id,
        action: 'COMMENT_ADDED',
        details: 'Question asked by student regarding resume attachment',
        performedById: testStudent1Id,
        performedByRole: 'student',
        performedByName: 'Student One',
      },
    });
    expect(activity.action).toBe('COMMENT_ADDED');

    // Verify retrieval
    const fresh = await prisma.studentTask.findUnique({
      where: { id: st1.id },
      include: { comments: true, activities: true },
    });

    expect(fresh?.comments.length).toBeGreaterThanOrEqual(1);
    expect(fresh?.activities.length).toBeGreaterThanOrEqual(1);
  }, 30000);
});