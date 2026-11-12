import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { sendAcademicNotification } from '@/lib/academic-notifications';
import {
  canStudentPerform,
  getMissingRequirements,
  isSafeHttpUrl,
  isTaskUploadUrl,
  taskHasSubmissionRequirements,
  readChecklist,
  readChecklistDone,
  type StudentTaskAction,
} from '@/lib/tasks';
import { publishTaskEvent } from '@/lib/task-server';
import type { Prisma } from '@/generated/prisma';

const STUDENT_ACTIONS: unknown[] = ['START', 'SAVE_DRAFT', 'SUBMIT', 'COMPLETE_DIRECT', 'TOGGLE_CHECKLIST'];

/**
 * Files must come from our own upload endpoint. Inline data URIs are only
 * produced by the local-dev fallback when R2 isn't configured.
 */
function isAcceptedTaskFileUrl(value: unknown): boolean {
  if (isTaskUploadUrl(value, process.env.R2_PUBLIC_URL)) return true;
  return (
    process.env.NODE_ENV !== 'production' &&
    !process.env.R2_PUBLIC_URL &&
    typeof value === 'string' &&
    value.startsWith('data:')
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'student')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const { id } = await params;
    const studentTaskId = Number(id);
    if (!Number.isFinite(studentTaskId)) {
      return NextResponse.json({ success: false, error: 'Invalid task ID' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const studentTask = await prisma.studentTask.findUnique({
      where: { id: studentTaskId },
      include: {
        task: {
          include: {
            creator: { select: { id: true, name: true, email: true } },
            linkedAssignment: { select: { id: true, title: true, dueDate: true } },
            linkedResource: { select: { id: true, title: true, type: true, fileUrl: true } },
            linkedMeeting: { select: { id: true, title: true, startDateTime: true } },
          },
        },
        comments: { orderBy: { createdAt: 'asc' } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!studentTask || studentTask.studentId !== student.id) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: studentTask });
  } catch (error) {
    console.error('Error fetching student task details:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'student')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const { id } = await params;
    const studentTaskId = Number(id);
    if (!Number.isFinite(studentTaskId)) {
      return NextResponse.json({ success: false, error: 'Invalid task ID' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { email: user.email },
      select: { id: true, name: true, email: true },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const existingStudentTask = await prisma.studentTask.findUnique({
      where: { id: studentTaskId },
      include: {
        task: {
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!existingStudentTask || existingStudentTask.studentId !== student.id) {
      return NextResponse.json({ success: false, error: 'Task not found or access denied' }, { status: 404 });
    }

    if (existingStudentTask.task.isCancelled) {
      return NextResponse.json({ success: false, error: 'This task has been cancelled by the mentor' }, { status: 400 });
    }

    const body = await request.json();
    const {
      action, // 'START' | 'SAVE_DRAFT' | 'SUBMIT' | 'COMPLETE_DIRECT'
      submissionNote,
      submissionUrl,
      submissionFileUrl,
      submissionFileName,
      submissionExternalConfirmed,
    } = body;

    const task = existingStudentTask.task;
    const now = new Date();
    const notifyBoards = () =>
      publishTaskEvent(
        { teacherIds: [task.creatorId], studentIds: [student.id] },
        { type: 'task.changed', taskId: task.id, studentTaskId, actorRole: 'student' }
      );

    if (!STUDENT_ACTIONS.includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    if (!canStudentPerform(action as StudentTaskAction, existingStudentTask.status)) {
      const reason =
        existingStudentTask.status === 'SUBMITTED'
          ? 'This task is waiting for mentor review and can no longer be changed.'
          : existingStudentTask.status === 'COMPLETED'
            ? 'This task is already completed.'
            : 'This task has already been started.';
      return NextResponse.json({ success: false, error: reason }, { status: 409 });
    }

    // Validate submission links whenever they are provided.
    if (typeof submissionUrl === 'string' && submissionUrl.trim() && !isSafeHttpUrl(submissionUrl)) {
      return NextResponse.json(
        { success: false, error: 'Submission URL must be a valid http:// or https:// link.' },
        { status: 400 }
      );
    }
    if (submissionFileUrl && !isAcceptedTaskFileUrl(submissionFileUrl)) {
      return NextResponse.json(
        { success: false, error: 'Please attach files using the upload button.' },
        { status: 400 }
      );
    }

    if (action === 'TOGGLE_CHECKLIST') {
      const items = readChecklist(task.checklist);
      const itemId = typeof body.itemId === 'string' ? body.itemId : '';
      if (!items.some((i) => i.id === itemId)) {
        return NextResponse.json({ success: false, error: 'Checklist item not found' }, { status: 400 });
      }
      const done = new Set(readChecklistDone(existingStudentTask.checklistDone, items));
      if (body.done === false) done.delete(itemId);
      else done.add(itemId);

      const updated = await prisma.studentTask.update({
        where: { id: studentTaskId },
        data: {
          checklistDone: Array.from(done) as unknown as Prisma.InputJsonValue,
          status: existingStudentTask.status === 'TODO' ? 'IN_PROGRESS' : existingStudentTask.status,
          startedAt: existingStudentTask.startedAt || now,
        },
      });
      notifyBoards();
      return NextResponse.json({ success: true, task: updated });
    }

    if (action === 'START') {
      const updated = await prisma.$transaction(async (tx) => {
        const res = await tx.studentTask.update({
          where: { id: studentTaskId },
          data: {
            status: 'IN_PROGRESS',
            startedAt: existingStudentTask.startedAt || now,
          },
        });

        await tx.taskActivity.create({
          data: {
            studentTaskId,
            action: 'STATUS_CHANGED',
            details: 'Task started by student (Status: In Progress)',
            performedById: student.id,
            performedByRole: 'student',
            performedByName: student.name,
          },
        });

        return res;
      });

      notifyBoards();
      return NextResponse.json({ success: true, task: updated });
    }

    if (action === 'SAVE_DRAFT') {
      const updated = await prisma.studentTask.update({
        where: { id: studentTaskId },
        data: {
          submissionNote: submissionNote !== undefined ? submissionNote : existingStudentTask.submissionNote,
          submissionUrl: submissionUrl !== undefined ? submissionUrl : existingStudentTask.submissionUrl,
          submissionFileUrl: submissionFileUrl !== undefined ? submissionFileUrl : existingStudentTask.submissionFileUrl,
          submissionFileName: submissionFileName !== undefined ? submissionFileName : existingStudentTask.submissionFileName,
          submissionExternalConfirmed: submissionExternalConfirmed !== undefined ? Boolean(submissionExternalConfirmed) : existingStudentTask.submissionExternalConfirmed,
          status: existingStudentTask.status === 'TODO' ? 'IN_PROGRESS' : existingStudentTask.status,
          startedAt: existingStudentTask.startedAt || now,
        },
      });

      notifyBoards();
      return NextResponse.json({ success: true, task: updated });
    }

    if (action === 'SUBMIT') {
      const finalNote = submissionNote !== undefined ? (submissionNote?.trim() || '') : (existingStudentTask.submissionNote || '');
      const finalUrl = submissionUrl !== undefined ? (submissionUrl?.trim() || '') : (existingStudentTask.submissionUrl || '');
      const finalFileUrl = submissionFileUrl !== undefined ? submissionFileUrl : existingStudentTask.submissionFileUrl;
      const finalFileName = submissionFileName !== undefined ? submissionFileName : existingStudentTask.submissionFileName;
      const finalExternal = submissionExternalConfirmed !== undefined ? Boolean(submissionExternalConfirmed) : existingStudentTask.submissionExternalConfirmed;

      // A draft saved before validation existed could hold a bad link.
      if (finalUrl && !isSafeHttpUrl(finalUrl)) {
        return NextResponse.json(
          { success: false, error: 'Submission URL must be a valid http:// or https:// link.' },
          { status: 400 }
        );
      }
      if (finalFileUrl && !isAcceptedTaskFileUrl(finalFileUrl)) {
        return NextResponse.json(
          { success: false, error: 'Please re-attach your file using the upload button.' },
          { status: 400 }
        );
      }

      const missingRequirements = getMissingRequirements(task, {
        note: finalNote,
        url: finalUrl,
        fileUrl: finalFileUrl,
        externalConfirmed: finalExternal,
        checklistDone: existingStudentTask.checklistDone,
      });

      if (missingRequirements.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Please complete the following requirement(s): ${missingRequirements.join(', ')}`,
          },
          { status: 400 }
        );
      }

      const requiresApproval = task.requireMentorApproval;
      const newStatus = requiresApproval ? 'SUBMITTED' : 'COMPLETED';

      const updated = await prisma.$transaction(async (tx) => {
        const res = await tx.studentTask.update({
          where: { id: studentTaskId },
          data: {
            submissionNote: finalNote,
            submissionUrl: finalUrl,
            submissionFileUrl: finalFileUrl,
            submissionFileName: finalFileName,
            submissionExternalConfirmed: finalExternal,
            status: newStatus,
            startedAt: existingStudentTask.startedAt || now,
            submittedAt: now,
            completedAt: requiresApproval ? null : now,
          },
        });

        await tx.taskActivity.create({
          data: {
            studentTaskId,
            action: requiresApproval ? 'SUBMITTED' : 'COMPLETED',
            details: requiresApproval
              ? 'Task submitted for mentor review with all required materials'
              : 'Task completed by student',
            performedById: student.id,
            performedByRole: 'student',
            performedByName: student.name,
          },
        });

        return res;
      });

      // Notify mentor if mentor approval is required
      if (requiresApproval && task.creator) {
        try {
          void sendAcademicNotification({
            recipients: [{ email: task.creator.email, name: task.creator.name }],
            subject: `Task Submitted for Review: ${task.title}`,
            heading: 'Student Task Submission',
            message: `Student ${student.name} has submitted task "${task.title}" for your review.`,
            details: [
              { label: 'Student', value: student.name },
              { label: 'Task', value: task.title },
              { label: 'Submission Note', value: finalNote || 'None provided' },
              { label: 'Submitted URL', value: finalUrl || 'None provided' },
            ],
            actionLabel: 'Review in Mentor Dashboard',
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/teacher-dashboard?tab=tasks`,
          }).catch((err) => console.error('Failed to notify mentor of submission:', err));
        } catch (e) {
          console.warn('Could not trigger review notification email:', e);
        }
      }

      notifyBoards();
      return NextResponse.json({ success: true, task: updated });
    }

    if (action === 'COMPLETE_DIRECT') {
      // Direct completion allowed only if no submissions required and mentor approval is not required
      if (task.requireMentorApproval) {
        return NextResponse.json(
          { success: false, error: 'This task requires mentor review before completion.' },
          { status: 400 }
        );
      }

      if (taskHasSubmissionRequirements(task)) {
        return NextResponse.json(
          { success: false, error: 'This task has submission requirements. Please submit it instead.' },
          { status: 400 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        const res = await tx.studentTask.update({
          where: { id: studentTaskId },
          data: {
            status: 'COMPLETED',
            startedAt: existingStudentTask.startedAt || now,
            completedAt: now,
          },
        });

        await tx.taskActivity.create({
          data: {
            studentTaskId,
            action: 'COMPLETED',
            details: 'Task marked as completed by student',
            performedById: student.id,
            performedByRole: 'student',
            performedByName: student.name,
          },
        });

        return res;
      });

      notifyBoards();
      return NextResponse.json({ success: true, task: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating student task:', error);
    return NextResponse.json({ success: false, error: 'Internal server error updating task' }, { status: 500 });
  }
}

