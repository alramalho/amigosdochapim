export const CONTEST_SLUG = "curtas-2026";

export const CONTEST_WINDOWS = {
  applicationsOpenAt: new Date("2026-05-15T00:00:00.000Z"),
  applicationsCloseAt: new Date("2026-07-30T23:59:59.000Z"),
  finalMaterialsOpenAt: new Date("2026-08-05T00:00:00.000Z"),
  finalMaterialsCloseAt: new Date("2026-08-31T23:59:59.000Z"),
  juryReviewOpenAt: new Date("2026-09-01T00:00:00.000Z"),
  juryReviewCloseAt: new Date("2026-09-30T23:59:59.000Z"),
  productionStartsAt: new Date("2026-10-01T00:00:00.000Z"),
  productionEndsAt: new Date("2026-12-15T23:59:59.000Z"),
};

export const JURY_ACCESS_ONE_OFF_THRESHOLD = 2500;
export const CREDITS_THRESHOLD = 4500;

export const JURY_VISIBLE_SUBMISSION_STATUSES = [
  "SUBMITTED",
  "IN_REVIEW",
  "SELECTED_FOR_FINAL",
  "FINAL_MATERIALS_SUBMITTED",
  "FINALIST",
  "WINNER",
] as const;

export const JURY_RANKING_SUBMISSION_STATUSES = [
  "FINAL_MATERIALS_SUBMITTED",
  "FINALIST",
  "WINNER",
] as const;

export const FINAL_MATERIAL_SUBMISSION_STATUSES = [
  "SELECTED_FOR_FINAL",
  "FINAL_MATERIALS_SUBMITTED",
] as const;

export function isJuryVisibleSubmissionStatus(status: string) {
  return (JURY_VISIBLE_SUBMISSION_STATUSES as readonly string[]).includes(status);
}

export function isJuryRankingSubmissionStatus(status: string) {
  return (JURY_RANKING_SUBMISSION_STATUSES as readonly string[]).includes(status);
}

export function canSubmitFinalMaterials(status: string) {
  return (FINAL_MATERIAL_SUBMISSION_STATUSES as readonly string[]).includes(status);
}

export function isWithinWindow(start: Date, end: Date, now = new Date()) {
  return now >= start && now <= end;
}
