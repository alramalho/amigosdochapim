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
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <PricingCard
            name="Apoiante"
            price="15€"
            priceLabel=""
            badge="único"
            description="Contribui para o financiamento de projetos artísticos."
            selected={selectedOneOff === 15}
            onSelect={() => setSelectedOneOff(selectedOneOff === 15 ? null : 15)}
          />

          {/* Amigo card with 25€/50€ toggle */}
          <div
            className={`${
              selectedOneOff === 25 || selectedOneOff === 50
                ? "border-2 border-primary ring-2 ring-primary/20"
                : "border-2 border-primary"
            } p-6 md:p-8 rounded-sm relative flex flex-col transition-all`}
          >
            {(selectedOneOff === 25 || selectedOneOff === 50) && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                Selecionado
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl md:text-2xl font-semibold">Amigo</h3>
                <span className="text-xs text-foreground/40 font-normal">único</span>
              </div>

              {/* Price toggle */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedOneOff(25)}
                  className={`text-2xl md:text-3xl font-semibold transition-all cursor-pointer ${
                    selectedOneOff === 25
                      ? "text-primary underline underline-offset-4"
                      : "text-foreground/40 hover:text-foreground/70 hover:underline hover:underline-offset-4"
                  }`}
                >
                  25€
                </button>
                <span className="text-2xl md:text-3xl font-semibold text-foreground/20">/</span>
                <button
                  onClick={() => setSelectedOneOff(50)}
                  className={`text-2xl md:text-3xl font-semibold transition-all cursor-pointer ${
                    selectedOneOff === 50
                      ? "text-primary underline underline-offset-4"
                      : "text-foreground/40 hover:text-foreground/70 hover:underline hover:underline-offset-4"
                  }`}
                >
                  50€
                </button>
              </div>
            </div>

            <ul className="space-y-2 text-sm md:text-base text-foreground/80 mb-6">
              <li>• Participação na parcela pública do júri</li>
              <li>• Acesso a todas as candidaturas submetidas</li>
              {selectedOneOff === 50 && (
                <li>• Reconhecimento especial nos créditos</li>
              )}
            </ul>

            <button
              onClick={() => setSelectedOneOff(selectedOneOff === 25 || selectedOneOff === 50 ? null : 25)}
              className={`mt-auto w-full py-3 px-4 rounded-sm font-medium transition-all ${
                selectedOneOff === 25 || selectedOneOff === 50
                  ? "bg-primary text-primary-foreground"
                  : "bg-foreground text-background hover:opacity-90"
              }`}
            >
              {selectedOneOff === 25 || selectedOneOff === 50 ? "Selecionado" : "Selecionar"}
            </button>
          </div>
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
            {selectedOneOff >= 25 && selectedOneOff < 45 && (
              <> Terás acesso às candidaturas e poderás participar no júri.</>
            )}
            {selectedOneOff >= 45 && (
              <> Terás acesso ao júri e aparecerás nos créditos.</>
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
