"use client";

import { useEffect, useState } from "react";
import { getFundingTarget, type ContestBalance, type ContestFundingTarget } from "./contest";

export function useContestBalance() {
  const [balance, setBalance] = useState<ContestBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await fetch("/api/stripe/balance");
        if (response.ok) {
          setBalance(await response.json());
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, []);

  const target: ContestFundingTarget = getFundingTarget(
    balance ?? { total: 0, donations: 0, fundosProprios: 0, goal: 1300 }
  );

  return { balance, loading, target };
}
