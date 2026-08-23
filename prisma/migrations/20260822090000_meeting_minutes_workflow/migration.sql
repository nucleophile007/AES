CREATE TYPE "MeetingSource" AS ENUM ('GOOGLE', 'AES_SCHEDULE');
CREATE TYPE "MeetingMinuteStatus" AS ENUM ('ASSIGNED', 'SUBMITTED', 'APPROVED');

CREATE TABLE "MeetingMinuteMeeting" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "source" "MeetingSource" NOT NULL DEFAULT 'GOOGLE',
    "googleCalendarEventId" TEXT,
    "classScheduleId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "meetingLink" TEXT,
    "location" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "attendeeSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MeetingMinuteMeeting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeetingMinuteRequest" (
    "id" SERIAL NOT NULL,
    "meetingId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "status" "MeetingMinuteStatus" NOT NULL DEFAULT 'ASSIGNED',
    "studentMinutes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "teacherFinalText" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MeetingMinuteRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeetingMinuteMeeting_teacherId_googleCalendarEventId_key" ON "MeetingMinuteMeeting"("teacherId", "googleCalendarEventId");
CREATE UNIQUE INDEX "MeetingMinuteMeeting_teacherId_classScheduleId_key" ON "MeetingMinuteMeeting"("teacherId", "classScheduleId");
CREATE INDEX "MeetingMinuteMeeting_teacherId_startDateTime_idx" ON "MeetingMinuteMeeting"("teacherId", "startDateTime");
CREATE UNIQUE INDEX "MeetingMinuteRequest_meetingId_studentId_key" ON "MeetingMinuteRequest"("meetingId", "studentId");
CREATE INDEX "MeetingMinuteRequest_studentId_status_idx" ON "MeetingMinuteRequest"("studentId", "status");
CREATE INDEX "MeetingMinuteRequest_meetingId_status_idx" ON "MeetingMinuteRequest"("meetingId", "status");

ALTER TABLE "MeetingMinuteMeeting" ADD CONSTRAINT "MeetingMinuteMeeting_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingMinuteMeeting" ADD CONSTRAINT "MeetingMinuteMeeting_classScheduleId_fkey" FOREIGN KEY ("classScheduleId") REFERENCES "ClassSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MeetingMinuteRequest" ADD CONSTRAINT "MeetingMinuteRequest_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "MeetingMinuteMeeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingMinuteRequest" ADD CONSTRAINT "MeetingMinuteRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
