import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { JURY_ACCESS_ONE_OFF_THRESHOLD } from "@/lib/contest";

const userAccessInclude = {
  subscription: true,
  donations: true,
} as const;

export async function getCurrentUserEmail(request?: NextRequest) {
  let email: string | undefined;

  if (process.env.NODE_ENV !== "production") {
    email = request?.headers.get("x-dev-user-email") || process.env.NEXT_PUBLIC_DEV_AUTH_EMAIL || undefined;
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

  return prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    include: userAccessInclude,
  });
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
  const totalOneOff = user.donations
    .filter((donation) => donation.type === "ONE_OFF")
    .reduce((sum, donation) => sum + donation.amount, 0);

  return user.subscription?.tier === "AMIGO" || totalOneOff >= JURY_ACCESS_ONE_OFF_THRESHOLD;
}

export function isAdminEmail(email: string) {
  const emails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return emails.includes(email.toLowerCase());
}
