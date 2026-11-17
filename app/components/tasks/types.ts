import type { TaskPriority, TaskStatus, TaskChecklistItem } from "@/lib/tasks";

export interface TaskStudentInfo {
  id: number;
  name: string;
  email: string;
  grade?: string | null;
  program?: string | null;
  schoolName?: string | null;
}

export interface TaskCommentRecord {
  id: number;
  studentTaskId: number;
  authorId: number;
  authorRole: "teacher" | "student" | "parent" | "admin" | string;
  authorName: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  createdAt: string;
}

export interface TaskActivityRecord {
  id: number;
  studentTaskId: number;
  action: string;
  details?: string | null;
  performedById: number;
  performedByRole: string;
  performedByName: string;
  createdAt: string;
}

export interface TaskLinkInfo {
  linkedAssignment?: { id: number; title: string; dueDate?: string } | null;
  linkedResource?: { id: number; title: string; type?: string; fileUrl?: string | null } | null;
  linkedMeeting?: { id: number; title: string; startDateTime?: string } | null;
}

export interface TaskRecordBase extends TaskLinkInfo {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  deadline?: string | null;
  /** TEACHER (a mentor) or ADMIN (the admin team). */
  creatorRole?: "TEACHER" | "ADMIN" | string;
  /** Null for admin-created tasks. */
  creatorId: number | null;
  creator?: { id: number; name: string; email: string } | null;
  creatorAdminEmail?: string | null;
  creatorName?: string | null;
  requireSubmissionNote: boolean;
  requireFileUpload: boolean;
  requireUrl: boolean;
  requireExternalConfirmation: boolean;
  externalConfirmationPrompt?: string | null;
  requireMentorApproval: boolean;
  requireChecklistComplete?: boolean;
  isCancelled: boolean;
  checklist?: TaskChecklistItem[] | null;
  recurrence?: string | null;
  recurrenceEndsAt?: string | null;
  seriesId?: number | null;
  templateId?: number | null;
  linkedAssignmentId?: number | null;
  linkedResourceId?: number | null;
  linkedMeetingId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPersonInfo {
  id: number;
  name: string;
  email: string;
}

/**
 * One assignee's copy of a task: the unit shown on boards, lists and calendars.
 * Mentor tasks always go to students; admin tasks can also go to mentors or parents.
 */
export interface TaskItem {
  id: number;
  taskId: number;
  assigneeRole?: "STUDENT" | "TEACHER" | "PARENT" | string;
  studentId: number | null;
  assigneeTeacherId?: number | null;
  assigneeParentId?: number | null;
  assigneeTeacher?: TaskPersonInfo | null;
  assigneeParent?: TaskPersonInfo | null;
  status: TaskStatus;
  startedAt?: string | null;
  submittedAt?: string | null;
  completedAt?: string | null;
  submissionNote?: string | null;
  submissionUrl?: string | null;
  submissionFileUrl?: string | null;
  submissionFileName?: string | null;
  submissionExternalConfirmed: boolean;
  checklistDone?: string[] | null;
  mentorFeedback?: string | null;
  reviewedAt?: string | null;
  updatedAt?: string;
  student?: TaskStudentInfo | null;
  task: TaskRecordBase;
  comments?: TaskCommentRecord[];
  activities?: TaskActivityRecord[];
  _count?: { comments: number };
}

export interface StatusCounts {
  TODO: number;
  IN_PROGRESS: number;
  SUBMITTED: number;
  CHANGES_REQUESTED: number;
  COMPLETED: number;
}
