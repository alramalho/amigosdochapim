export const SPECIAL_JUROR_EMAILS = [
  "inesflat@gmail.com",
  "marcoarcsantos@gmail.com",
  "antoniaherbertlima@gmail.com",
  "alexandre.ramalho.1998@gmail.com",
] as const;

export function isSpecialJurorEmail(email: string) {
  return (SPECIAL_JUROR_EMAILS as readonly string[]).includes(email.trim().toLowerCase());
}
