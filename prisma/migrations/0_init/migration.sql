-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."WebinarRegistration" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "adminEmail" TEXT,

    CONSTRAINT "WebinarRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AvailabilityDay" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "times" JSONB NOT NULL,
    "program" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL DEFAULT 'acharya.folsom@gmail.com',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Teacher" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "programs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActivated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "grade" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActivated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherStudent" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "program" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT,
    "program" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" INTEGER NOT NULL DEFAULT 1,
    "targetStudentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Submission" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "content" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" INTEGER,
    "feedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "submissionNumber" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Enrollment" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "program" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "access" TEXT NOT NULL DEFAULT 'unblocked',

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Resource" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT,
    "linkUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "program" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssignmentResource" (
    "id" SERIAL NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AssignmentResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentResource" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),

    CONSTRAINT "StudentResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentSubmission" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teacherIds" INTEGER[],

    CONSTRAINT "StudentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentSubmissionRemark" (
    "id" SERIAL NOT NULL,
    "studentSubmissionId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "remark" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSubmissionRemark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "senderRole" TEXT NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "recipientRole" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClassSchedule" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "meetingLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "color" TEXT,
    "studentId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivationRequest" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "enrollmentId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "paymentInfo" TEXT NOT NULL,
    "amount" TEXT,
    "dueDate" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Testimonial" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "authorType" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SecurityLog" (
    "id" SERIAL NOT NULL,
    "event" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "userRole" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FailedActivation" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedActivation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityDay_date_program_adminEmail_key" ON "public"."AvailabilityDay"("date", "program", "adminEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "public"."Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "public"."Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStudent_teacherId_studentId_program_key" ON "public"."TeacherStudent"("teacherId", "studentId", "program");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_studentId_assignmentId_key" ON "public"."Submission"("studentId", "assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_program_subject_key" ON "public"."Enrollment"("studentId", "program", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentResource_assignmentId_resourceId_key" ON "public"."AssignmentResource"("assignmentId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentResource_studentId_resourceId_key" ON "public"."StudentResource"("studentId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSubmissionRemark_studentSubmissionId_teacherId_key" ON "public"."StudentSubmissionRemark"("studentSubmissionId", "teacherId");

-- CreateIndex
CREATE INDEX "Message_senderId_recipientId_createdAt_idx" ON "public"."Message"("senderId", "recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_recipientId_isRead_idx" ON "public"."Message"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "public"."Message"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ClassSchedule_teacherId_idx" ON "public"."ClassSchedule"("teacherId");

-- CreateIndex
CREATE INDEX "ClassSchedule_studentId_idx" ON "public"."ClassSchedule"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivationRequest_token_key" ON "public"."ActivationRequest"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ActivationRequest_email_role_key" ON "public"."ActivationRequest"("email", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE INDEX "SecurityLog_userId_event_idx" ON "public"."SecurityLog"("userId", "event");

-- CreateIndex
CREATE INDEX "SecurityLog_createdAt_idx" ON "public"."SecurityLog"("createdAt");

-- CreateIndex
CREATE INDEX "FailedActivation_token_idx" ON "public"."FailedActivation"("token");

-- CreateIndex
CREATE INDEX "FailedActivation_ipAddress_idx" ON "public"."FailedActivation"("ipAddress");

-- CreateIndex
CREATE INDEX "FailedActivation_createdAt_idx" ON "public"."FailedActivation"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."TeacherStudent" ADD CONSTRAINT "TeacherStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherStudent" ADD CONSTRAINT "TeacherStudent_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_targetStudentId_fkey" FOREIGN KEY ("targetStudentId") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resource" ADD CONSTRAINT "Resource_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssignmentResource" ADD CONSTRAINT "AssignmentResource_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssignmentResource" ADD CONSTRAINT "AssignmentResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentResource" ADD CONSTRAINT "StudentResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentResource" ADD CONSTRAINT "StudentResource_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentSubmission" ADD CONSTRAINT "StudentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentSubmissionRemark" ADD CONSTRAINT "StudentSubmissionRemark_studentSubmissionId_fkey" FOREIGN KEY ("studentSubmissionId") REFERENCES "public"."StudentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentSubmissionRemark" ADD CONSTRAINT "StudentSubmissionRemark_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassSchedule" ADD CONSTRAINT "ClassSchedule_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassSchedule" ADD CONSTRAINT "ClassSchedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "public"."Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Testimonial" ADD CONSTRAINT "Testimonial_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

