import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// Own funds (fundos próprios) - seed money from the organization
const FUNDOS_PROPRIOS = 588;
const GOAL = 1300;

export async function GET() {
  try {
    // Get the Stripe balance
    const balance = await stripe.balance.retrieve();

    // Sum up available balance in EUR (in cents)
    const availableEur = balance.available
      .filter((b) => b.currency === "eur")
      .reduce((sum, b) => sum + b.amount, 0);

    // Sum up pending balance in EUR (in cents)
    const pendingEur = balance.pending
      .filter((b) => b.currency === "eur")
      .reduce((sum, b) => sum + b.amount, 0);

    // Total donations in cents
    const donationsCents = availableEur + pendingEur;

    // Convert to euros
    const donations = donationsCents / 100;

    // Total = own funds + donations
    const total = FUNDOS_PROPRIOS + donations;

    return NextResponse.json({
      total,
      donations,
      fundosProprios: FUNDOS_PROPRIOS,
      goal: GOAL,
      progress: Math.min((total / GOAL) * 100, 100),
    });
  } catch (error) {
    console.error("Error fetching Stripe balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}
