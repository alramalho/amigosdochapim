ALTER TABLE "email_sends"
ADD COLUMN "archive_status" "EmailDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
ADD COLUMN "archive_message_id" TEXT,
ADD COLUMN "archive_claim_token" TEXT,
ADD COLUMN "archive_claimed_at" TIMESTAMP(3),
ADD COLUMN "archive_error" TEXT,
ADD COLUMN "archived_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "email_sends_archive_message_id_key" ON "email_sends"("archive_message_id");
