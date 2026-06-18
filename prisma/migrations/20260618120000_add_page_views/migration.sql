CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "page_views_path_idx" ON "page_views"("path");

CREATE INDEX "page_views_created_at_idx" ON "page_views"("created_at");
