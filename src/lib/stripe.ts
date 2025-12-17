import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const STRIPE_PRICES = {
  APOIANTE: process.env.STRIPE_PRICE_APOIANTE!,
  AMIGO: process.env.STRIPE_PRICE_AMIGO!,
} as const;
