import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase";
import { sendWelcomeEmail, addContactToLoops } from "@/lib/loops";
import type Stripe from "stripe";
import { SubscriptionTier } from "@prisma/client";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email;
  const name = session.customer_details?.name;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const tier = (session.metadata?.tier || "APOIANTE") as SubscriptionTier;

  if (!email) {
    console.error("No email found in checkout session");
    return;
  }

  // Get subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const firstItem = stripeSubscription.items.data[0];

  // Create or update user in database
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      stripeCustomerId: customerId,
    },
    create: {
      email,
      name,
      stripeCustomerId: customerId,
    },
  });

  // Create subscription record (upsert by userId since each user has one subscription)
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      stripeSubscriptionId: subscriptionId,
      tier,
      status: "ACTIVE",
      currentPeriodStart: new Date(firstItem.current_period_start * 1000),
      currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscriptionId,
      tier,
      status: "ACTIVE",
      currentPeriodStart: new Date(firstItem.current_period_start * 1000),
      currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
    },
  });

  // Generate magic link via Supabase
  const supabase = createServiceClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3027";

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${appUrl}/painel`,
    },
  });

  if (linkError) {
    console.error("Failed to generate magic link:", linkError);
    return;
  }

  const magicLink = linkData.properties.action_link;

  // Update user with Supabase ID if available
  if (linkData.user?.id) {
    await prisma.user.update({
      where: { id: user.id },
      data: { supabaseId: linkData.user.id },
    });
  }

  // Add contact to Loops and send welcome email
  await addContactToLoops({ email, name: name || undefined, tier });
  await sendWelcomeEmail({
    email,
    name: name || undefined,
    tier,
    magicLink,
  });

  console.log(`New subscriber: ${email} (${tier})`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const status = mapStripeStatus(subscription.status);
  const firstItem = subscription.items.data[0];

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status,
      currentPeriodStart: new Date(firstItem.current_period_start * 1000),
      currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "CANCELLED",
    },
  });
}

function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "canceled":
      return "CANCELLED";
    case "past_due":
      return "PAST_DUE";
    case "incomplete":
    case "incomplete_expired":
      return "INCOMPLETE";
    default:
      return "ACTIVE";
  }
}
