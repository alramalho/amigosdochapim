"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CONSENT_KEY = "adc-consent";
const DISMISS_UNTIL_KEY = "adc-consent-until";
const GEO_KEY = "adc-geo";
const GITHUB_URL = "https://github.com/alramalho/amigosdochapim";
// Re-ask after a dismissal, but never again once the visitor has accepted.
const DISMISS_DAYS = 3;

export function ConsentBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (consent === "granted") return; // accepted: never ask again
      if (consent === "dismissed") {
        const until = Number(localStorage.getItem(DISMISS_UNTIL_KEY) || 0);
        if (Date.now() < until) return; // still within the 3-day quiet period
      }
      setVisible(true);
    } catch {}
  }, [pathname]);

  const dismiss = (choice: "granted" | "dismissed") => {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
      if (choice === "dismissed") {
        localStorage.setItem(DISMISS_UNTIL_KEY, String(Date.now() + DISMISS_DAYS * 86400000));
      }
    } catch {}
    setVisible(false);
  };

  const share = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      dismiss("dismissed");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          localStorage.setItem(
            GEO_KEY,
            JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          );
        } catch {}
        dismiss("granted");
      },
      () => dismiss("dismissed"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border border-border bg-accent/95 backdrop-blur-sm shadow-lg p-5 text-sm">
      <p className="text-foreground/80 leading-relaxed">
        Guardamos estatísticas anónimas (páginas visitadas e uma localização aproximada a
        partir da região — nunca o teu IP). Se quiseres, podes partilhar a tua localização exata
        para nos ajudares a perceber de onde nos visitam. Somos totalmente open source — podes
        confirmar tudo o que guardamos no{" "}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:no-underline"
        >
          nosso código no GitHub
        </a>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={share}
          className="px-4 py-2 rounded-sm bg-foreground text-background text-sm hover:opacity-90"
        >
          Partilhar localização
        </button>
        <button
          onClick={() => dismiss("dismissed")}
          className="px-4 py-2 rounded-sm border border-border text-sm hover:bg-background/40"
        >
          Manter aproximada
        </button>
      </div>
    </div>
  );
}
