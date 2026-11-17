import { prisma } from './prisma';
import { sendAcademicNotification } from './academic-notifications';
import { canMentorPerform, type MentorReviewAction } from './tasks';
import { publishTaskEvent, rowAudience } from './task-server';
import { assigneePeopleInclude, assigneeTasksUrl, readAssignee } from './task-actors';

/**
 * Who reviews a task: the mentor who created it, or (for admin-created tasks)
 * any admin. Admins can only view mentor-created tasks, never review them.
 */
export type TaskReviewer =
  | { kind: 'teacher'; id: number; name: string; email: string }
  | { kind: 'admin'; email: string; name: string };

export const REVIEW_ACTIONS: MentorReviewAction[] = ['APPROVE', 'REQUEST_CHANGES', 'REOPEN'];

export function isReviewAction(value: unknown): value is MentorReviewAction {
  return typeof value === 'string' && (REVIEW_ACTIONS as string[]).includes(value);
}

/** True when this reviewer owns the task (mentor: their own task; admin: any admin-created task). */
export function reviewerOwnsTask(
  reviewer: TaskReviewer,
  task: { creatorRole: string; creatorId: number | null }
): boolean {
  if (reviewer.kind === 'teacher') return task.creatorRole === 'TEACHER' && task.creatorId === reviewer.id;
  return task.creatorRole === 'ADMIN';
}

export function reviewerActivity(reviewer: TaskReviewer) {
  return reviewer.kind === 'teacher'
    ? { performedById: reviewer.id, performedByRole: 'teacher', performedByName: reviewer.name }
    : { performedById: 0, performedByRole: 'admin', performedByName: reviewer.name };
}

/** "mentor Jane" / "admin Jane", used in activity text. */
export function reviewerLabel(reviewer: TaskReviewer): string {
  return `${reviewer.kind === 'teacher' ? 'mentor' : 'admin'} ${reviewer.name}`;
}

/**
 * Feedback to store after a review. Approving replaces any earlier change
 * request (otherwise the old "please fix…" would show as approval feedback to
 * the assignee and to parents); reopening keeps it unless new text is given.
 */
export function feedbackAfterReview(action: MentorReviewAction, feedback: string, previous: string | null): string | null {
  if (feedback) return feedback;
  return action === 'APPROVE' ? null : previous;
}

export function reviewerColumns(reviewer: TaskReviewer) {
  return reviewer.kind === 'teacher'
    ? { reviewedById: reviewer.id, reviewedByAdminEmail: null }
    : { reviewedById: null, reviewedByAdminEmail: reviewer.email };
}

export interface ReviewResult {
  status: number;
  body: { success: boolean; error?: string; studentTask?: unknown };
}

const fail = (status: number, error: string): ReviewResult => ({ status, body: { success: false, error } });

export async function reviewTaskItem(
  reviewer: TaskReviewer,
  studentTaskId: number,
  action: unknown,
  feedbackInput: unknown
): Promise<ReviewResult> {
  if (!isReviewAction(action)) return fail(400, 'Invalid action. Must be APPROVE, REQUEST_CHANGES, or REOPEN.');
  const feedback = typeof feedbackInput === 'string' ? feedbackInput.trim() : '';

  const item = await prisma.studentTask.findUnique({
    where: { id: studentTaskId },
    include: { task: true, ...assigneePeopleInclude },
  });
  // 404 (not 403) so ids of other people's tasks can't be probed.
  if (!item || !reviewerOwnsTask(reviewer, item.task)) return fail(404, 'Task not found');

  if (item.task.isCancelled) return fail(409, 'This task is cancelled. Reactivate it before reviewing.');
  if (!canMentorPerform(action, item.status)) {
    return fail(
      409,
      `Cannot ${action.toLowerCase().replace('_', ' ')} a task that is ${item.status.toLowerCase().replace(/_/g, ' ')}.`
    );
  }
  if (action === 'REQUEST_CHANGES' && !feedback) return fail(400, 'Please explain what needs to change.');

  const who = reviewerLabel(reviewer);
  const { newStatus, activityAction, activityDetails } =
    action === 'APPROVE'
      ? {
          newStatus: 'COMPLETED',
          activityAction: 'APPROVED',
          activityDetails: feedback ? `Task approved by ${who}. Feedback: ${feedback}` : `Task approved by ${who}`,
        }
      : action === 'REQUEST_CHANGES'
        ? {
            newStatus: 'CHANGES_REQUESTED',
            activityAction: 'CHANGES_REQUESTED',
            activityDetails: `Changes requested by ${who}: ${feedback}`,
          }
        : {
            newStatus: 'IN_PROGRESS',
            activityAction: 'REOPENED',
            activityDetails: feedback ? `Task reopened by ${who}: ${feedback}` : `Task reopened by ${who}`,
          };

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.studentTask.update({
      where: { id: studentTaskId },
      data: {
        status: newStatus,
        mentorFeedback: feedbackAfterReview(action, feedback, item.mentorFeedback),
        reviewedAt: now,
        ...reviewerColumns(reviewer),
        completedAt: action === 'APPROVE' ? item.completedAt || now : null,
      },
    });
    await tx.taskActivity.create({
      data: { studentTaskId, action: activityAction, details: activityDetails, ...reviewerActivity(reviewer) },
    });
    return res;
  });

  publishTaskEvent(rowAudience(item, item.task.creatorId), {
    type: 'task.changed',
    taskId: item.taskId,
    studentTaskId,
    actorRole: reviewer.kind,
  });

  notifyAssigneeOfReview(reviewer, item, action, newStatus, feedback);
  return { status: 200, body: { success: true, studentTask: updated } };
}

/** Emails the assignee about a review decision. Fire-and-forget. */
export function notifyAssigneeOfReview(
  reviewer: TaskReviewer,
  item: Parameters<typeof readAssignee>[0] & { id: number; task: { title: string } },
  action: MentorReviewAction,
  newStatus: string,
  feedback: string
): void {
  const assignee = readAssignee(item);
  if (!assignee) return;
  const reviewerText =
    reviewer.kind === 'teacher' ? `Your mentor ${reviewer.name}` : `${reviewer.name} from the ACHARYA admin team`;
  void sendAcademicNotification({
    recipients: [{ email: assignee.email, name: assignee.name }],
    subject: `Task Update: ${item.task.title}`,
    heading: action === 'APPROVE' ? 'Task Approved!' : action === 'REQUEST_CHANGES' ? 'Changes Requested on Task' : 'Task Reopened',
    message: `${reviewerText} has reviewed your task "${item.task.title}". Status: ${newStatus.replace(/_/g, ' ')}.`,
    details: [
      ...(feedback ? [{ label: reviewer.kind === 'teacher' ? 'Mentor Feedback' : 'Feedback', value: feedback }] : []),
      { label: 'Status', value: newStatus.replace(/_/g, ' ') },
    ],
    actionLabel: 'View Task in Dashboard',
    actionUrl: assigneeTasksUrl(assignee.role, item.id),
  }).catch((err) => console.error('Review email failed:', err));
}
