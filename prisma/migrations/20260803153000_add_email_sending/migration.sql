CREATE TYPE "EmailSendStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'PARTIALLY_SENT', 'FAILED');

CREATE TYPE "EmailDeliveryStatus" AS ENUM ('QUEUED', 'SENDING', 'ACCEPTED', 'DELIVERED', 'BOUNCED', 'COMPLAINED', 'FAILED');

ALTER TABLE "email_drafts"
ADD COLUMN "sent_by_email" TEXT,
ADD COLUMN "sent_at" TIMESTAMP(3);

CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "source" TEXT NOT NULL,
    "page_path" TEXT,
    "subscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "email_sends" (
    "id" TEXT NOT NULL,
    "draft_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preview_text" TEXT,
    "body" TEXT NOT NULL,
    "audience_segments" TEXT[] NOT NULL,
    "recipient_email" TEXT,
    "from_email" TEXT NOT NULL,
    "status" "EmailSendStatus" NOT NULL DEFAULT 'QUEUED',
    "recipient_count" INTEGER NOT NULL,
    "accepted_count" INTEGER NOT NULL DEFAULT 0,
    "delivered_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_email" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_sends_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "email_deliveries" (
    "id" TEXT NOT NULL,
    "send_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "audience_segments" TEXT[] NOT NULL,
    "topic_name" TEXT,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "provider_message_id" TEXT,
    "claim_token" TEXT,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "accepted_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");
CREATE INDEX "newsletter_subscribers_unsubscribed_at_idx" ON "newsletter_subscribers"("unsubscribed_at");
CREATE UNIQUE INDEX "email_sends_draft_id_key" ON "email_sends"("draft_id");
CREATE INDEX "email_sends_created_at_idx" ON "email_sends"("created_at");
CREATE INDEX "email_sends_status_idx" ON "email_sends"("status");
CREATE UNIQUE INDEX "email_deliveries_provider_message_id_key" ON "email_deliveries"("provider_message_id");
CREATE UNIQUE INDEX "email_deliveries_send_id_email_key" ON "email_deliveries"("send_id", "email");
CREATE INDEX "email_deliveries_send_id_status_idx" ON "email_deliveries"("send_id", "status");

ALTER TABLE "email_sends"
ADD CONSTRAINT "email_sends_draft_id_fkey"
FOREIGN KEY ("draft_id") REFERENCES "email_drafts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "email_deliveries"
ADD CONSTRAINT "email_deliveries_send_id_fkey"
FOREIGN KEY ("send_id") REFERENCES "email_sends"("id") ON DELETE CASCADE ON UPDATE CASCADE;
