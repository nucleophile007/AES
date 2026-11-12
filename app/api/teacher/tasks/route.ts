import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { sendAcademicNotification } from '@/lib/academic-notifications';
import { isTaskRecurrence, readChecklist } from '@/lib/tasks';
import {
  buildStudentTaskWhere,
  countByStatus,
  getTeacherTaskLookups,
  getTeacherTaskMetrics,
  parseChecklistField,
  parseOptionalDate,
  parseRecurrenceField,
  publishTaskEvent,
  readTaskListQuery,
  resolveAssignableStudents,
  resolveTaskLinks,
  studentTaskListInclude,
} from '@/lib/task-server';

const MAX_ROWS = 500;
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

async function getTeacher(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return { error: NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }) };
  if (!hasRole(user, 'teacher')) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 }) };
  }
  const teacher = await prisma.teacher.findUnique({
    where: { email: user.email },
    select: { id: true, name: true, email: true },
  });
  if (!teacher) return { error: NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 }) };
  return { teacher };
}

/**
 * Board data. Read-only, so it trusts the signed token's teacher id instead of
 * looking the teacher up again (saves a database round trip per request).
 * Pass ?lookups=1 to also get students / groups / categories, which don't
 * change with filters and are only needed on first load and after edits.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }
    const teacherId = user.id;

    const searchParams = new URL(request.url).searchParams;
    const query = readTaskListQuery(searchParams);
    const base = { task: { creatorId: teacherId } };
    const where = buildStudentTaskWhere(base, query, { searchStudents: true });
    const whereIgnoringStatus = buildStudentTaskWhere(base, query, { searchStudents: true, ignoreStatus: true });

    const [items, columnCounts, metrics, lookups] = await Promise.all([
      prisma.studentTask.findMany({
        where,
        include: studentTaskListInclude,
        orderBy: [{ task: { deadline: { sort: 'asc', nulls: 'last' } } }, { createdAt: 'desc' }],
        take: MAX_ROWS + 1,
      }),
      countByStatus(whereIgnoringStatus),
      getTeacherTaskMetrics(teacherId),
      searchParams.get('lookups') === '1' ? getTeacherTaskLookups(teacherId) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      success: true,
      items: items.slice(0, MAX_ROWS),
      truncated: items.length > MAX_ROWS,
      columnCounts,
      metrics,
      ...(lookups ?? {}),
      teacherId,
    });
  } catch (error) {
    console.error('Error fetching teacher tasks:', error);
    return NextResponse.json({ success: false, error: 'Internal server error fetching tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { teacher, error } = await getTeacher(request);
    if (error) return error;

    const body = await request.json();
    const {
      title,
      description,
      category = 'General',
      priority = 'MEDIUM',
      deadline = null,
      studentIds = [],
      groupIds = [],
      templateId = null,
      requireSubmissionNote = false,
      requireFileUpload = false,
      requireUrl = false,
      requireExternalConfirmation = false,
      requireChecklistComplete = false,
      externalConfirmationPrompt = null,
      requireMentorApproval = false,
      saveAsTemplateName = null,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Task title is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ success: false, error: 'Task description is required' }, { status: 400 });
    }

    const safePriority = VALID_PRIORITIES.includes(priority) ? priority : 'MEDIUM';
    const parsedDeadline = parseOptionalDate(deadline) ?? null;
    const recurrence = parseRecurrenceField(body.recurrence) ?? null;
    const recurrenceEndsAt = parseOptionalDate(body.recurrenceEndsAt) ?? null;
    const checklist = parseChecklistField(body.checklist ?? []);
    const safeCategory = (typeof category === 'string' && category.trim()) || 'General';

    if (recurrence && !parsedDeadline) {
      return NextResponse.json(
        { success: false, error: 'Recurring tasks need a deadline to repeat from' },
        { status: 400 }
      );
    }

    const assignees = await resolveAssignableStudents(teacher.id, studentIds, groupIds);
    if (!assignees.ok) return NextResponse.json({ success: false, error: assignees.error }, { status: 400 });

    const links = await resolveTaskLinks(teacher.id, body);
    if (!links.ok) return NextResponse.json({ success: false, error: links.error }, { status: 400 });

    let safeTemplateId: number | null = null;
    if (templateId !== null && templateId !== undefined && templateId !== '') {
      const tpl = await prisma.taskTemplate.findFirst({
        where: { id: Number(templateId), teacherId: teacher.id },
        select: { id: true },
      });
      safeTemplateId = tpl?.id ?? null;
    }

    const students = assignees.students;
    const taskFields = {
      title: title.trim(),
      description: description.trim(),
      category: safeCategory,
      priority: safePriority,
      requireSubmissionNote: Boolean(requireSubmissionNote),
      requireFileUpload: Boolean(requireFileUpload),
      requireUrl: Boolean(requireUrl),
      requireExternalConfirmation: Boolean(requireExternalConfirmation),
      requireChecklistComplete: Boolean(requireChecklistComplete),
      externalConfirmationPrompt:
        typeof externalConfirmationPrompt === 'string' && externalConfirmationPrompt.trim()
          ? externalConfirmationPrompt.trim()
          : null,
      requireMentorApproval: Boolean(requireMentorApproval),
      checklist,
      recurrence,
    };

    const createdItems: { id: number; studentId: number }[] = [];
    const createdTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          ...taskFields,
          deadline: parsedDeadline,
          recurrenceEndsAt: recurrence ? recurrenceEndsAt : null,
          creatorId: teacher.id,
          templateId: safeTemplateId,
          ...links.data,
        },
      });

      for (const student of students) {
        const studentTask = await tx.studentTask.create({
          data: { taskId: task.id, studentId: student.id, status: 'TODO' },
        });
        createdItems.push({ id: studentTask.id, studentId: student.id });
        await tx.taskActivity.create({
          data: {
            studentTaskId: studentTask.id,
            action: 'CREATED',
            details: `Task created and assigned by mentor ${teacher.name}`,
            performedById: teacher.id,
            performedByRole: 'teacher',
            performedByName: teacher.name,
          },
        });
      }

      if (safeTemplateId) {
        await tx.taskTemplate.update({ where: { id: safeTemplateId }, data: { usageCount: { increment: 1 } } });
      }

      if (typeof saveAsTemplateName === 'string' && saveAsTemplateName.trim()) {
        const now = Date.now();
        const deadlineDays = parsedDeadline
          ? Math.max(0, Math.round((parsedDeadline.getTime() - now) / 864e5))
          : null;
        await tx.taskTemplate.upsert({
          where: { teacherId_name: { teacherId: teacher.id, name: saveAsTemplateName.trim().slice(0, 100) } },
          create: {
            ...taskFields,
            teacherId: teacher.id,
            name: saveAsTemplateName.trim().slice(0, 100),
            defaultDeadlineDays: deadlineDays,
            recurrence: isTaskRecurrence(recurrence) ? recurrence : null,
          },
          update: { ...taskFields, defaultDeadlineDays: deadlineDays },
        });
      }

      return task;
    });

    publishTaskEvent(
      { teacherIds: [teacher.id], studentIds: students.map((s) => s.id) },
      { type: 'task.changed', taskId: createdTask.id, actorRole: 'teacher' }
    );

    const checklistCount = readChecklist(checklist).length;
    void sendAcademicNotification({
      recipients: students.map((s) => ({ email: s.email, name: s.name })),
      subject: `New Task Assigned: ${taskFields.title}`,
      heading: 'New Task Assigned',
      message: `Your mentor ${teacher.name} has assigned you a new task: "${taskFields.title}".`,
      details: [
        { label: 'Priority', value: safePriority },
        { label: 'Category', value: safeCategory },
        { label: 'Deadline', value: parsedDeadline ? parsedDeadline.toLocaleDateString() : 'No deadline' },
        ...(checklistCount ? [{ label: 'Checklist', value: `${checklistCount} steps` }] : []),
        ...(recurrence ? [{ label: 'Repeats', value: recurrence.toLowerCase() }] : []),
        { label: 'Requires Mentor Approval', value: taskFields.requireMentorApproval ? 'Yes' : 'No' },
      ],
      actionLabel: 'View in My Tasks',
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/student-dashboard?tab=tasks`,
    }).catch((err) => console.error('Failed to send task email notification:', err));

    // Enough for the client to show the new cards immediately, before its reload.
    return NextResponse.json({
      success: true,
      task: { ...createdTask, creator: { id: teacher.id, name: teacher.name, email: teacher.email } },
      items: createdItems.map((ci) => ({
        id: ci.id,
        taskId: createdTask.id,
        studentId: ci.studentId,
        status: 'TODO',
        submissionExternalConfirmed: false,
        checklistDone: [],
        student: students.find((s) => s.id === ci.studentId),
        _count: { comments: 0 },
      })),
      assignedCount: students.length,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: 'Internal server error creating task' }, { status: 500 });
  }
}
