import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import {
  parseChecklistField,
  parseOptionalDate,
  parseRecurrenceField,
  publishTaskEvent,
  resolveAssignableStudents,
  resolveTaskLinks,
} from '@/lib/task-server';

type RouteContext = { params: Promise<{ id: string }> };

async function getTeacherAndTaskId(request: NextRequest, params: RouteContext['params']) {
  const user = await getUserFromRequest(request);
  if (!user) return { error: NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }) };
  if (!hasRole(user, 'teacher')) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 }) };
  }
  const taskId = Number((await params).id);
  if (!Number.isInteger(taskId)) {
    return { error: NextResponse.json({ success: false, error: 'Invalid task ID' }, { status: 400 }) };
  }
  const teacher = await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true, name: true } });
  if (!teacher) return { error: NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 }) };
  return { teacher, taskId };
}

const notFound = () => NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await getTeacherAndTaskId(request, params);
    if (ctx.error) return ctx.error;
    const { teacher, taskId } = ctx;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        template: { select: { id: true, name: true } },
        linkedAssignment: { select: { id: true, title: true, dueDate: true } },
        linkedResource: { select: { id: true, title: true, type: true, fileUrl: true } },
        linkedMeeting: { select: { id: true, title: true, startDateTime: true } },
        studentTasks: {
          include: {
            student: { select: { id: true, name: true, email: true, grade: true, program: true, schoolName: true } },
            comments: { orderBy: { createdAt: 'asc' } },
            activities: { orderBy: { createdAt: 'desc' } },
          },
          orderBy: { student: { name: 'asc' } },
        },
      },
    });

    // 404 (not 403) for other mentors' tasks so IDs can't be probed.
    if (!task || task.creatorId !== teacher.id) return notFound();

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error fetching task details:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await getTeacherAndTaskId(request, params);
    if (ctx.error) return ctx.error;
    const { teacher, taskId } = ctx;

    const existingTask = await prisma.task.findUnique({ where: { id: taskId }, include: { studentTasks: true } });
    if (!existingTask || existingTask.creatorId !== teacher.id) return notFound();

    const body = await request.json();
    const {
      title,
      description,
      category,
      priority,
      requireSubmissionNote,
      requireFileUpload,
      requireUrl,
      requireExternalConfirmation,
      requireChecklistComplete,
      externalConfirmationPrompt,
      requireMentorApproval,
      isCancelled,
      assignStudentIds,
      assignGroupIds,
    } = body;

    // Additional students (explicit or via groups) must be linked to this mentor.
    let newStudentIds: number[] = [];
    const wantsMoreStudents =
      (Array.isArray(assignStudentIds) && assignStudentIds.length > 0) ||
      (Array.isArray(assignGroupIds) && assignGroupIds.length > 0);
    if (wantsMoreStudents) {
      const resolved = await resolveAssignableStudents(teacher.id, assignStudentIds ?? [], assignGroupIds ?? []);
      if (!resolved.ok) return NextResponse.json({ success: false, error: resolved.error }, { status: 400 });
      const current = new Set(existingTask.studentTasks.map((st) => st.studentId));
      newStudentIds = resolved.students.map((s) => s.id).filter((sId) => !current.has(sId));
    }

    const links = await resolveTaskLinks(teacher.id, body);
    if (!links.ok) return NextResponse.json({ success: false, error: links.error }, { status: 400 });

    const updateData: Record<string, unknown> = { ...links.data };

    if (typeof title === 'string' && title.trim()) updateData.title = title.trim();
    if (typeof description === 'string' && description.trim()) updateData.description = description.trim();
    if (typeof category === 'string') updateData.category = category.trim() || 'General';
    if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) updateData.priority = priority;

    const deadline = parseOptionalDate(body.deadline);
    if (deadline !== undefined) updateData.deadline = deadline;

    const recurrence = parseRecurrenceField(body.recurrence);
    if (recurrence !== undefined) updateData.recurrence = recurrence;
    const recurrenceEndsAt = parseOptionalDate(body.recurrenceEndsAt);
    if (recurrenceEndsAt !== undefined) updateData.recurrenceEndsAt = recurrenceEndsAt;

    const finalRecurrence = recurrence !== undefined ? recurrence : existingTask.recurrence;
    const finalDeadline = deadline !== undefined ? deadline : existingTask.deadline;
    if (finalRecurrence && !finalDeadline) {
      return NextResponse.json(
        { success: false, error: 'Recurring tasks need a deadline to repeat from' },
        { status: 400 }
      );
    }

    const checklist = parseChecklistField(body.checklist);
    if (checklist !== undefined) updateData.checklist = checklist;

    if (typeof requireSubmissionNote === 'boolean') updateData.requireSubmissionNote = requireSubmissionNote;
    if (typeof requireFileUpload === 'boolean') updateData.requireFileUpload = requireFileUpload;
    if (typeof requireUrl === 'boolean') updateData.requireUrl = requireUrl;
    if (typeof requireExternalConfirmation === 'boolean') {
      updateData.requireExternalConfirmation = requireExternalConfirmation;
    }
    if (externalConfirmationPrompt !== undefined) {
      updateData.externalConfirmationPrompt =
        typeof externalConfirmationPrompt === 'string' && externalConfirmationPrompt.trim()
          ? externalConfirmationPrompt.trim()
          : null;
    }
    if (typeof requireMentorApproval === 'boolean') updateData.requireMentorApproval = requireMentorApproval;
    if (typeof requireChecklistComplete === 'boolean') updateData.requireChecklistComplete = requireChecklistComplete;
    if (typeof isCancelled === 'boolean') updateData.isCancelled = isCancelled;

    const deadlineChanged =
      deadline !== undefined && (deadline?.getTime() ?? null) !== (existingTask.deadline?.getTime() ?? null);

    const updatedTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.update({ where: { id: taskId }, data: updateData });

      // A new deadline means reminders should fire again for it.
      if (deadlineChanged) {
        await tx.studentTask.updateMany({
          where: { taskId },
          data: { dueSoonReminderSentAt: null, overdueReminderSentAt: null },
        });
      }

      const logAll = async (action: string, details: string) => {
        if (!existingTask.studentTasks.length) return;
        await tx.taskActivity.createMany({
          data: existingTask.studentTasks.map((st) => ({
            studentTaskId: st.id,
            action,
            details,
            performedById: teacher.id,
            performedByRole: 'teacher',
            performedByName: teacher.name,
          })),
        });
      };

      if (typeof isCancelled === 'boolean' && isCancelled !== existingTask.isCancelled) {
        await logAll(
          isCancelled ? 'CANCELLED' : 'REOPENED',
          isCancelled ? `Task was cancelled by mentor ${teacher.name}` : `Task was reactivated by mentor ${teacher.name}`
        );
      }
      if (deadlineChanged) {
        await logAll(
          'DEADLINE_CHANGED',
          deadline ? `Deadline changed to ${deadline.toLocaleString()} by ${teacher.name}` : `Deadline removed by ${teacher.name}`
        );
      }

      for (const sId of newStudentIds) {
        const st = await tx.studentTask.create({ data: { taskId: task.id, studentId: sId, status: 'TODO' } });
        await tx.taskActivity.create({
          data: {
            studentTaskId: st.id,
            action: 'CREATED',
            details: `Task assigned by mentor ${teacher.name}`,
            performedById: teacher.id,
            performedByRole: 'teacher',
            performedByName: teacher.name,
          },
        });
      }

      return task;
    });

    publishTaskEvent(
      {
        teacherIds: [teacher.id],
        studentIds: [...existingTask.studentTasks.map((st) => st.studentId), ...newStudentIds],
      },
      { type: 'task.changed', taskId, actorRole: 'teacher' }
    );

    return NextResponse.json({ success: true, task: updatedTask, addedStudents: newStudentIds.length });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ success: false, error: 'Internal server error updating task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await getTeacherAndTaskId(request, params);
    if (ctx.error) return ctx.error;
    const { teacher, taskId } = ctx;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, creatorId: true, studentTasks: { select: { studentId: true } } },
    });
    if (!task || task.creatorId !== teacher.id) return notFound();

    // Cascades to StudentTask, comments and activity.
    await prisma.task.delete({ where: { id: taskId } });

    publishTaskEvent(
      { teacherIds: [teacher.id], studentIds: task.studentTasks.map((st) => st.studentId) },
      { type: 'task.deleted', taskId, actorRole: 'teacher' }
    );

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, error: 'Internal server error deleting task' }, { status: 500 });
  }
}
