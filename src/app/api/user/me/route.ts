import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

// Thresholds in cents
const JURY_ACCESS_ONE_OFF_THRESHOLD = 2500; // 25€ for one-time donations
const CREDITS_THRESHOLD = 4500; // 45€ total

async function getUserData(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      subscription: true,
      donations: true,
    },
  });

  if (!user) {
    return null;
  }

  // Calculate total contributions (all donations: ONE_OFF + SUBSCRIPTION)
  const totalContributions = user.donations.reduce((sum, d) => sum + d.amount, 0);

  // Separate one-off donations
  const oneOffDonations = user.donations.filter(d => d.type === "ONE_OFF");
  const totalOneOff = oneOffDonations.reduce((sum, d) => sum + d.amount, 0);

  // User has jury access if:
  // - Has AMIGO subscription (always), OR
  // - Has one-off donations >= 25€
  const hasJuryAccess = user.subscription?.tier === "AMIGO" || totalOneOff >= JURY_ACCESS_ONE_OFF_THRESHOLD;

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
  // Get email from Authorization header (sent by client)
  const email = request.headers.get("x-user-email");

  if (!email) {
    // Try to get from Supabase session via cookies
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await getUserData(session.user.email);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  }

  const userData = await getUserData(email);

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(userData);
}
