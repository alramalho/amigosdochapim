"use client";

import { useState } from "react";

interface PricingCardProps {
  tier: "APOIANTE" | "AMIGO";
  name: string;
  price: string;
  description?: string;
  features?: string[];
  highlighted?: boolean;
}

export function PricingCard({
  tier,
  name,
  price,
  description,
  features,
  highlighted = false,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        alert("Erro ao processar. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Erro ao processar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        highlighted ? "border-2 border-primary" : "border border-border"
      } p-6 md:p-8 rounded-sm relative flex flex-col`}
    >
      <div className="mb-4">
        <h3 className="text-xl md:text-2xl font-semibold mb-2">{name}</h3>
        <div className="text-2xl md:text-3xl font-semibold">
          {price}{" "}
          <span className="text-base md:text-lg font-normal text-foreground/60">
            / mês
          </span>
        </div>
      </div>

      {description && (
        <p className="text-sm md:text-base text-foreground/80 mb-4">
          {description}
        </p>
      )}

      {features && features.length > 0 && (
        <ul className="space-y-2 text-sm md:text-base text-foreground/80 mb-6">
          {features.map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`mt-auto w-full py-3 px-4 rounded-sm font-medium transition-opacity disabled:opacity-50 ${
          highlighted
            ? "bg-foreground text-background hover:opacity-90"
            : "border border-foreground hover:bg-foreground/5"
        }`}
      >
        {loading ? "A processar..." : "Subscrever"}
      </button>
    </div>
  );
}
