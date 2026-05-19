-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('DRAFT', 'APPLICATIONS_OPEN', 'INITIAL_REVIEW', 'FINAL_MATERIALS', 'JURY_REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'SELECTED_FOR_FINAL', 'FINAL_MATERIALS_SUBMITTED', 'FINALIST', 'WINNER', 'REJECTED');

-- CreateTable
CREATE TABLE "contests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ContestStatus" NOT NULL DEFAULT 'DRAFT',
    "applications_open_at" TIMESTAMP(3) NOT NULL,
    "applications_close_at" TIMESTAMP(3) NOT NULL,
    "final_materials_open_at" TIMESTAMP(3) NOT NULL,
    "final_materials_close_at" TIMESTAMP(3) NOT NULL,
    "jury_review_open_at" TIMESTAMP(3) NOT NULL,
    "jury_review_close_at" TIMESTAMP(3) NOT NULL,
    "production_starts_at" TIMESTAMP(3) NOT NULL,
    "production_ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "candidate_name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "resident_in_portugal" BOOLEAN NOT NULL DEFAULT false,
    "cv_url" TEXT,
    "motivation" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "plot_points" TEXT NOT NULL,
    "script_summary" TEXT NOT NULL,
    "visual_ideas" TEXT NOT NULL,
    "external_links" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_final_materials" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "material_list" TEXT NOT NULL,
    "budget_plan" TEXT NOT NULL,
    "production_calendar" TEXT NOT NULL,
    "external_links" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_final_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jury_reviews" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "juror_id" TEXT NOT NULL,
    "artistic_quality" INTEGER,
    "originality" INTEGER,
    "argument_clarity" INTEGER,
    "aesthetic_vision" INTEGER,
    "budget_viability" INTEGER,
    "motivation" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jury_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jury_rankings" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "juror_id" TEXT NOT NULL,
    "ordered_submission_ids" TEXT[],
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jury_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contests_slug_key" ON "contests"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_contest_id_user_id_key" ON "submissions"("contest_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "submission_final_materials_submission_id_key" ON "submission_final_materials"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "jury_reviews_submission_id_juror_id_key" ON "jury_reviews"("submission_id", "juror_id");

-- CreateIndex
CREATE UNIQUE INDEX "jury_rankings_contest_id_juror_id_key" ON "jury_rankings"("contest_id", "juror_id");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_final_materials" ADD CONSTRAINT "submission_final_materials_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_reviews" ADD CONSTRAINT "jury_reviews_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_reviews" ADD CONSTRAINT "jury_reviews_juror_id_fkey" FOREIGN KEY ("juror_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_rankings" ADD CONSTRAINT "jury_rankings_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_rankings" ADD CONSTRAINT "jury_rankings_juror_id_fkey" FOREIGN KEY ("juror_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
