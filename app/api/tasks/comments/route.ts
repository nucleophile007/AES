import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { sendAcademicNotification } from '@/lib/academic-notifications';
import { extractMentions, formatTaskKey, isTaskUploadUrl } from '@/lib/tasks';
import { publishTaskEvent } from '@/lib/task-server';

const MAX_COMMENT_LENGTH = 5000;
/** Don't email the other party again if this author commented within this window (unless they @mention). */
const EMAIL_THROTTLE_MS = 30 * 60 * 1000;

function isAcceptedAttachment(url: unknown): boolean {
  if (isTaskUploadUrl(url, process.env.R2_PUBLIC_URL)) return true;
  // Local dev without R2 stores small uploads inline.
  return (
    process.env.NODE_ENV !== 'production' &&
    !process.env.R2_PUBLIC_URL &&
    typeof url === 'string' &&
    url.startsWith('data:')
  );
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (user.role !== 'teacher' && user.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized role' }, { status: 403 });
    }

    const body = await request.json();
    const { studentTaskId, content, attachmentUrl, attachmentName } = body;

    const parsedStudentTaskId = Number(studentTaskId);
    if (!Number.isInteger(parsedStudentTaskId)) {
      return NextResponse.json({ success: false, error: 'Invalid studentTaskId' }, { status: 400 });
    }

    const text = typeof content === 'string' ? content.trim() : '';
    if (!text && !attachmentUrl) {
      return NextResponse.json({ success: false, error: 'Comment content cannot be empty' }, { status: 400 });
    }
    if (text.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json({ success: false, error: 'Comment is too long' }, { status: 400 });
    }
    if (attachmentUrl && !isAcceptedAttachment(attachmentUrl)) {
      return NextResponse.json({ success: false, error: 'Attach files using the upload button' }, { status: 400 });
    }

    const studentTask = await prisma.studentTask.findUnique({
      where: { id: parsedStudentTaskId },
      include: {
        task: { include: { creator: { select: { id: true, name: true, email: true } } } },
        student: { select: { id: true, name: true, email: true } },
      },
    });
    if (!studentTask) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });

    // Resolve the author from the database (not the token) and check access.
    const author =
      user.role === 'teacher'
        ? await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true, name: true } })
        : await prisma.student.findUnique({ where: { email: user.email }, select: { id: true, name: true } });
    const allowed =
      author &&
      (user.role === 'teacher' ? studentTask.task.creatorId === author.id : studentTask.studentId === author.id);
    if (!author || !allowed) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const previousByAuthor = await prisma.taskComment.findFirst({
      where: { studentTaskId: parsedStudentTaskId, authorId: author.id, authorRole: user.role },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.taskComment.create({
        data: {
          studentTaskId: parsedStudentTaskId,
          authorId: author.id,
          authorRole: user.role,
          authorName: author.name,
          content: text,
          attachmentUrl: attachmentUrl || null,
          attachmentName: typeof attachmentName === 'string' ? attachmentName.slice(0, 255) : null,
        },
      });
      await tx.taskActivity.create({
        data: {
          studentTaskId: parsedStudentTaskId,
          action: 'COMMENT_ADDED',
          details: `Comment added by ${author.name} (${user.role === 'teacher' ? 'Mentor' : 'Student'})`,
          performedById: author.id,
          performedByRole: user.role,
          performedByName: author.name,
        },
      });
      return newComment;
    });

    publishTaskEvent(
      { teacherIds: [studentTask.task.creatorId], studentIds: [studentTask.studentId] },
      { type: 'comment.added', taskId: studentTask.taskId, studentTaskId: parsedStudentTaskId, actorRole: user.role }
    );

    // Email the other participant: always when @mentioned, otherwise at most once per throttle window.
    const recipient =
      user.role === 'teacher'
        ? { ...studentTask.student, role: 'student' as const }
        : { ...studentTask.task.creator, role: 'teacher' as const };
    const mentioned = extractMentions(text, [recipient]).length > 0;
    const recentlyNotified =
      previousByAuthor && Date.now() - previousByAuthor.createdAt.getTime() < EMAIL_THROTTLE_MS;

    if (mentioned || !recentlyNotified) {
      const key = formatTaskKey(studentTask.taskId);
      void sendAcademicNotification({
        recipients: [{ email: recipient.email, name: recipient.name }],
        subject: mentioned
          ? `${author.name} mentioned you on ${key}: ${studentTask.task.title}`
          : `New comment on ${key}: ${studentTask.task.title}`,
        heading: mentioned ? 'You were mentioned' : 'New task comment',
        message: `${author.name} commented on "${studentTask.task.title}".`,
        details: [
          { label: 'Comment', value: text.length > 500 ? `${text.slice(0, 500)}…` : text || '(attachment)' },
          ...(user.role === 'teacher' ? [] : [{ label: 'Student', value: studentTask.student.name }]),
        ],
        actionLabel: 'Open task',
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/${
          recipient.role === 'teacher' ? 'teacher-dashboard' : 'student-dashboard'
        }?tab=tasks&open=${parsedStudentTaskId}`,
      }).catch((err) => console.error('Comment notification failed:', err));
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error adding comment' }, { status: 500 });
  }
}
