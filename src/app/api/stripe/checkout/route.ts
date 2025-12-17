import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier } = body as { tier: "APOIANTE" | "AMIGO" };

    if (!tier || !["APOIANTE", "AMIGO"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be APOIANTE or AMIGO" },
        { status: 400 }
      );
    }

    const priceId = STRIPE_PRICES[tier];

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for tier: ${tier}` },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3027";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        tier,
      },
      subscription_data: {
        trial_period_days: 15,
      },
      success_url: `${appUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?cancelled=true`,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
