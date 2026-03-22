ALTER TABLE "ClassSchedule"
ADD COLUMN "reminderJobId" TEXT,
ADD COLUMN "reminderScheduledFor" TIMESTAMP(3);

CREATE INDEX "ClassSchedule_reminderJobId_idx"
ON "ClassSchedule"("reminderJobId");
