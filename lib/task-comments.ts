import { prisma } from './prisma';
import { sendAcademicNotification } from './academic-notifications';
import { extractMentions, formatTaskKey } from './tasks';
import { publishTaskEvent, rowAudience } from './task-server';
import { isAcceptedTaskFileUrl } from './task-assignee-actions';
import {
  assigneePeopleInclude,
  assigneeTasksUrl,
  creatorInclude,
  creatorReviewUrl,
  notifyMentorOfAdminChange,
  readAssignee,
  readCreator,
  type TaskActorRole,
} from './task-actors';

const MAX_COMMENT_LENGTH = 5000;
/** Don't email the other party again if this author commented within this window (unless they @mention). */
const EMAIL_THROTTLE_MS = 30 * 60 * 1000;

export interface TaskCommentAuthor {
  role: TaskActorRole;
  /** 0 for admins, who have no row of their own. */
  id: number;
  name: string;
  email: string;
}

export interface CommentResult {
  status: number;
  body: { success: boolean; error?: string; comment?: unknown };
}

const fail = (status: number, error: string): CommentResult => ({ status, body: { success: false, error } });

/**
 * Posts a comment on one assignee's copy of a task. The thread is between the
 * task's creator (mentor, or the admin team) and the assignee. Admins may
 * comment on any task; on a mentor's task the mentor is emailed as well.
 */
export async function addTaskComment(
  author: TaskCommentAuthor,
  studentTaskId: number,
  input: { content?: unknown; attachmentUrl?: unknown; attachmentName?: unknown }
): Promise<CommentResult> {
  const text = typeof input.content === 'string' ? input.content.trim() : '';
  const attachmentUrl = typeof input.attachmentUrl === 'string' && input.attachmentUrl ? input.attachmentUrl : null;
  if (!text && !attachmentUrl) return fail(400, 'Comment content cannot be empty');
  if (text.length > MAX_COMMENT_LENGTH) return fail(400, 'Comment is too long');
  if (attachmentUrl && !isAcceptedTaskFileUrl(attachmentUrl)) return fail(400, 'Attach files using the upload button');

  const item = await prisma.studentTask.findUnique({
    where: { id: studentTaskId },
    include: { task: { include: creatorInclude }, ...assigneePeopleInclude },
  });
  if (!item) return fail(404, 'Task not found');

  const creator = readCreator(item.task);
  const assignee = readAssignee(item);
  const isCreator =
    (author.role === 'teacher' && creator.role === 'TEACHER' && creator.teacherId === author.id) ||
    author.role === 'admin';
  const isAssignee =
    !!assignee && author.role !== 'admin' && author.role === assignee.role.toLowerCase() && assignee.id === author.id;
  if (!isCreator && !isAssignee) return fail(404, 'Task not found');

  const previousByAuthor = await prisma.taskComment.findFirst({
    where: { studentTaskId, authorId: author.id, authorRole: author.role },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  const roleWord = author.role === 'teacher' ? 'Mentor' : author.role.charAt(0).toUpperCase() + author.role.slice(1);
  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.taskComment.create({
      data: {
        studentTaskId,
        authorId: author.id,
        authorRole: author.role,
        authorName: author.name,
        content: text,
        attachmentUrl,
        attachmentName: typeof input.attachmentName === 'string' ? input.attachmentName.slice(0, 255) : null,
      },
    });
    await tx.taskActivity.create({
      data: {
        studentTaskId,
        action: 'COMMENT_ADDED',
        details: `Comment added by ${author.name} (${roleWord})`,
        performedById: author.id,
        performedByRole: author.role,
        performedByName: author.name,
      },
    });
    return created;
  });

  publishTaskEvent(rowAudience(item, creator.teacherId), {
    type: 'comment.added',
    taskId: item.taskId,
    studentTaskId,
    actorRole: author.role,
  });

  // Email the other side: always when @mentioned, otherwise at most once per throttle window.
  const recipient = isCreator
    ? assignee && { name: assignee.name, email: assignee.email, url: assigneeTasksUrl(assignee.role, studentTaskId) }
    : creator.email && { name: creator.name, email: creator.email, url: creatorReviewUrl(creator, studentTaskId) };
  if (recipient) {
    const mentioned = extractMentions(text, [recipient]).length > 0;
    const recentlyNotified =
      previousByAuthor && Date.now() - previousByAuthor.createdAt.getTime() < EMAIL_THROTTLE_MS;
    if (mentioned || !recentlyNotified) {
      const key = formatTaskKey(item.taskId);
      void sendAcademicNotification({
        recipients: [{ email: recipient.email, name: recipient.name }],
        subject: mentioned
          ? `${author.name} mentioned you on ${key}: ${item.task.title}`
          : `New comment on ${key}: ${item.task.title}`,
        heading: mentioned ? 'You were mentioned' : 'New task comment',
        message: `${author.name} commented on "${item.task.title}".`,
        details: [
          { label: 'Comment', value: text.length > 500 ? `${text.slice(0, 500)}…` : text || '(attachment)' },
          ...(isAssignee && assignee ? [{ label: roleWord, value: assignee.name }] : []),
        ],
        actionLabel: 'Open task',
        actionUrl: recipient.url,
      }).catch((err) => console.error('Comment notification failed:', err));
      // An admin commenting on a mentor's task: the mentor hears about it too.
      if (author.role === 'admin' && creator.role === 'TEACHER') {
        notifyMentorOfAdminChange(
          item.task,
          author.name,
          'commented',
          [
            ...(assignee ? [{ label: 'On the copy of', value: assignee.name }] : []),
            { label: 'Comment', value: text.length > 500 ? `${text.slice(0, 500)}…` : text || '(attachment)' },
          ],
          studentTaskId
        );
      }
    }
  }

  return { status: 200, body: { success: true, comment } };
}
