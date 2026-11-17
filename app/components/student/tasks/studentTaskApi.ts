import { taskApi } from "@/components/tasks/api";
import type { StatusCounts, TaskItem } from "@/components/tasks/types";
import { canStudentPerform, taskHasSubmissionRequirements, type StudentTaskAction, type TaskStatus } from "@/lib/tasks";

export interface StudentTaskMetrics {
  totalTasks: number;
  todo: number;
  inProgress: number;
  submitted: number;
  changesRequested: number;
  completed: number;
  overdue: number;
}

export interface StudentTaskListResponse {
  items: TaskItem[];
  truncated: boolean;
  columnCounts: StatusCounts;
  metrics: StudentTaskMetrics;
  categories: string[];
  mentors: { id: number; name: string; email: string }[];
  /** /api/student/tasks */
  studentId?: number;
  /** /api/tasks/assigned (mentors and parents receiving admin tasks) */
  assigneeId?: number;
}

/**
 * The assignee workspace serves students (their mentor's and the admin team's
 * tasks) and mentors/parents (tasks the admin team assigned to them).
 */
export type AssigneeViewerRole = "student" | "teacher" | "parent";

export const STUDENT_TASKS_API = "/api/student/tasks";
export const ASSIGNED_TASKS_API = "/api/tasks/assigned";

export interface SubmissionPayload {
  submissionNote: string;
  submissionUrl: string;
  submissionFileUrl: string | null;
  submissionFileName: string | null;
  submissionExternalConfirmed: boolean;
}

export const EMPTY_METRICS: StudentTaskMetrics = {
  totalTasks: 0,
  todo: 0,
  inProgress: 0,
  submitted: 0,
  changesRequested: 0,
  completed: 0,
  overdue: 0,
};

export function fetchStudentTasks(apiQuery: string, apiBase: string = STUDENT_TASKS_API) {
  return taskApi<StudentTaskListResponse>(`${apiBase}${apiQuery ? `?${apiQuery}` : ""}`);
}

export function fetchStudentTaskDetail(studentTaskId: number, apiBase: string = STUDENT_TASKS_API) {
  return taskApi<{ task: TaskItem }>(`${apiBase}/${studentTaskId}`);
}

export function patchStudentTask(
  studentTaskId: number,
  action: StudentTaskAction,
  extra: Partial<SubmissionPayload> | { itemId: string; done: boolean } = {},
  apiBase: string = STUDENT_TASKS_API
) {
  return taskApi<{ task: Partial<TaskItem> }>(`${apiBase}/${studentTaskId}`, {
    method: "PATCH",
    json: { action, ...extra },
  });
}

/** True when the student can finish the task without filling anything in. */
export function canCompleteDirectly(item: TaskItem): boolean {
  return !taskHasSubmissionRequirements(item.task) && !item.task.requireMentorApproval;
}

/**
 * What dropping a card into a board column means for a student:
 * - START: To Do -> In Progress
 * - COMPLETE_DIRECT / SUBMIT: finishing a task that has nothing to fill in
 * - OPEN_DETAIL: finishing a task with requirements; the student must use the form
 * - null: not a move a student can make
 */
export type BoardDropIntent = "START" | "COMPLETE_DIRECT" | "SUBMIT" | "OPEN_DETAIL" | null;

export function resolveBoardDrop(item: TaskItem, to: TaskStatus): BoardDropIntent {
  const from = item.status;
  if (item.task.isCancelled || from === to) return null;
  if (from === "SUBMITTED" || from === "COMPLETED") return null;

  if (to === "IN_PROGRESS") return canStudentPerform("START", from) ? "START" : null;

  if (to === "COMPLETED" || to === "SUBMITTED") {
    if (!canStudentPerform("SUBMIT", from)) return null;
    if (taskHasSubmissionRequirements(item.task)) return "OPEN_DETAIL";
    if (item.task.requireMentorApproval) return "SUBMIT";
    return canStudentPerform("COMPLETE_DIRECT", from) ? "COMPLETE_DIRECT" : null;
  }

  return null;
}
