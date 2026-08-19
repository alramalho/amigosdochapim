import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail, isSubscriptionActive, userHasJuryAccess } from "@/lib/auth";
import { CREDITS_THRESHOLD } from "@/lib/contest";
import { getInterviewSlots } from "@/lib/interviews";
import { isSpecialJurorEmail } from "@/lib/jury";
import { prisma } from "@/lib/prisma";

function getUserData(user: Awaited<ReturnType<typeof getCurrentUser>>, hasSubmission = false) {
  if (!user) {
    return null;
  }

  // Calculate total contributions (all donations: ONE_OFF + SUBSCRIPTION)
  const totalContributions = user.donations.reduce((sum, d) => sum + d.amount, 0);

  const oneOffDonations = user.donations.filter(d => d.type === "ONE_OFF");
  const totalOneOff = oneOffDonations.reduce((sum, d) => sum + d.amount, 0);
  const hasJuryAccess = userHasJuryAccess(user);

  // User appears in credits if total contributions >= 45€
  const hasCreditsAccess = totalContributions >= CREDITS_THRESHOLD;

  return {
    email: user.email,
    isAdmin: isAdminEmail(user.email),
    name: user.name,
    subscription: user.subscription
      ? {
          tier: user.subscription.tier,
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd.toISOString(),
          cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
          isActive: isSubscriptionActive(user.subscription),
        }
      : null,
    donations: {
      total: totalOneOff / 100, // One-off donations in euros (for display)
      count: oneOffDonations.length,
    },
    contributions: {
      total: totalContributions / 100, // Total contributions in euros
      count: user.donations.length,
    },
    hasJuryAccess,
    hasCreditsAccess,
    hasSubmission,
  };
}

async function buildPayload(
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
  hasSubmission: boolean
) {
  const isExternalJuror = isSpecialJurorEmail(user.email) && !isAdminEmail(user.email);

  const interviewAvailability = isExternalJuror
    ? {
        answered: await prisma.interviewAvailability.count({
          where: { jurorEmail: user.email },
        }),
        total: getInterviewSlots().length,
      }
    : null;

  return {
    ...getUserData(user, hasSubmission),
    isExternalJuror,
    interviewAvailability,
  };
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const hasSubmission = await prisma.submission.count({ where: { userId: user.id } }).then((count) => count > 0);

  return NextResponse.json(await buildPayload(user, hasSubmission));
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (name.length > 80) {
    return NextResponse.json({ error: "O nome não pode ter mais de 80 caracteres." }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: name || null },
    include: {
      subscription: true,
      donations: true,
    },
  });
  const hasSubmission = await prisma.submission.count({ where: { userId: user.id } }).then((count) => count > 0);

  return NextResponse.json(await buildPayload(updatedUser, hasSubmission));
}
