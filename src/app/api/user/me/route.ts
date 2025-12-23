import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

// Minimum donation amount (in cents) for jury access
const JURY_ACCESS_THRESHOLD = 2500; // 25€

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

  // Calculate total donations in cents
  const totalDonations = user.donations.reduce((sum, d) => sum + d.amount, 0);

  // User has jury access if total donations >= 25€
  const hasJuryAccess = totalDonations >= JURY_ACCESS_THRESHOLD;

  return {
    name: user.name,
    subscription: user.subscription
      ? {
          tier: user.subscription.tier,
          currentPeriodEnd: user.subscription.currentPeriodEnd.toISOString(),
        }
      : null,
    donations: {
      total: totalDonations / 100, // Convert to euros
      count: user.donations.length,
    },
    hasJuryAccess,
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
