"use client";

import { useState } from "react";
import { differenceInMonths } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { DonationProgress } from "./donation-progress";

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

type DonationType = "subscription" | "one-off";

export function DonationSection() {
  const [donationType, setDonationType] = useState<DonationType>("one-off");
  const [selectedTier, setSelectedTier] = useState<"APOIANTE" | "AMIGO" | null>("AMIGO");
  const [selectedOneOff, setSelectedOneOff] = useState<number | null>(25);
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

  // Set defaults when switching donation type
  const handleDonationTypeChange = (type: DonationType) => {
    setDonationType(type);
    setSelectedTier(type === "subscription" ? "AMIGO" : null);
    setSelectedOneOff(type === "one-off" ? 25 : null);
    setAcceptedTerms(false);
  };

  return (
    <div>
      {/* Donation Progress */}
      <div className="mb-0">
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

      {/* One-off Donation */}
      {donationType === "one-off" && (
        <>
          {/* Mobile: Grid Layout */}
          <div className="md:hidden space-y-4">
            {/* Amount Grid 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              {[15, 25, 50, 100].map((amount) => {
                const isAmigo = amount >= 25;
                const isSelected = selectedOneOff === amount;
                return (
                  <button
                    key={amount}
                    onClick={() => setSelectedOneOff(isSelected ? null : amount)}
                    className={`
                      p-4 rounded-sm text-center transition-all
                      ${isAmigo ? "border-2 border-primary" : "border border-border"}
                      ${isSelected ? "ring-2 ring-primary/20 bg-primary/5" : "hover:bg-accent/50"}
                    `}
                  >
                    <span className={`text-2xl font-semibold ${isSelected ? "text-primary" : ""}`}>
                      {amount}€
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Amigo Benefits Card - appears when >=25€ selected */}
            {selectedOneOff && selectedOneOff >= 25 && (
              <div className="border-2 border-primary rounded-sm p-4 animate-[fadeInPulse_0.3s_ease-out]">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold">Amigo</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {selectedOneOff}€
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm text-foreground/70">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Participação na parcela pública do júri
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Acesso a todas as candidaturas submetidas
                  </li>
                  {selectedOneOff >= 50 && (
                    <li className="flex items-center gap-2 animate-[fadeInPulse_0.3s_ease-out]">
                      <CheckCheck className="w-4 h-4 text-primary" />
                      Reconhecimento especial nos créditos
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Apoiante info - appears when 15€ selected */}
            {selectedOneOff === 15 && (
              <div className="border border-border rounded-sm p-4 animate-[fadeInPulse_0.3s_ease-out]">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold">Apoiante</h3>
                  <span className="text-xs bg-foreground/10 text-foreground/70 px-2 py-0.5 rounded-full">
                    15€
                  </span>
                </div>
                <p className="text-sm text-foreground/70">
                  Contribui para o financiamento de projetos artísticos.
                </p>
              </div>
            )}

            {/* Terms & Donate Button */}
            {selectedOneOff && (
              <div className="space-y-4 pt-2 animate-[fadeInPulse_0.3s_ease-out]">
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-foreground/70">
                    Li e aceito os{" "}
                    <a href="/termos" target="_blank" className="text-primary underline underline-offset-2">
                      termos e condições
                    </a>
                  </span>
                </label>
                <button
                  onClick={handleProceed}
                  disabled={loading || !acceptedTerms}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "A processar..." : "Doar"}
                  {!loading && <span>→</span>}
                </button>
              </div>
            )}
          </div>

          {/* Desktop: Card Layout */}
          <div className="hidden md:block space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Apoiante Card */}
              <div
                className={`border rounded-sm p-6 flex flex-col transition-all ${
                  selectedOneOff === 15
                    ? "border-2 border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-semibold">Apoiante</h3>
                  <span className="text-sm text-foreground/40">único</span>
                </div>
                <div className="text-3xl font-semibold mb-4">15€</div>
                <p className="text-foreground/80 mb-6 flex-grow">
                  Contribui para o financiamento de projetos artísticos.
                </p>
                <button
                  onClick={() => setSelectedOneOff(selectedOneOff === 15 ? null : 15)}
                  className={`w-full py-3 px-4 rounded-sm font-medium transition-all ${
                    selectedOneOff === 15
                      ? "bg-primary text-primary-foreground"
                      : "border border-foreground hover:bg-foreground/5"
                  }`}
                >
                  {selectedOneOff === 15 ? "Selecionado" : "Selecionar"}
                </button>
              </div>

              {/* Amigo Card */}
              <div
                className={`border-2 border-primary rounded-sm p-6 flex flex-col transition-all ${
                  selectedOneOff && selectedOneOff >= 25
                    ? "ring-2 ring-primary/20"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-semibold">Amigo</h3>
                  <span className="text-sm text-foreground/40">único</span>
                </div>
                <div className="text-3xl font-semibold mb-4">
                  <button
                    onClick={() => setSelectedOneOff(25)}
                    className={`hover:underline underline-offset-4 transition-all ${
                      selectedOneOff === 25 ? "underline" : "text-foreground/40"
                    }`}
                  >
                    25€
                  </button>
                  <span className="text-foreground/30 mx-2">/</span>
                  <button
                    onClick={() => setSelectedOneOff(50)}
                    className={`hover:underline underline-offset-4 transition-all ${
                      selectedOneOff === 50 ? "underline" : "text-foreground/40"
                    }`}
                  >
                    50€
                  </button>
                  <span className="text-foreground/30 mx-2">/</span>
                  <button
                    onClick={() => setSelectedOneOff(100)}
                    className={`hover:underline underline-offset-4 transition-all ${
                      selectedOneOff === 100 ? "underline" : "text-foreground/40"
                    }`}
                  >
                    100€
                  </button>
                </div>
                <ul className="space-y-2 text-foreground/80 mb-6 flex-grow">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    Participação na parcela pública do júri
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    Acesso a todas as candidaturas submetidas
                  </li>
                  {selectedOneOff && selectedOneOff >= 50 && (
                    <li className="flex items-center gap-2 animate-[fadeInPulse_0.3s_ease-out]">
                      <CheckCheck className="w-4 h-4 text-primary flex-shrink-0" />
                      Reconhecimento especial nos créditos
                    </li>
                  )}
                </ul>
                <button
                  onClick={() => setSelectedOneOff(selectedOneOff && selectedOneOff >= 25 ? null : 25)}
                  className={`w-full py-3 px-4 rounded-sm font-medium transition-all ${
                    selectedOneOff && selectedOneOff >= 25
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  {selectedOneOff && selectedOneOff >= 25 ? "Selecionado" : "Selecionar"}
                </button>
              </div>
            </div>

            {/* Terms & Donate Button - Desktop */}
            {selectedOneOff && (
              <div className="space-y-4 pt-2 flex flex-col items-center">
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-foreground/70">
                    Li e aceito os{" "}
                    <a href="/termos" target="_blank" className="text-primary underline underline-offset-2">
                      termos e condições
                    </a>
                  </span>
                </label>
                <button
                  onClick={handleProceed}
                  disabled={loading || !acceptedTerms}
                  className="py-3 px-8 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "A processar..." : `Doar ${selectedOneOff}€`}
                  {!loading && <span>→</span>}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Subscription */}
      {donationType === "subscription" && (
        <>
          {/* Mobile: Grid Layout */}
          <div className="md:hidden space-y-4">
            {/* Price Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedTier(selectedTier === "APOIANTE" ? null : "APOIANTE")}
                className={`
                  p-4 rounded-sm text-center transition-all border border-border
                  ${selectedTier === "APOIANTE" ? "ring-2 ring-primary/20 bg-primary/5" : "hover:bg-accent/50"}
                `}
              >
                <span className={`text-2xl font-semibold ${selectedTier === "APOIANTE" ? "text-primary" : ""}`}>
                  8€
                </span>
                <span className="text-sm text-foreground/50">/mês</span>
              </button>

              <button
                onClick={() => setSelectedTier(selectedTier === "AMIGO" ? null : "AMIGO")}
                className={`
                  p-4 rounded-sm text-center transition-all border-2 border-primary
                  ${selectedTier === "AMIGO" ? "ring-2 ring-primary/20 bg-primary/5" : "hover:bg-accent/50"}
                `}
              >
                <span className={`text-2xl font-semibold ${selectedTier === "AMIGO" ? "text-primary" : ""}`}>
                  12€
                </span>
                <span className="text-sm text-foreground/50">/mês</span>
              </button>
            </div>

            {/* Amigo Benefits Card */}
            {selectedTier === "AMIGO" && (
              <div className="border-2 border-primary rounded-sm p-4 animate-[fadeInPulse_0.3s_ease-out]">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold">Amigo</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    12€/mês
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm text-foreground/70">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Participação na parcela pública do júri
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Acesso a todas as candidaturas submetidas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-primary" />
                    Reconhecimento especial nos créditos
                  </li>
                </ul>
              </div>
            )}

            {/* Apoiante info */}
            {selectedTier === "APOIANTE" && (
              <div className="border border-border rounded-sm p-4 animate-[fadeInPulse_0.3s_ease-out]">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold">Apoiante</h3>
                  <span className="text-xs bg-foreground/10 text-foreground/70 px-2 py-0.5 rounded-full">
                    8€/mês
                  </span>
                </div>
                <p className="text-sm text-foreground/70">
                  Contribui diretamente para o financiamento de projetos artísticos.
                </p>
              </div>
            )}

            {/* Terms & Subscribe Button */}
            {selectedTier && (
              <div className="space-y-4 pt-2 animate-[fadeInPulse_0.3s_ease-out]">
                <p className="text-sm text-foreground/60 text-center">
                  Contribuirás <strong>{selectedAmount}€</strong> até Abril 2026 ({monthsUntilConcurso} meses)
                </p>
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-foreground/70">
                    Li e aceito os{" "}
                    <a href="/termos" target="_blank" className="text-primary underline underline-offset-2">
                      termos e condições
                    </a>
                  </span>
                </label>
                <button
                  onClick={handleProceed}
                  disabled={loading || !acceptedTerms}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "A processar..." : "Subscrever"}
                  {!loading && <span>→</span>}
                </button>
              </div>
            )}
          </div>

          {/* Desktop: Card Layout */}
          <div className="hidden md:block space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Apoiante Card */}
              <div
                className={`border rounded-sm p-6 flex flex-col transition-all ${
                  selectedTier === "APOIANTE"
                    ? "border-2 border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-semibold">Apoiante</h3>
                  <span className="text-sm text-foreground/40">mensal</span>
                </div>
                <div className="text-3xl font-semibold mb-4">
                  8€<span className="text-lg font-normal text-foreground/60"> / mês</span>
                </div>
                <p className="text-foreground/80 mb-6 flex-grow">
                  Contribui diretamente para o financiamento de projetos artísticos.
                </p>
                <button
                  onClick={() => setSelectedTier(selectedTier === "APOIANTE" ? null : "APOIANTE")}
                  className={`w-full py-3 px-4 rounded-sm font-medium transition-all ${
                    selectedTier === "APOIANTE"
                      ? "bg-primary text-primary-foreground"
                      : "border border-foreground hover:bg-foreground/5"
                  }`}
                >
                  {selectedTier === "APOIANTE" ? "Selecionado" : "Selecionar"}
                </button>
              </div>

              {/* Amigo Card */}
              <div
                className={`border-2 border-primary rounded-sm p-6 flex flex-col transition-all ${
                  selectedTier === "AMIGO"
                    ? "ring-2 ring-primary/20"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-semibold">Amigo</h3>
                  <span className="text-sm text-foreground/40">mensal</span>
                </div>
                <div className="text-3xl font-semibold mb-4">
                  12€<span className="text-lg font-normal text-foreground/60"> / mês</span>
                </div>
                <ul className="space-y-2 text-foreground/80 mb-6 flex-grow">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    Participação na parcela pública do júri
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    Acesso a todas as candidaturas submetidas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-primary flex-shrink-0" />
                    Reconhecimento especial nos créditos
                  </li>
                </ul>
                <button
                  onClick={() => setSelectedTier(selectedTier === "AMIGO" ? null : "AMIGO")}
                  className={`w-full py-3 px-4 rounded-sm font-medium transition-all ${
                    selectedTier === "AMIGO"
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  {selectedTier === "AMIGO" ? "Selecionado" : "Selecionar"}
                </button>
              </div>
            </div>

            {/* Terms & Subscribe Button - Desktop */}
            {selectedTier && (
              <div className="space-y-4 pt-2 flex flex-col items-center">
                <p className="text-sm text-foreground/60 text-center">
                  Contribuirás <strong>{selectedAmount}€</strong> até Abril 2026 ({monthsUntilConcurso} meses)
                </p>
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-foreground/70">
                    Li e aceito os{" "}
                    <a href="/termos" target="_blank" className="text-primary underline underline-offset-2">
                      termos e condições
                    </a>
                  </span>
                </label>
                <button
                  onClick={handleProceed}
                  disabled={loading || !acceptedTerms}
                  className="py-3 px-8 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "A processar..." : "Subscrever"}
                  {!loading && <span>→</span>}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
