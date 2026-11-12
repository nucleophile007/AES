"use client";

import React, { Suspense } from "react";
import { StudentTaskWorkspace, StudentTaskWorkspaceSkeleton } from "./tasks/StudentTaskWorkspace";

interface StudentTaskManagerProps {
  /** Kept for the dashboard's existing call site; the API identifies the student from the session. */
  studentEmail?: string;
  studentName?: string;
}

/**
 * Student task workspace (board / list / calendar, task detail with submission,
 * checklist, comments and activity). Filters live in the URL, so the workspace
 * reads search params and must sit inside a Suspense boundary.
 */
export default function StudentTaskManager({ studentName }: StudentTaskManagerProps) {
  return (
    <Suspense fallback={<StudentTaskWorkspaceSkeleton />}>
      <StudentTaskWorkspace studentName={studentName} />
    </Suspense>
  );
}
