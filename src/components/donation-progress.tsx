"use client";

import Lottie from "lottie-react";
import { useEffect, useId, useState } from "react";
import partyPopperAnimation from "../../public/party-popper-lottie.json";

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

const FUTURE_CONTESTS_PER_YEAR = 2;
const FIRST_FUTURE_CONTEST_YEAR = 2027;
const FIGURE_FILL_TOP = 4;
const FIGURE_FILL_BOTTOM = 156;
const FIGURE_FILL_HEIGHT = FIGURE_FILL_BOTTOM - FIGURE_FILL_TOP;

const euroFormatter = new Intl.NumberFormat("pt-PT", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

function formatEuros(value: number) {
  return `${euroFormatter.format(value)}€`;
}

function getFutureContestLabel(fundedFutureContests: number) {
  const year = FIRST_FUTURE_CONTEST_YEAR + Math.floor(fundedFutureContests / FUTURE_CONTESTS_PER_YEAR);
  const edition = (fundedFutureContests % FUTURE_CONTESTS_PER_YEAR) + 1;

  return {
    title: `Concurso ${year}`,
    edition: `${edition}.ª edição`,
  };
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
  const isFunded = currentTotal >= goal;
  const donationsNeededForFirstContest = Math.max(goal - fundosProprios, 0);
  const nextContestBaseAmount = Math.max(donations - donationsNeededForFirstContest, 0);
  const fundedFutureContests = Math.floor(nextContestBaseAmount / goal);
  const nextContestDisplayAmount = nextContestBaseAmount % goal;
  const nextContestLabel = getFutureContestLabel(fundedFutureContests);
  const displayFundosProprios = isFunded ? 0 : fundosProprios;
  const displayDonations = isFunded ? nextContestDisplayAmount : donations;
  const displayBaseTotal = isFunded ? nextContestDisplayAmount : currentTotal;
  const selectedForDisplayedContest = Math.min(selectedAmount, Math.max(goal - displayBaseTotal, 0));
  const displayTotalWithSelected = displayBaseTotal + selectedForDisplayedContest;

  // Calculate individual progress percentages
  const fundosProgress = Math.min((displayFundosProprios / goal) * 100, 100);
  const donationsProgress = Math.min((displayDonations / goal) * 100, 100 - fundosProgress);
  const currentProgress = fundosProgress + donationsProgress;
  const selectedProgress = Math.min((selectedForDisplayedContest / goal) * 100, 100 - currentProgress);

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6">
      <div className="flex flex-row justify-between items-start gap-4 md:gap-8 w-full overflow-hidden">
        {/* Left side: Title + Money info */}
        <div className="text-left min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-3xl text-foreground/70">Próximo concurso:</h1>
          {isFunded ? (
            <div className="mb-4 md:mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-5xl text-foreground/70 font-bold">
                {nextContestLabel.title}
              </h1>
              <p className="text-2xl sm:text-3xl md:text-3xl text-foreground/60 font-semibold mt-1">
                {nextContestLabel.edition}
              </p>
            </div>
          ) : (
            <h1 className="text-4xl sm:text-6xl md:text-6xl text-foreground/70 font-bold mb-4 md:mb-6">15 Maio - 30 Julho 2026</h1>
          )}

          {/* Money info - below title */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xl md:text-2xl font-semibold">
              {loading ? (
                <span className="text-foreground/50">...</span>
              ) : (
                <>
                  <span>{formatEuros(displayBaseTotal)}</span>
                  {selectedForDisplayedContest > 0 && (
                    <span className="text-primary/70">+{formatEuros(selectedForDisplayedContest)}</span>
                  )}
                </>
              )}
              <span className="text-foreground/50 text-base md:text-lg">/ {formatEuros(goal)}</span>
            </div>
            {/* Legend */}
            {!loading && data && (
              <div className="flex flex-col gap-1 text-xs md:text-sm">
                {!isFunded && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-primary" />
                    <span className="text-foreground/60">Fundos próprios: <strong>{formatEuros(data.fundosProprios)}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm" style={{ backgroundColor: '#722F37' }} />
                  <span className="text-foreground/60">Doações: <strong>{formatEuros(displayDonations)}</strong></span>
                </div>
                {selectedForDisplayedContest > 0 && (
                  <div className="flex items-center gap-1.5 animate-[fadeInPulse_0.5s_ease-out]">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm border border-[#5a7247]" style={{ backgroundColor: '#5a7247' }} />
                    <span className="font-medium break-words" style={{ color: '#5a7247' }}>A tua contribuição: <strong>{formatEuros(selectedForDisplayedContest)}</strong></span>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs md:text-sm text-foreground/60">
              {loading ? (
                "A carregar..."
              ) : displayTotalWithSelected >= goal ? (
                "Com esta contribuição, o concurso fica financiado."
              ) : (
                <>{selectedForDisplayedContest > 0 ? "Faltam " : "Faltam "}<strong>{formatEuros(goal - displayTotalWithSelected)}</strong></>
              )}
            </p>
          </div>
        </div>

        {/* Figure */}
        <div className="flex items-end shrink-0">
          <div className="relative w-24 h-48 sm:w-32 sm:h-64 md:w-40 md:h-80">
            <HumanFigure
              ariaLabel={`Progresso de financiamento: ${(currentProgress + selectedProgress).toFixed(0)}%`}
              donationsProgress={donationsProgress}
              fundosProgress={fundosProgress}
              selectedProgress={selectedProgress}
            />

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FundedContestCard() {
  const [data, setData] = useState<BalanceData | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await fetch("/api/stripe/balance");
        if (response.ok) {
          setData(await response.json());
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }

    fetchBalance();
  }, []);

  const isFunded = !!data && data.total >= data.goal;

  if (!isFunded) return null;

  return (
    <div className="relative overflow-hidden border border-border bg-accent/40 rounded-sm p-5 md:p-6 text-center">
      <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">Concurso 2026 financiado</p>
      <div className="mb-2 flex items-center justify-center gap-2">
        <p className="text-2xl md:text-3xl font-semibold">Chegámos ao objetivo.</p>
        <Lottie
          animationData={partyPopperAnimation}
          autoplay
          loop
          className="h-9 w-9 md:h-10 md:w-10"
          aria-hidden="true"
        />
      </div>
      <p className="text-sm md:text-base text-foreground/70 max-w-2xl mx-auto">
        Obrigado a todos. O apoio para esta edição está garantido; as próximas contribuições começam já a financiar o concurso seguinte.
      </p>
    </div>
  );
}

function HumanFigure({
  ariaLabel,
  donationsProgress = 0,
  fundosProgress = 0,
  selectedProgress = 0,
  nextProgress = 0,
}: {
  ariaLabel: string;
  donationsProgress?: number;
  fundosProgress?: number;
  selectedProgress?: number;
  nextProgress?: number;
}) {
  const id = useId().replace(/:/g, "");
  const clipId = `humanClip-${id}`;
  const patternId = `selectedPattern-${id}`;
  const currentProgress = fundosProgress + donationsProgress + nextProgress;
  const fillSegment = (progress: number, previousProgress = 0) => ({
    y: FIGURE_FILL_BOTTOM - ((previousProgress + progress) / 100) * FIGURE_FILL_HEIGHT,
    height: (progress / 100) * FIGURE_FILL_HEIGHT,
  });
  const selectedFill = fillSegment(selectedProgress, currentProgress);
  const nextFill = fillSegment(nextProgress);
  const donationsFill = fillSegment(donationsProgress, fundosProgress);
  const fundosFill = fillSegment(fundosProgress);

  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" aria-label={ariaLabel}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="20" r="16" />
          <rect x="30" y="40" width="40" height="50" rx="8" ry="8" />
          <rect x="14" y="45" width="12" height="42" rx="6" ry="6" />
          <rect x="74" y="45" width="12" height="42" rx="6" ry="6" />
          <rect x="31" y="94" width="16" height="62" rx="8" ry="8" />
          <rect x="53" y="94" width="16" height="62" rx="8" ry="8" />
        </clipPath>

        <pattern id={patternId} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#5a7247" opacity="0.8" />
          <rect x="3" width="3" height="6" fill="#5a7247" opacity="0.4" />
        </pattern>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="100" height="200" fill="var(--color-accent)" opacity="0.5" />
      </g>

      {selectedProgress > 0 && (
        <g clipPath={`url(#${clipId})`}>
          <rect
            x="0"
            y={selectedFill.y}
            width="100"
            height={selectedFill.height}
            fill={`url(#${patternId})`}
            className="transition-all duration-[2000ms] ease-out"
          />
        </g>
      )}

      {nextProgress > 0 && (
        <g clipPath={`url(#${clipId})`}>
          <rect
            x="0"
            y={nextFill.y}
            width="100"
            height={nextFill.height}
            fill="#5a7247"
            className="transition-all duration-[2000ms] ease-out"
          />
        </g>
      )}

      {donationsProgress > 0 && (
        <g clipPath={`url(#${clipId})`}>
          <rect
            x="0"
            y={donationsFill.y}
            width="100"
            height={donationsFill.height}
            fill="#722F37"
            className="transition-all duration-[2000ms] ease-out"
          />
        </g>
      )}

      {fundosProgress > 0 && (
        <g clipPath={`url(#${clipId})`}>
          <rect
            x="0"
            y={fundosFill.y}
            width="100"
            height={fundosFill.height}
            fill="var(--color-primary)"
            className="transition-all duration-[2000ms] ease-out"
          />
        </g>
      )}

      <g fill="none" stroke="var(--color-foreground)" strokeWidth="1.5" opacity="0.3">
        <circle cx="50" cy="20" r="16" />
        <rect x="30" y="40" width="40" height="50" rx="8" ry="8" />
        <rect x="14" y="45" width="12" height="42" rx="6" ry="6" />
        <rect x="74" y="45" width="12" height="42" rx="6" ry="6" />
        <rect x="31" y="94" width="16" height="62" rx="8" ry="8" />
        <rect x="53" y="94" width="16" height="62" rx="8" ry="8" />
      </g>
    </svg>
  );
}
