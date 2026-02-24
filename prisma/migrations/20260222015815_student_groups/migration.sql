-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "parentAccountId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Testimonial" ADD COLUMN     "videoLink" TEXT;

-- CreateTable
CREATE TABLE "public"."StudentGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentGroupMember" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordResetRequest" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'new',
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ParentAccount" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
    "isActivated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransactionReceipt" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "transactionDate" TEXT NOT NULL,
    "transactionId" TEXT,
    "description" TEXT,
    "receiptUrl" TEXT NOT NULL,
    "receiptFileName" TEXT NOT NULL,
    "receiptFileSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "TransactionReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mentor" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "workplace" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "experience" TEXT,
    "specialties" TEXT[],
    "achievements" TEXT[],
    "bio" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'General',

    CONSTRAINT "Mentor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProgressReport" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportPeriod" TEXT,
    "subject" TEXT,
    "overallProgress" TEXT NOT NULL,
    "progressRating" INTEGER,
    "attendanceRate" DOUBLE PRECISION,
    "milestonesAchieved" TEXT,
    "publications" TEXT,
    "skillsImproved" TEXT,
    "strengthsAreas" TEXT,
    "improvementAreas" TEXT,
    "nextSteps" TEXT,
    "recommendations" TEXT,
    "parentNotes" TEXT,
    "classParticipation" TEXT,
    "homeworkCompletion" DOUBLE PRECISION,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GeneralEvent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventTime" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "image" TEXT,
    "maxParticipants" INTEGER,
    "registrationDeadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "targetAudience" TEXT,
    "requirements" TEXT,
    "agenda" TEXT,
    "speakers" JSONB,
    "tags" TEXT[],
    "registrationFormConfig" JSONB,
    "customFields" JSONB,
    "registrationFee" DOUBLE PRECISION DEFAULT 0,
    "earlyBirdFee" DOUBLE PRECISION,
    "earlyBirdDeadline" TIMESTAMP(3),
    "requiresPayment" BOOLEAN NOT NULL DEFAULT false,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdBy" TEXT,
    "publishedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventRegistration" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "studentPhone" TEXT,
    "studentGrade" TEXT,
    "schoolName" TEXT,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT,
    "customFieldResponses" JSONB,
    "registrationStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentStatus" TEXT DEFAULT 'pending',
    "paymentAmount" DOUBLE PRECISION DEFAULT 0,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "specialRequirements" TEXT,
    "howDidYouHear" TEXT,
    "notes" TEXT,
    "adminNotes" TEXT,
    "checkedInAt" TIMESTAMP(3),
    "attendanceConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "certificateIssued" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentGroup_teacherId_name_key" ON "public"."StudentGroup"("teacherId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGroupMember_groupId_studentId_key" ON "public"."StudentGroupMember"("groupId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetRequest_tokenHash_key" ON "public"."PasswordResetRequest"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetRequest_role_userId_idx" ON "public"."PasswordResetRequest"("role", "userId");

-- CreateIndex
CREATE INDEX "PasswordResetRequest_expiresAt_idx" ON "public"."PasswordResetRequest"("expiresAt");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "public"."Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_parentId_idx" ON "public"."Feedback"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentAccount_email_key" ON "public"."ParentAccount"("email");

-- CreateIndex
CREATE INDEX "TransactionReceipt_createdAt_idx" ON "public"."TransactionReceipt"("createdAt");

-- CreateIndex
CREATE INDEX "TransactionReceipt_parentId_idx" ON "public"."TransactionReceipt"("parentId");

-- CreateIndex
CREATE INDEX "TransactionReceipt_status_idx" ON "public"."TransactionReceipt"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_teacherId_key" ON "public"."Mentor"("teacherId");

-- CreateIndex
CREATE INDEX "Mentor_isActive_displayOrder_idx" ON "public"."Mentor"("isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "Mentor_teacherId_idx" ON "public"."Mentor"("teacherId");

-- CreateIndex
CREATE INDEX "ProgressReport_studentId_idx" ON "public"."ProgressReport"("studentId");

-- CreateIndex
CREATE INDEX "ProgressReport_teacherId_idx" ON "public"."ProgressReport"("teacherId");

-- CreateIndex
CREATE INDEX "ProgressReport_reportDate_idx" ON "public"."ProgressReport"("reportDate");

-- CreateIndex
CREATE INDEX "ProgressReport_status_idx" ON "public"."ProgressReport"("status");

-- CreateIndex
CREATE INDEX "GeneralEvent_eventDate_idx" ON "public"."GeneralEvent"("eventDate");

-- CreateIndex
CREATE INDEX "GeneralEvent_status_idx" ON "public"."GeneralEvent"("status");

-- CreateIndex
CREATE INDEX "GeneralEvent_isPublished_idx" ON "public"."GeneralEvent"("isPublished");

-- CreateIndex
CREATE INDEX "GeneralEvent_isFeatured_idx" ON "public"."GeneralEvent"("isFeatured");

-- CreateIndex
CREATE INDEX "GeneralEvent_category_idx" ON "public"."GeneralEvent"("category");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "public"."EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_studentEmail_idx" ON "public"."EventRegistration"("studentEmail");

-- CreateIndex
CREATE INDEX "EventRegistration_parentEmail_idx" ON "public"."EventRegistration"("parentEmail");

-- CreateIndex
CREATE INDEX "EventRegistration_registrationStatus_idx" ON "public"."EventRegistration"("registrationStatus");

-- CreateIndex
CREATE INDEX "EventRegistration_paymentStatus_idx" ON "public"."EventRegistration"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_studentEmail_key" ON "public"."EventRegistration"("eventId", "studentEmail");

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "public"."ParentAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentGroup" ADD CONSTRAINT "StudentGroup_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentGroupMember" ADD CONSTRAINT "StudentGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."StudentGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentGroupMember" ADD CONSTRAINT "StudentGroupMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mentor" ADD CONSTRAINT "Mentor_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgressReport" ADD CONSTRAINT "ProgressReport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgressReport" ADD CONSTRAINT "ProgressReport_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."GeneralEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
