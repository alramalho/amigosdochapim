CREATE TABLE "email_drafts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preview_text" TEXT,
    "body" TEXT NOT NULL,
    "audience_segments" TEXT[] NOT NULL,
    "created_by_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_drafts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "email_drafts_updated_at_idx" ON "email_drafts"("updated_at");
