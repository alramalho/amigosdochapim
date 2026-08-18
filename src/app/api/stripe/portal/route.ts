import { NextRequest, NextResponse } from "next/server";
import { getAuthIdentity, getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const identity = await getAuthIdentity(request);

  if (!identity.effectiveEmail) {
    return NextResponse.json({ error: "Inicia sessão para gerir a subscrição." }, { status: 401 });
  }

  if (identity.isImpersonating) {
    return NextResponse.json(
      { error: "Não é possível gerir a subscrição durante uma personificação." },
      { status: 403 }
    );
  }

  const user = await getCurrentUser(request);

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3027";

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/painel`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
