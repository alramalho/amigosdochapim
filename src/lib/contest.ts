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

export const FIRST_CONTEST_YEAR = 2026;

const PT_MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export interface ContestEdition {
  index: number;
  year: number;
  title: string;
  applicationsCloseAt: Date;
  applicationsCloseLabel: string;
  applicationsRangeLabel: string;
}

export function getContestEdition(index: number): ContestEdition {
  const year = FIRST_CONTEST_YEAR + index;
  const applicationsCloseAt = new Date(Date.UTC(year, 6, 30, 23, 59, 59));

  return {
    index,
    year,
    title: `Concurso ${year}`,
    applicationsCloseAt,
    applicationsCloseLabel: `30 de ${PT_MONTHS[6]} de ${year}`,
    applicationsRangeLabel: `15 Maio - 30 Julho ${year}`,
  };
}

export interface ContestBalance {
  total: number;
  donations: number;
  fundosProprios: number;
  goal: number;
}

export function getFundingTarget(balance: ContestBalance) {
  const { total, donations, fundosProprios, goal } = balance;
  const isFunded = total >= goal;
  const donationsNeededForFirstContest = Math.max(goal - fundosProprios, 0);
  const carriedOver = Math.max(donations - donationsNeededForFirstContest, 0);
  const fundedFutureContests = Math.floor(carriedOver / goal);
  const index = isFunded ? fundedFutureContests + 1 : 0;

  return {
    isFunded,
    goal,
    contest: getContestEdition(index),
    fundedContest: index > 0 ? getContestEdition(index - 1) : null,
    raised: isFunded ? carriedOver % goal : total,
    donations: isFunded ? carriedOver % goal : donations,
    fundosProprios: isFunded ? 0 : fundosProprios,
  };
}

export type ContestFundingTarget = ReturnType<typeof getFundingTarget>;
