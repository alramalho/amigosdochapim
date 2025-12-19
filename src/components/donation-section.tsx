"use client";

import { useState } from "react";
import { differenceInMonths } from "date-fns";
import { DonationProgress } from "./donation-progress";
import { PricingCard } from "./pricing-card";

// Next concurso date
const CONCURSO_DATE = new Date("2026-04-15");

// Calculate months until concurso (including current month)
function getMonthsUntilConcurso(): number {
  const months = differenceInMonths(CONCURSO_DATE, new Date()) + 1;
  return Math.max(1, months); // At least 1 month
}

const TIER_PRICES = {
  APOIANTE: 8,
  AMIGO: 12,
};

export function DonationSection() {
  const [selectedTier, setSelectedTier] = useState<"APOIANTE" | "AMIGO" | null>(null);
  const [loading, setLoading] = useState(false);

  const monthsUntilConcurso = getMonthsUntilConcurso();

  // Calculate contribution until concurso
  const selectedAmount = selectedTier
    ? TIER_PRICES[selectedTier] * monthsUntilConcurso
    : 0;

  const handleProceed = async () => {
    if (!selectedTier) return;

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier }),
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
    <div>
      {/* Donation Progress */}
      <div className="mb-12 md:mb-16">
        <DonationProgress selectedAmount={selectedAmount} />
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <PricingCard
          tier="APOIANTE"
          name="Apoiante"
          price="8€"
          description="Contribui diretamente para o financiamento de projetos artísticos."
          selected={selectedTier === "APOIANTE"}
          onSelect={() => setSelectedTier(selectedTier === "APOIANTE" ? null : "APOIANTE")}
        />

        <PricingCard
          tier="AMIGO"
          name="Amigo"
          price="12€"
          features={[
            "Tudo do plano Apoiante",
            "Participação na parcela pública do júri",
            "Acesso a todas as candidaturas submetidas",
          ]}
          highlighted
          selected={selectedTier === "AMIGO"}
          onSelect={() => setSelectedTier(selectedTier === "AMIGO" ? null : "AMIGO")}
        />
      </div>

      {/* Proceed Button */}
      {selectedTier && (
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/60 mb-4">
            Com a tua subscrição de {TIER_PRICES[selectedTier]}€/mês, contribuirás{" "}
            <strong>{selectedAmount}€</strong> até ao concurso de Abril 2026 ({monthsUntilConcurso} meses).
          </p>
          <button
            onClick={handleProceed}
            disabled={loading}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "A processar..." : "Avançar"}
          </button>
        </div>
      )}
    </div>
  );
}
