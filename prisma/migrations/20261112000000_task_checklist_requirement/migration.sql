-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "requireChecklistComplete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TaskTemplate" ADD COLUMN     "requireChecklistComplete" BOOLEAN NOT NULL DEFAULT false;

