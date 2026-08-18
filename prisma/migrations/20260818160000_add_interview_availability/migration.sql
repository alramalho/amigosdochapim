-- CreateEnum
CREATE TYPE "InterviewAvailabilityChoice" AS ENUM ('YES', 'IF_NEEDED', 'NO');

-- CreateTable
CREATE TABLE "interview_availability" (
    "id" TEXT NOT NULL,
    "juror_email" TEXT NOT NULL,
    "slot_start" TIMESTAMP(3) NOT NULL,
    "choice" "InterviewAvailabilityChoice" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_availability_slot_start_idx" ON "interview_availability"("slot_start");

-- CreateIndex
CREATE UNIQUE INDEX "interview_availability_juror_email_slot_start_key" ON "interview_availability"("juror_email", "slot_start");
