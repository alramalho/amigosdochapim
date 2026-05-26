export const CONTEST_SLUG = "curtas-2026";

export const CONTEST_WINDOWS = {
  applicationsOpenAt: new Date("2026-05-15T00:00:00.000Z"),
  applicationsCloseAt: new Date("2026-06-30T23:59:59.000Z"),
  finalMaterialsOpenAt: new Date("2026-07-16T00:00:00.000Z"),
  finalMaterialsCloseAt: new Date("2026-07-31T23:59:59.000Z"),
  juryReviewOpenAt: new Date("2026-08-01T00:00:00.000Z"),
  juryReviewCloseAt: new Date("2026-08-31T23:59:59.000Z"),
  productionStartsAt: new Date("2026-09-01T00:00:00.000Z"),
  productionEndsAt: new Date("2026-12-15T23:59:59.000Z"),
};

export const JURY_ACCESS_ONE_OFF_THRESHOLD = 2500;
export const CREDITS_THRESHOLD = 4500;

export function isWithinWindow(start: Date, end: Date, now = new Date()) {
  return now >= start && now <= end;
}
