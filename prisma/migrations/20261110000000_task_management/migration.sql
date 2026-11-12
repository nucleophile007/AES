-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "deadline" TIMESTAMP(3),
    "creatorId" INTEGER NOT NULL,
    "requireSubmissionNote" BOOLEAN NOT NULL DEFAULT false,
    "requireFileUpload" BOOLEAN NOT NULL DEFAULT false,
    "requireUrl" BOOLEAN NOT NULL DEFAULT false,
    "requireExternalConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "externalConfirmationPrompt" TEXT,
    "requireMentorApproval" BOOLEAN NOT NULL DEFAULT false,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTask" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "submissionNote" TEXT,
    "submissionUrl" TEXT,
    "submissionFileUrl" TEXT,
    "submissionFileName" TEXT,
    "submissionExternalConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "mentorFeedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" SERIAL NOT NULL,
    "studentTaskId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "authorRole" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskActivity" (
    "id" SERIAL NOT NULL,
    "studentTaskId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedById" INTEGER NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "performedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_creatorId_idx" ON "Task"("creatorId");

-- CreateIndex
CREATE INDEX "Task_category_idx" ON "Task"("category");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "Task_deadline_idx" ON "Task"("deadline");

-- CreateIndex
CREATE INDEX "Task_isCancelled_idx" ON "Task"("isCancelled");

-- CreateIndex
CREATE INDEX "StudentTask_studentId_status_idx" ON "StudentTask"("studentId", "status");

-- CreateIndex
CREATE INDEX "StudentTask_taskId_idx" ON "StudentTask"("taskId");

-- CreateIndex
CREATE INDEX "StudentTask_status_idx" ON "StudentTask"("status");

-- CreateIndex
CREATE INDEX "StudentTask_reviewedById_idx" ON "StudentTask"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "StudentTask_taskId_studentId_key" ON "StudentTask"("taskId", "studentId");

-- CreateIndex
CREATE INDEX "TaskComment_studentTaskId_idx" ON "TaskComment"("studentTaskId");

-- CreateIndex
CREATE INDEX "TaskComment_createdAt_idx" ON "TaskComment"("createdAt");

-- CreateIndex
CREATE INDEX "TaskActivity_studentTaskId_idx" ON "TaskActivity"("studentTaskId");

-- CreateIndex
CREATE INDEX "TaskActivity_createdAt_idx" ON "TaskActivity"("createdAt");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_studentTaskId_fkey" FOREIGN KEY ("studentTaskId") REFERENCES "StudentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_studentTaskId_fkey" FOREIGN KEY ("studentTaskId") REFERENCES "StudentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

