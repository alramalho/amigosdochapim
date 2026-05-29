export const DEFAULT_ADMIN_EMAILS = [
  "alexandre.ramalho.1998@gmail.com",
  "liavilelaborges@gmail.com",
  "geral@amigosdochapim.org",
  "goncalo.melo.4@gmail.com",
  "asv1998@gmail.com",
  "rafaeldslemos@gmail.com",
  "jpmcvalente@gmail.com",
  "leandrosantos1998@hotmail.com",
  "marco_martins_1998@hotmail.com",
  "franciscomaleitas@hotmail.com",
];

export function parseEmailList(value?: string | null) {
  return (value || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails(value?: string | null) {
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...parseEmailList(value)]));
}
