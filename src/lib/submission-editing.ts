export const SUBMISSION_EDIT_WINDOW_DAYS = 7;

export function getSubmissionEditDeadline(createdAt: string | Date) {
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + SUBMISSION_EDIT_WINDOW_DAYS);
  return deadline;
}

export function canEditSubmission(createdAt: string | Date, now = new Date()) {
  return now <= getSubmissionEditDeadline(createdAt);
}
