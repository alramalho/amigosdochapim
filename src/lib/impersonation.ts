import { cookies } from "next/headers";
import { getAdminEmails } from "@/lib/admin";

export const IMPERSONATION_COOKIE = "adc_impersonate";

export const IMPERSONATION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 4,
} as const;

function isAdmin(email: string) {
  return getAdminEmails(process.env.ADMIN_EMAILS).includes(email.toLowerCase());
}

export async function readImpersonatedEmail() {
  try {
    const store = await cookies();
    const value = store.get(IMPERSONATION_COOKIE)?.value?.trim().toLowerCase();
    return value || null;
  } catch {
    return null;
  }
}

export function canImpersonate(realEmail: string, targetEmail: string) {
  const real = realEmail.toLowerCase();
  const target = targetEmail.toLowerCase();

  return real !== target && isAdmin(real) && !isAdmin(target);
}
