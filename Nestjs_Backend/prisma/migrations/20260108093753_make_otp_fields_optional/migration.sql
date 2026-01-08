/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `otp_verifications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `otp_verifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "otp_verifications" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "otp_verifications_email_key" ON "otp_verifications"("email");
