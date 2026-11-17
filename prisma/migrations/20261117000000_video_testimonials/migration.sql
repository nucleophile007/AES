-- CreateTable
CREATE TABLE "VideoTestimonial" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "program" TEXT,
    "description" TEXT,
    "videoKey" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoTestimonial_videoKey_key" ON "VideoTestimonial"("videoKey");

-- CreateIndex
CREATE INDEX "VideoTestimonial_isVisible_displayOrder_idx" ON "VideoTestimonial"("isVisible", "displayOrder");
