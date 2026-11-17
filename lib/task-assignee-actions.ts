import type { Prisma } from '../generated/prisma';
import { prisma } from './prisma';
import { sendAcademicNotification } from './academic-notifications';
import {
  canStudentPerform,
  getMissingRequirements,
  isSafeHttpUrl,
  isTaskUploadUrl,
  readChecklist,
  readChecklistDone,
  taskHasSubmissionRequirements,
  type StudentTaskAction,
} from './tasks';
import { publishTaskEvent, rowAudience } from './task-server';
import {
  assigneeActorRole,
  creatorInclude,
  creatorReviewUrl,
  isAssignedTo,
  readCreator,
  type TaskAssignee,
} from './task-actors';

/**
 * Everything an assignee (student, mentor or parent) can do on their own copy
 * of a task: start it, tick checklist steps, save a draft, submit, or finish
 * it directly. Shared by /api/student/tasks/[id] and /api/tasks/assigned/[id].
 */

export interface TaskActionResult {
  status: number;
  body: { success: boolean; error?: string; task?: unknown };
}

const ok = (task: unknown): TaskActionResult => ({ status: 200, body: { success: true, task } });
const fail = (status: number, error: string): TaskActionResult => ({ status, body: { success: false, error } });

const ASSIGNEE_ACTIONS: unknown[] = ['START', 'SAVE_DRAFT', 'SUBMIT', 'COMPLETE_DIRECT', 'TOGGLE_CHECKLIST'];

/**
 * Files must come from our own upload endpoint. Inline data URIs are only
 * produced by the local-dev fallback when R2 isn't configured.
 */
export function isAcceptedTaskFileUrl(value: unknown): boolean {
  if (isTaskUploadUrl(value, process.env.R2_PUBLIC_URL)) return true;
  return (
    process.env.NODE_ENV !== 'production' &&
    !process.env.R2_PUBLIC_URL &&
    typeof value === 'string' &&
    value.startsWith('data:')
  );
}

