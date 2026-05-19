import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, userHasJuryAccess } from "@/lib/auth";
import { CREDITS_THRESHOLD } from "@/lib/contest";

function getUserData(user: Awaited<ReturnType<typeof getCurrentUser>>) {
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
    name: user.name,
    subscription: user.subscription
      ? {
          tier: user.subscription.tier,
          currentPeriodEnd: user.subscription.currentPeriodEnd.toISOString(),
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
  };
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  const userData = getUserData(user);

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(userData);
}
