import { getAdminEmails } from "@/lib/admin";
import { SPECIAL_JUROR_EMAILS } from "@/lib/jury";

export const INTERVIEW_DURATION_MINUTES = 45;

// Second week of September 2026. Lisbon is WEST (UTC+1) on these dates.
const LISBON_OFFSET = "+01:00";

export const INTERVIEW_DAYS = [
  "2026-09-07",
  "2026-09-08",
  "2026-09-09",
  "2026-09-10",
  "2026-09-11",
  "2026-09-12",
  "2026-09-13",
] as const;

// Edit these to change the times offered to the jury.
export const INTERVIEW_TIMES = ["18:00", "19:00", "20:00"] as const;

export const AVAILABILITY_CHOICES = ["YES", "IF_NEEDED", "NO"] as const;
export type AvailabilityChoice = (typeof AVAILABILITY_CHOICES)[number];

export function isAvailabilityChoice(value: unknown): value is AvailabilityChoice {
  return typeof value === "string" && (AVAILABILITY_CHOICES as readonly string[]).includes(value);
}

export function slotStart(day: string, time: string) {
  return new Date(`${day}T${time}:00${LISBON_OFFSET}`);
}

export function getInterviewSlots() {
  return INTERVIEW_DAYS.flatMap((day) =>
    INTERVIEW_TIMES.map((time) => ({ day, time, startsAt: slotStart(day, time) }))
  );
}

export function isInterviewSlot(startsAt: Date) {
  return getInterviewSlots().some((slot) => slot.startsAt.getTime() === startsAt.getTime());
}

export function getExternalJurorEmails() {
  const admins = getAdminEmails(process.env.ADMIN_EMAILS);
  return (SPECIAL_JUROR_EMAILS as readonly string[]).filter((email) => !admins.includes(email));
}