/** Full detail of one of the assignee's tasks, or null if it isn't theirs. */
export async function getAssigneeTaskDetail(assignee: TaskAssignee, studentTaskId: number) {
  const row = await prisma.studentTask.findUnique({
    where: { id: studentTaskId },
    include: {
      task: {
        include: {
          ...creatorInclude,
          linkedAssignment: { select: { id: true, title: true, dueDate: true } },
          linkedResource: { select: { id: true, title: true, type: true, fileUrl: true } },
          linkedMeeting: { select: { id: true, title: true, startDateTime: true } },
        },
      },
      comments: { orderBy: { createdAt: 'asc' } },
      activities: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!row || !isAssignedTo(row, assignee)) return null;
  return row;
}

export async function performAssigneeAction(
  assignee: TaskAssignee,
  studentTaskId: number,
  body: Record<string, unknown>
): Promise<TaskActionResult> {
  const existing = await prisma.studentTask.findUnique({
    where: { id: studentTaskId },
    include: { task: { include: creatorInclude } },
  });
  if (!existing || !isAssignedTo(existing, assignee)) return fail(404, 'Task not found or access denied');

  const task = existing.task;
  const creator = readCreator(task);
  const reviewerWord = creator.role === 'ADMIN' ? 'the admin team' : 'the mentor';
  if (task.isCancelled) return fail(400, `This task has been cancelled by ${reviewerWord}`);

  const { action, submissionNote, submissionUrl, submissionFileUrl, submissionFileName, submissionExternalConfirmed } =
    body as {
      action?: unknown;
      submissionNote?: string | null;
      submissionUrl?: string | null;
      submissionFileUrl?: string | null;
      submissionFileName?: string | null;
      submissionExternalConfirmed?: unknown;
    };

  if (!ASSIGNEE_ACTIONS.includes(action)) return fail(400, 'Invalid action');

  if (!canStudentPerform(action as StudentTaskAction, existing.status)) {
    const reason =
      existing.status === 'SUBMITTED'
        ? `This task is waiting for review by ${reviewerWord} and can no longer be changed.`
        : existing.status === 'COMPLETED'
          ? 'This task is already completed.'
          : 'This task has already been started.';
    return fail(409, reason);
  }

  if (typeof submissionUrl === 'string' && submissionUrl.trim() && !isSafeHttpUrl(submissionUrl)) {
    return fail(400, 'Submission URL must be a valid http:// or https:// link.');
  }
  if (submissionFileUrl && !isAcceptedTaskFileUrl(submissionFileUrl)) {
    return fail(400, 'Please attach files using the upload button.');
  }

  const now = new Date();
  const actorRole = assigneeActorRole(assignee.role);
  const roleWord = actorRole === 'teacher' ? 'mentor' : actorRole;
  const notifyBoards = () =>
    publishTaskEvent(rowAudience(existing, creator.teacherId), {
      type: 'task.changed',
      taskId: task.id,
      studentTaskId,
      actorRole,
    });
  const activity = (act: string, details: string) => ({
    studentTaskId,
    action: act,
    details,
    performedById: assignee.id,
    performedByRole: actorRole,
    performedByName: assignee.name,
  });

  if (action === 'TOGGLE_CHECKLIST') {
    const items = readChecklist(task.checklist);
    const itemId = typeof body.itemId === 'string' ? body.itemId : '';
    if (!items.some((i) => i.id === itemId)) return fail(400, 'Checklist item not found');
    const done = new Set(readChecklistDone(existing.checklistDone, items));
    if (body.done === false) done.delete(itemId);
    else done.add(itemId);

    const updated = await prisma.studentTask.update({
      where: { id: studentTaskId },
      data: {
        checklistDone: Array.from(done) as unknown as Prisma.InputJsonValue,
        status: existing.status === 'TODO' ? 'IN_PROGRESS' : existing.status,
        startedAt: existing.startedAt || now,
      },
    });
    notifyBoards();
    return ok(updated);
  }

  if (action === 'START') {
    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.studentTask.update({
        where: { id: studentTaskId },
        data: { status: 'IN_PROGRESS', startedAt: existing.startedAt || now },
      });
      await tx.taskActivity.create({
        data: activity('STATUS_CHANGED', `Task started by ${roleWord} (Status: In Progress)`),
      });
      return res;
    });
    notifyBoards();
    return ok(updated);
  }

  if (action === 'SAVE_DRAFT') {
    const updated = await prisma.studentTask.update({
      where: { id: studentTaskId },
      data: {
        submissionNote: submissionNote !== undefined ? submissionNote : existing.submissionNote,
        submissionUrl: submissionUrl !== undefined ? submissionUrl : existing.submissionUrl,
        submissionFileUrl: submissionFileUrl !== undefined ? submissionFileUrl : existing.submissionFileUrl,
        submissionFileName: submissionFileName !== undefined ? submissionFileName : existing.submissionFileName,
        submissionExternalConfirmed:
          submissionExternalConfirmed !== undefined
            ? Boolean(submissionExternalConfirmed)
            : existing.submissionExternalConfirmed,
        status: existing.status === 'TODO' ? 'IN_PROGRESS' : existing.status,
        startedAt: existing.startedAt || now,
      },
    });
    notifyBoards();
    return ok(updated);
  }

  if (action === 'SUBMIT') {
    const finalNote =
      submissionNote !== undefined ? submissionNote?.trim() || '' : existing.submissionNote || '';
    const finalUrl = submissionUrl !== undefined ? submissionUrl?.trim() || '' : existing.submissionUrl || '';
    const finalFileUrl = submissionFileUrl !== undefined ? submissionFileUrl : existing.submissionFileUrl;
    const finalFileName = submissionFileName !== undefined ? submissionFileName : existing.submissionFileName;
    const finalExternal =
      submissionExternalConfirmed !== undefined
        ? Boolean(submissionExternalConfirmed)
        : existing.submissionExternalConfirmed;

    // A draft saved before validation existed could hold a bad link.
    if (finalUrl && !isSafeHttpUrl(finalUrl)) return fail(400, 'Submission URL must be a valid http:// or https:// link.');
    if (finalFileUrl && !isAcceptedTaskFileUrl(finalFileUrl)) {
      return fail(400, 'Please re-attach your file using the upload button.');
    }

    const missing = getMissingRequirements(task, {
      note: finalNote,
      url: finalUrl,
      fileUrl: finalFileUrl,
      externalConfirmed: finalExternal,
      checklistDone: existing.checklistDone,
    });
    if (missing.length > 0) {
      return fail(400, `Please complete the following requirement(s): ${missing.join(', ')}`);
    }

    const requiresApproval = task.requireMentorApproval;
    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.studentTask.update({
        where: { id: studentTaskId },
        data: {
          submissionNote: finalNote,
          submissionUrl: finalUrl,
          submissionFileUrl: finalFileUrl,
          submissionFileName: finalFileName,
          submissionExternalConfirmed: finalExternal,
          status: requiresApproval ? 'SUBMITTED' : 'COMPLETED',
          startedAt: existing.startedAt || now,
          submittedAt: now,
          completedAt: requiresApproval ? null : now,
        },
      });
      await tx.taskActivity.create({
        data: activity(
          requiresApproval ? 'SUBMITTED' : 'COMPLETED',
          requiresApproval
            ? `Task submitted for ${creator.role === 'ADMIN' ? 'admin' : 'mentor'} review with all required materials`
            : `Task completed by ${roleWord}`
        ),
      });
      return res;
    });

    if (requiresApproval && creator.email) {
      const whoLabel = roleWord.charAt(0).toUpperCase() + roleWord.slice(1);
      void sendAcademicNotification({
        recipients: [{ email: creator.email, name: creator.name }],
        subject: `Task Submitted for Review: ${task.title}`,
        heading: `${whoLabel} Task Submission`,
        message: `${whoLabel} ${assignee.name} has submitted task "${task.title}" for your review.`,
        details: [
          { label: whoLabel, value: assignee.name },
          { label: 'Task', value: task.title },
          { label: 'Submission Note', value: finalNote || 'None provided' },
          { label: 'Submitted URL', value: finalUrl || 'None provided' },
        ],
        actionLabel: creator.role === 'ADMIN' ? 'Review in Admin' : 'Review in Mentor Dashboard',
        actionUrl: creatorReviewUrl(creator, studentTaskId),
      }).catch((err) => console.error('Failed to notify task creator of submission:', err));
    }

    notifyBoards();
    return ok(updated);
  }

  // COMPLETE_DIRECT: only when nothing needs filling in and no approval is required.
  if (task.requireMentorApproval) return fail(400, `This task requires review by ${reviewerWord} before completion.`);
  if (taskHasSubmissionRequirements(task)) {
    return fail(400, 'This task has submission requirements. Please submit it instead.');
  }
  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.studentTask.update({
      where: { id: studentTaskId },
      data: { status: 'COMPLETED', startedAt: existing.startedAt || now, completedAt: now },
    });
    await tx.taskActivity.create({ data: activity('COMPLETED', `Task marked as completed by ${roleWord}`) });
    return res;
  });
  notifyBoards();
  return ok(updated);
}
