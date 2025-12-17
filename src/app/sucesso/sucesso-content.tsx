"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function SucessoContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setEmail(data.email);
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [sessionId]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p>A verificar pagamento...</p>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-semibold mb-4">Algo correu mal</h1>
          <p className="text-foreground/70 mb-6">
            Não foi possível verificar o seu pagamento. Por favor, contacte-nos se o problema persistir.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold mb-4">
          Bem-vindo aos Amigos do Chapim!
        </h1>

        <p className="text-foreground/70 mb-6">
          O seu pagamento foi processado com sucesso. Enviámos um email para{" "}
          <strong>{email}</strong> com um link para aceder à sua área de membro.
        </p>

        <p className="text-sm text-foreground/50 mb-8">
          Verifique também a pasta de spam se não encontrar o email.
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
