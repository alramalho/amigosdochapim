"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-foreground/20 mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-4">Algo correu mal</h2>
        <p className="text-foreground/70 mb-8">
          Ocorreu um erro inesperado. Por favor, tenta novamente.
        </p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
