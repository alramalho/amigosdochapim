import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      subscription: user.subscription
        ? {
            tier: user.subscription.tier,
            currentPeriodEnd: user.subscription.currentPeriodEnd.toISOString(),
          }
        : null,
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    subscription: user.subscription
      ? {
          tier: user.subscription.tier,
          currentPeriodEnd: user.subscription.currentPeriodEnd.toISOString(),
        }
      : null,
  });
}
