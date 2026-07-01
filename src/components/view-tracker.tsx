"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const GEO_KEY = "adc-geo";

export function ViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const payload: { path: string; lat?: number; lng?: number } = { path: pathname };

    // Include precise coords only if the visitor opted in (stored locally).
    try {
      const stored = localStorage.getItem(GEO_KEY);
      if (stored) {
        const { lat, lng } = JSON.parse(stored);
        if (typeof lat === "number" && typeof lng === "number") {
          payload.lat = lat;
          payload.lng = lng;
        }
      }
    } catch {}

    const body = JSON.stringify(payload);

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/views", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
