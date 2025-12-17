"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/painel");
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/70">A verificar...</p>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/painel`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-4">Verifica o teu email</h1>
          <p className="text-foreground/70 mb-6">
            Enviámos um link para <strong>{email}</strong>. Clica no link para
            aceder à tua área de membro.
          </p>
          <p className="text-sm text-foreground/50">
            Não recebeste o email? Verifica a pasta de spam.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <img src="/logo.png" alt="Amigos do Chapim" className="h-12" />
        </Link>

        <div className="border border-border rounded-xl p-8">
          <h1 className="text-2xl font-semibold text-center mb-2">Entrar</h1>
          <p className="text-foreground/70 text-center mb-6">
            Introduz o email associado à tua subscrição
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="o.teu@email.com"
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:opacity-60"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "A enviar..." : "Enviar link de acesso"}
            </button>
          </form>

          <p className="text-sm text-foreground/50 text-center mt-6">
            Ainda não és membro?{" "}
            <Link href="/#precos" className="text-foreground hover:underline">
              Subscreve aqui
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
