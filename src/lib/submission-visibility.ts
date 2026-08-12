const NON_CONTEST_SUBMISSION_EMAILS = new Set([
  "alexandre.ramalho.1998@gmail.com",
  "lia.borges@icloud.com",
  "goncalo.melo.4@gmail.com",
]);

function canonicalEmail(email: string) {
  const [local, domain] = email.toLowerCase().split("@");
  if (!local || !domain) return email.toLowerCase();
  return `${local.split("+")[0]}@${domain}`;
}

export function isNonContestSubmissionEmail(email: string) {
  return NON_CONTEST_SUBMISSION_EMAILS.has(canonicalEmail(email));
}
