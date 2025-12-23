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

const ONE_OFF_AMOUNTS = [15, 25, 50] as const;

type DonationType = "subscription" | "one-off";

export function DonationSection() {
  const [donationType, setDonationType] = useState<DonationType>("one-off");
  const [selectedTier, setSelectedTier] = useState<"APOIANTE" | "AMIGO" | null>(null);
  const [selectedOneOff, setSelectedOneOff] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const monthsUntilConcurso = getMonthsUntilConcurso();

  // Calculate contribution until concurso
  const selectedAmount = donationType === "subscription" && selectedTier
    ? TIER_PRICES[selectedTier] * monthsUntilConcurso
    : donationType === "one-off" && selectedOneOff
      ? selectedOneOff
      : 0;

  const handleProceed = async () => {
    setLoading(true);
    try {
      if (donationType === "subscription" && selectedTier) {
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
      } else if (donationType === "one-off" && selectedOneOff) {
        const response = await fetch("/api/stripe/checkout-donation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: selectedOneOff }),
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error("No checkout URL returned");
          alert("Erro ao processar. Por favor, tente novamente.");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Erro ao processar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Clear selection when switching donation type
  const handleDonationTypeChange = (type: DonationType) => {
    setDonationType(type);
    setSelectedTier(null);
    setSelectedOneOff(null);
  };

  return (
    <div>
      {/* Donation Progress */}
      <div className="mb-12 md:mb-16">
        <DonationProgress selectedAmount={selectedAmount} />
      </div>

      {/* Donation Type Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex border border-border rounded-sm overflow-hidden">
          <button
            onClick={() => handleDonationTypeChange("one-off")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${donationType === "one-off"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground/70 hover:bg-accent"
              }`}
          >
            Doação única
          </button>
          <button
            onClick={() => handleDonationTypeChange("subscription")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${donationType === "subscription"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground/70 hover:bg-accent"
              }`}
          >
            Subscrição mensal
          </button>
        </div>
      </div>

      {/* One-off Donation Cards */}
      {donationType === "one-off" && (
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          <PricingCard
            name="Apoiante"
            price="15€"
            priceLabel=""
            badge="único"
            description="Contribui para o financiamento de projetos artísticos."
            selected={selectedOneOff === 15}
            onSelect={() => setSelectedOneOff(selectedOneOff === 15 ? null : 15)}
          />

          <PricingCard
            name="Amigo"
            price="25€"
            priceLabel=""
            badge="único"
            features={[
              "Participação na parcela pública do júri",
              "Acesso a todas as candidaturas submetidas",
            ]}
            highlighted
            selected={selectedOneOff === 25}
            onSelect={() => setSelectedOneOff(selectedOneOff === 25 ? null : 25)}
          />

          <PricingCard
            name="Mecenas"
            price="50€"
            priceLabel=""
            badge="único"
            features={[
              "Participação na parcela pública do júri",
              "Acesso a todas as candidaturas submetidas",
              "Reconhecimento especial nos créditos",
            ]}
            selected={selectedOneOff === 50}
            onSelect={() => setSelectedOneOff(selectedOneOff === 50 ? null : 50)}
          />
        </div>
      )}

      {/* Subscription Cards */}
      {donationType === "subscription" && (
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <PricingCard
            name="Apoiante"
            price="8€"
            badge="mensal"
            description="Contribui diretamente para o financiamento de projetos artísticos."
            selected={selectedTier === "APOIANTE"}
            onSelect={() => setSelectedTier(selectedTier === "APOIANTE" ? null : "APOIANTE")}
          />

          <PricingCard
            name="Amigo"
            price="12€"
            badge="mensal"
            features={[
              "Tudo do plano Apoiante",
              "Participação na parcela pública do júri",
              "Acesso a todas as candidaturas submetidas",
              "Reconhecimento especial nos créditos",
            ]}
            highlighted
            selected={selectedTier === "AMIGO"}
            onSelect={() => setSelectedTier(selectedTier === "AMIGO" ? null : "AMIGO")}
          />
        </div>
      )}

      {/* Proceed Button - One-off */}
      {donationType === "one-off" && selectedOneOff && (
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/60 mb-4">
            A tua doação de <strong>{selectedOneOff}€</strong> ajuda a financiar o próximo concurso.
            {selectedOneOff >= 25 && (
              <> Terás acesso às candidaturas e poderás participar no júri.</>
            )}
          </p>
          <label className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
            />
            <span className="text-sm text-foreground/70">
              Li e aceito os{" "}
              <a href="/termos" target="_blank" className="text-primary hover:underline">
                termos e condições
              </a>
            </span>
          </label>
          <button
            onClick={handleProceed}
            disabled={loading || !acceptedTerms}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "A processar..." : "Doar"}
          </button>
        </div>
      )}

      {/* Proceed Button - Subscription */}
      {donationType === "subscription" && selectedTier && (
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/60 mb-4">
            Com a tua subscrição de {TIER_PRICES[selectedTier]}€/mês, contribuirás{" "}
            <strong>{selectedAmount}€</strong> até ao concurso de Abril 2026 ({monthsUntilConcurso} meses).
          </p>
          <label className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
            />
            <span className="text-sm text-foreground/70">
              Li e aceito os{" "}
              <a href="/termos" target="_blank" className="text-primary hover:underline">
                termos e condições
              </a>
            </span>
          </label>
          <button
            onClick={handleProceed}
            disabled={loading || !acceptedTerms}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "A processar..." : "Subscrever"}
          </button>
        </div>
      )}
    </div>
  );
}
