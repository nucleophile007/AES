-- AlterTable
ALTER TABLE "StudentTask" ADD COLUMN     "checklistDone" JSONB,
ADD COLUMN     "dueSoonReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "overdueReminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "checklist" JSONB,
ADD COLUMN     "linkedAssignmentId" INTEGER,
ADD COLUMN     "linkedMeetingId" INTEGER,
ADD COLUMN     "linkedResourceId" INTEGER,
ADD COLUMN     "nextOccurrenceCreatedAt" TIMESTAMP(3),
ADD COLUMN     "recurrence" TEXT,
ADD COLUMN     "recurrenceEndsAt" TIMESTAMP(3),
ADD COLUMN     "seriesId" INTEGER,
ADD COLUMN     "templateId" INTEGER;

-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "defaultDeadlineDays" INTEGER,
    "requireSubmissionNote" BOOLEAN NOT NULL DEFAULT false,
    "requireFileUpload" BOOLEAN NOT NULL DEFAULT false,
    "requireUrl" BOOLEAN NOT NULL DEFAULT false,
    "requireExternalConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "externalConfirmationPrompt" TEXT,
    "requireMentorApproval" BOOLEAN NOT NULL DEFAULT false,
    "checklist" JSONB,
    "recurrence" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskSavedFilter" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "ownerRole" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskSavedFilter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskTemplate_teacherId_idx" ON "TaskTemplate"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplate_teacherId_name_key" ON "TaskTemplate"("teacherId", "name");

-- CreateIndex
CREATE INDEX "TaskSavedFilter_ownerRole_ownerId_idx" ON "TaskSavedFilter"("ownerRole", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskSavedFilter_ownerRole_ownerId_name_key" ON "TaskSavedFilter"("ownerRole", "ownerId", "name");

-- CreateIndex
CREATE INDEX "Task_seriesId_idx" ON "Task"("seriesId");

-- CreateIndex
CREATE INDEX "Task_recurrence_nextOccurrenceCreatedAt_idx" ON "Task"("recurrence", "nextOccurrenceCreatedAt");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TaskTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_linkedAssignmentId_fkey" FOREIGN KEY ("linkedAssignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_linkedResourceId_fkey" FOREIGN KEY ("linkedResourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_linkedMeetingId_fkey" FOREIGN KEY ("linkedMeetingId") REFERENCES "MeetingMinuteMeeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

