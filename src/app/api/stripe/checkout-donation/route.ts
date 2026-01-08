import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const ALLOWED_AMOUNTS = [15, 25, 50, 100]; // in euros

function getTierFromAmount(amount: number): "APOIANTE" | "AMIGO" {
  return amount === 15 ? "APOIANTE" : "AMIGO";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body as { amount: number };

    if (!amount || !ALLOWED_AMOUNTS.includes(amount)) {
      return NextResponse.json(
        { error: `Invalid amount. Must be one of: ${ALLOWED_AMOUNTS.join(", ")}€` },
        { status: 400 }
      );
    }

    const tier = getTierFromAmount(amount);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3027";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Doação de ${amount}€`,
              description: "Doação única para os Amigos do Chapim",
            },
            unit_amount: amount * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "donation",
        tier,
        amount: amount.toString(),
      },
      success_url: `${appUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}&type=donation`,
      cancel_url: `${appUrl}/?cancelled=true`,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating donation checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
