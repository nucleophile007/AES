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
  authorRole: "teacher" | "student" | string;
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
  creatorId: number;
  creator?: { id: number; name: string; email: string };
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

/** One student's copy of a task: the unit shown on boards, lists and calendars. */
export interface TaskItem {
  id: number;
  taskId: number;
  studentId: number;
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
  student?: TaskStudentInfo;
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
