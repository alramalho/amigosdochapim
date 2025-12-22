"use client";

import { useEffect, useState } from "react";

interface BalanceData {
  total: number;
  donations: number;
  fundosProprios: number;
  goal: number;
  progress: number;
}

interface DonationProgressProps {
  selectedAmount?: number;
}

export function DonationProgress({ selectedAmount = 0 }: DonationProgressProps) {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await fetch("/api/stripe/balance");
        if (response.ok) {
          const balanceData = await response.json();
          setData(balanceData);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, []);

  const goal = data?.goal ?? 1300;
  const currentTotal = data?.total ?? 0;
  const fundosProprios = data?.fundosProprios ?? 0;
  const donations = data?.donations ?? 0;

  // Calculate individual progress percentages
  const fundosProgress = Math.min((fundosProprios / goal) * 100, 100);
  const donationsProgress = Math.min((donations / goal) * 100, 100 - fundosProgress);
  const currentProgress = fundosProgress + donationsProgress;
  const selectedProgress = Math.min((selectedAmount / goal) * 100, 100 - currentProgress);
  const totalWithSelected = currentTotal + selectedAmount;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-row justify-around items-center md:gap-15 gap-6 w-full">
        <div className="text-left mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-3xl text-foreground/70">Próximo concurso:</h1>
          <h1 className="text-4xl sm:text-6xl md:text-6xl text-foreground/70 font-bold">Abril 2026</h1>
        </div>
        <div className="relative w-32 h-64 md:w-40 md:h-80">
          {/* Human figure SVG */}
          <svg
            viewBox="0 0 100 200"
            className="w-full h-full"
            aria-label={`Progresso de doações: ${currentProgress.toFixed(0)}%`}
          >
            <defs>
              {/* Clip path for the human silhouette */}
              <clipPath id="humanClip">
                {/* Head */}
                <circle cx="50" cy="20" r="16" />
                {/* Torso - rounded rectangle */}
                <rect x="30" y="40" width="40" height="50" rx="8" ry="8" />
                {/* Left arm - thinner */}
                <rect x="14" y="45" width="12" height="42" rx="6" ry="6" />
                {/* Right arm - thinner */}
                <rect x="74" y="45" width="12" height="42" rx="6" ry="6" />
                {/* Left leg - thicker and longer */}
                <rect x="31" y="94" width="16" height="62" rx="8" ry="8" />
                {/* Right leg - thicker and longer */}
                <rect x="53" y="94" width="16" height="62" rx="8" ry="8" />
              </clipPath>

              {/* Pattern for selected amount (striped) */}
              <pattern id="selectedPattern" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <rect width="3" height="6" fill="var(--color-primary)" opacity="0.6" />
                <rect x="3" width="3" height="6" fill="var(--color-primary)" opacity="0.3" />
              </pattern>
            </defs>

            {/* Background silhouette (empty state) */}
            <g clipPath="url(#humanClip)">
              <rect x="0" y="0" width="100" height="200" fill="var(--color-accent)" opacity="0.5" />
            </g>

            {/* Layer 1: Selected amount portion (striped - only the additional part) */}
            {selectedAmount > 0 && (
              <g clipPath="url(#humanClip)">
                <rect
                  x="0"
                  y={`${200 - ((currentProgress + selectedProgress) * 2)}`}
                  width="100"
                  height={`${selectedProgress * 2}`}
                  fill="url(#selectedPattern)"
                  className="transition-all duration-[1500ms] ease-out"
                />
              </g>
            )}

            {/* Layer 2: Donations (burgundy) */}
            <g clipPath="url(#humanClip)">
              <rect
                x="0"
                y={`${200 - (currentProgress * 2)}`}
                width="100"
                height={`${donationsProgress * 2}`}
                fill="#722F37"
                className="transition-all duration-[2000ms] ease-out"
              />
            </g>

            {/* Layer 3: Fundos próprios (primary color) */}
            <g clipPath="url(#humanClip)">
              <rect
                x="0"
                y={`${200 - (fundosProgress * 2)}`}
                width="100"
                height={`${fundosProgress * 2}`}
                fill="var(--color-primary)"
                className="transition-all duration-[2000ms] ease-out"
              />
            </g>

            {/* Outline */}
            <g fill="none" stroke="var(--color-foreground)" strokeWidth="1.5" opacity="0.3">
              <circle cx="50" cy="20" r="16" />
              <rect x="30" y="40" width="40" height="50" rx="8" ry="8" />
              <rect x="14" y="45" width="12" height="42" rx="6" ry="6" />
              <rect x="74" y="45" width="12" height="42" rx="6" ry="6" />
              <rect x="31" y="94" width="16" height="62" rx="8" ry="8" />
              <rect x="53" y="94" width="16" height="62" rx="8" ry="8" />
            </g>
          </svg>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Progress info */}
      <div className="text-center space-y-3">
        <div className="text-3xl md:text-4xl font-semibold">
          {loading ? (
            <span className="text-foreground/50">...</span>
          ) : (
            <>
              <span>{currentTotal.toFixed(0)}€</span>
              {selectedAmount > 0 && (
                <span className="text-primary/70"> +{selectedAmount}€</span>
              )}
            </>
          )}
          <span className="text-foreground/50 text-xl md:text-2xl"> / {goal}€</span>
        </div>

        {/* Legend */}
        {!loading && data && (
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-foreground/60">Fundos próprios: <strong className="text-foreground/80">{data.fundosProprios}€</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#722F37' }} />
              <span className="text-foreground/60">Doações: <strong className="text-foreground/80">{data.donations.toFixed(0)}€</strong></span>
            </div>
            {selectedAmount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary/50" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, var(--color-primary) 2px, var(--color-primary) 4px)' }} />
                <span className="text-foreground/60">A tua contribuição: <strong className="text-primary">{selectedAmount}€</strong></span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm md:text-base text-foreground/70">
          {loading ? (
            "A carregar..."
          ) : totalWithSelected >= goal ? (
            selectedAmount > 0 ? (
              <>Com a tua ajuda, <strong>alcançamos o objetivo!</strong></>
            ) : (
              "Objetivo alcançado!"
            )
          ) : (
            <>Faltam <strong>{(goal - totalWithSelected).toFixed(0)}€</strong> para financiar o próximo concurso</>
          )}
        </p>
        <p className="text-xs text-foreground/50">
          O prémio é de 1000€. Os restantes 300€ cobrem impostos e custos operacionais.
        </p>
      </div>
    </div>
  );
}
