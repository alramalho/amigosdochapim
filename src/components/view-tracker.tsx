"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const body = JSON.stringify({ path: pathname });

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
