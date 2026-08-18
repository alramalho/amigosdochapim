import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { JURY_ACCESS_ONE_OFF_THRESHOLD } from "@/lib/contest";
import { getAdminEmails } from "@/lib/admin";
import { isSpecialJurorEmail } from "@/lib/jury";
import { canImpersonate, readImpersonatedEmail } from "@/lib/impersonation";

const userAccessInclude = {
  subscription: true,
  donations: true,
} as const;

async function resolveSessionEmail(request?: NextRequest) {
  let email: string | undefined;

  if (process.env.NODE_ENV !== "production") {
    email = request?.headers.get("x-dev-user-email") || process.env.NEXT_PUBLIC_DEV_AUTH_EMAIL || undefined;
  }

  if (!email && request) {
    const [scheme, token] = (request.headers.get("authorization") || "").split(" ");
    if (scheme?.toLowerCase() === "bearer" && token) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
      const { data } = await supabase.auth.getUser(token);
      email = data.user?.email || undefined;
    }
  }

  if (!email) {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    email = session?.user?.email;
  }

  if (!email) {
    return null;
  }

  return email.toLowerCase();
}

export type AuthIdentity = {
  realEmail: string | null;
  effectiveEmail: string | null;
  isImpersonating: boolean;
};

export async function getAuthIdentity(request?: NextRequest): Promise<AuthIdentity> {
  const realEmail = await resolveSessionEmail(request);

  if (!realEmail) {
    return { realEmail: null, effectiveEmail: null, isImpersonating: false };
  }

  const impersonatedEmail = await readImpersonatedEmail();

  if (impersonatedEmail && canImpersonate(realEmail, impersonatedEmail)) {
    return { realEmail, effectiveEmail: impersonatedEmail, isImpersonating: true };
  }

  return { realEmail, effectiveEmail: realEmail, isImpersonating: false };
}

export async function getCurrentUserEmail(request?: NextRequest) {
  const { effectiveEmail } = await getAuthIdentity(request);
  return effectiveEmail;
}

export async function getRealUserEmail(request?: NextRequest) {
  const { realEmail } = await getAuthIdentity(request);
  return realEmail;
}

export async function getCurrentUser(request?: NextRequest) {
  const email = await getCurrentUserEmail(request);

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: userAccessInclude,
  });

  if (user) return user;

  const caseInsensitiveUser = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    include: userAccessInclude,
  });

  if (caseInsensitiveUser) return caseInsensitiveUser;

  if (isSpecialJurorEmail(email)) {
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
      include: userAccessInclude,
    });
  }

  return null;
}

export async function ensureCurrentUser(request?: NextRequest) {
  const email = await getCurrentUserEmail(request);

  if (!email) {
    return null;
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    include: userAccessInclude,
  });

  if (existingUser) return existingUser;

  return prisma.user.create({
    data: { email },
    include: userAccessInclude,
  });
}

export function userHasJuryAccess(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  if (isSpecialJurorEmail(user.email)) return true;

  const totalOneOff = user.donations
    .filter((donation) => donation.type === "ONE_OFF")
    .reduce((sum, donation) => sum + donation.amount, 0);

  return (user.subscription?.tier === "AMIGO" && isSubscriptionActive(user.subscription)) || totalOneOff >= JURY_ACCESS_ONE_OFF_THRESHOLD;
}

export function isSubscriptionActive(subscription: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>["subscription"]) {
  if (!subscription) return false;
  return subscription.status === "ACTIVE" && subscription.currentPeriodEnd > new Date();
}

export function isAdminEmail(email: string) {
  return getAdminEmails(process.env.ADMIN_EMAILS).includes(email.toLowerCase());
}
