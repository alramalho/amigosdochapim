export const DEFAULT_ADMIN_EMAILS = [
  "alexandre.ramalho.1998@gmail.com",
  "liavilelaborges@gmail.com",
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
