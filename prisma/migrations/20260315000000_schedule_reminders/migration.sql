-- Add one-hour reminder tracking for class schedules
ALTER TABLE "ClassSchedule"
ADD COLUMN "reminderSentAt" TIMESTAMP(3);

CREATE INDEX "ClassSchedule_startDateTime_reminderSentAt_idx"
ON "ClassSchedule"("startDateTime", "reminderSentAt");
