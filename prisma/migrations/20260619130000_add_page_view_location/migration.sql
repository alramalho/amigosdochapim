ALTER TABLE "page_views" ADD COLUMN "country" TEXT;
ALTER TABLE "page_views" ADD COLUMN "region" TEXT;
ALTER TABLE "page_views" ADD COLUMN "city" TEXT;
ALTER TABLE "page_views" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "page_views" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "page_views" ADD COLUMN "precise" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "page_views_country_idx" ON "page_views"("country");
