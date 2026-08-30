CREATE TYPE "MeetingMinuteCreationMode" AS ENUM ('STUDENT_ASSIGNED', 'MENTOR_DIRECT');

ALTER TABLE "MeetingMinuteRequest"
ADD COLUMN "creationMode" "MeetingMinuteCreationMode" NOT NULL DEFAULT 'STUDENT_ASSIGNED';
