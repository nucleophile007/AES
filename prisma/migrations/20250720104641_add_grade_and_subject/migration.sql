/*
  Warnings:

  - You are about to drop the column `message` on the `FreeSession` table. All the data in the column will be lost.
  - Added the required column `gradeLevel` to the `FreeSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectOfInterest` to the `FreeSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FreeSession" DROP COLUMN "message",
ADD COLUMN     "gradeLevel" TEXT NOT NULL,
ADD COLUMN     "subjectOfInterest" TEXT NOT NULL;
