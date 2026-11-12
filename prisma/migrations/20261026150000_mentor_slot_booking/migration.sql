CREATE TYPE "MentorAvailabilityStatus" AS ENUM ('OPEN', 'BOOKED', 'CANCELLED');
CREATE TYPE "MentorSlotBookingStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED');

CREATE TABLE "MentorAvailabilitySlot" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "status" "MentorAvailabilityStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MentorAvailabilitySlot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MentorSlotBooking" (
    "id" SERIAL NOT NULL,
    "slotId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classScheduleId" INTEGER,
    "status" "MentorSlotBookingStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "googleSyncError" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MentorSlotBooking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MentorSlotBooking_classScheduleId_key" ON "MentorSlotBooking"("classScheduleId");
CREATE UNIQUE INDEX "MentorSlotBooking_slotId_studentId_key" ON "MentorSlotBooking"("slotId", "studentId");
CREATE INDEX "MentorAvailabilitySlot_teacherId_status_startsAt_idx" ON "MentorAvailabilitySlot"("teacherId", "status", "startsAt");
CREATE INDEX "MentorAvailabilitySlot_startsAt_endsAt_idx" ON "MentorAvailabilitySlot"("startsAt", "endsAt");
CREATE INDEX "MentorSlotBooking_studentId_status_idx" ON "MentorSlotBooking"("studentId", "status");
CREATE INDEX "MentorSlotBooking_status_createdAt_idx" ON "MentorSlotBooking"("status", "createdAt");

ALTER TABLE "MentorAvailabilitySlot"
    ADD CONSTRAINT "MentorAvailabilitySlot_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MentorSlotBooking"
    ADD CONSTRAINT "MentorSlotBooking_slotId_fkey"
    FOREIGN KEY ("slotId") REFERENCES "MentorAvailabilitySlot"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "MentorSlotBooking_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "MentorSlotBooking_classScheduleId_fkey"
    FOREIGN KEY ("classScheduleId") REFERENCES "ClassSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
