-- AlterTable
ALTER TABLE "StudentTask" ADD COLUMN     "assigneeParentId" INTEGER,
ADD COLUMN     "assigneeRole" TEXT NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "assigneeTeacherId" INTEGER,
ADD COLUMN     "reviewedByAdminEmail" TEXT,
ALTER COLUMN "studentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "creatorAdminEmail" TEXT,
ADD COLUMN     "creatorName" TEXT,
ADD COLUMN     "creatorRole" TEXT NOT NULL DEFAULT 'TEACHER',
ALTER COLUMN "creatorId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "StudentTask_assigneeTeacherId_status_idx" ON "StudentTask"("assigneeTeacherId", "status");

-- CreateIndex
CREATE INDEX "StudentTask_assigneeParentId_status_idx" ON "StudentTask"("assigneeParentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentTask_taskId_assigneeTeacherId_key" ON "StudentTask"("taskId", "assigneeTeacherId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentTask_taskId_assigneeParentId_key" ON "StudentTask"("taskId", "assigneeParentId");

-- CreateIndex
CREATE INDEX "Task_creatorRole_idx" ON "Task"("creatorRole");

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_assigneeTeacherId_fkey" FOREIGN KEY ("assigneeTeacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_assigneeParentId_fkey" FOREIGN KEY ("assigneeParentId") REFERENCES "ParentAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Admin task management: a task is created by exactly one kind of creator.
-- Existing rows are all mentor-created (creatorRole defaults to TEACHER, creatorId set).
ALTER TABLE "Task" ADD CONSTRAINT "Task_creator_check" CHECK (
  ("creatorRole" = 'TEACHER' AND "creatorId" IS NOT NULL AND "creatorAdminEmail" IS NULL)
  OR ("creatorRole" = 'ADMIN' AND "creatorId" IS NULL AND "creatorAdminEmail" IS NOT NULL)
);

-- Each assignment row has exactly one assignee, matching assigneeRole.
-- Existing rows are all student assignments (assigneeRole defaults to STUDENT, studentId set).
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_assignee_check" CHECK (
  ("assigneeRole" = 'STUDENT' AND "studentId" IS NOT NULL AND "assigneeTeacherId" IS NULL AND "assigneeParentId" IS NULL)
  OR ("assigneeRole" = 'TEACHER' AND "studentId" IS NULL AND "assigneeTeacherId" IS NOT NULL AND "assigneeParentId" IS NULL)
  OR ("assigneeRole" = 'PARENT' AND "studentId" IS NULL AND "assigneeTeacherId" IS NULL AND "assigneeParentId" IS NOT NULL)
);
