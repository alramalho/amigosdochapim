ALTER TABLE "email_drafts"
ADD COLUMN "recipient_selections" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "email_sends"
ADD COLUMN "recipient_selections" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
