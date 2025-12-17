"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileSpreadsheet, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

//note to self
// stripe + supabase finished locally. now was a matter of testing it out in prod in the Real Goncalos account (double check env vars)

interface UserData {
  name: string | null;
  subscription: {
    tier: "APOIANTE" | "AMIGO";
    currentPeriodEnd: string;
  } | null;
}

export default function PainelPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/entrar");
        return;
      }

      setUserEmail(session.user.email!);

      // Fetch user data from API
      const res = await fetch("/api/user/me", {
        headers: {
          "x-user-email": session.user.email!,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
      // If not ok (404), user exists in Supabase but not in our DB - that's fine, show no subscription state
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleManageSubscription = async () => {
    if (!userEmail) return;
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/70">A carregar...</p>
      </main>
    );
  }

  if (!user || !user.subscription) {
    return (
      <main className="min-h-screen flex flex-col px-4">
        <div className="max-w-4xl mx-auto w-full flex-1 py-12">
          <header className="flex justify-between items-center mb-12">
            <Link href="/">
              <img src="/logo.png" alt="Amigos do Chapim" className="h-10" />
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Sair
            </button>
          </header>

          <div className="text-center py-12 max-w-lg mx-auto">
            <h1 className="text-3xl font-semibold mb-4">
              Obrigado por te juntares!
            </h1>
            <p className="text-foreground/70 mb-8">
              Ainda não tens uma subscrição ativa. Torna-te Apoiante ou Amigo e ajuda-nos a democratizar o acesso à arte em Portugal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#precos"
                className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Ver planos
              </Link>
              <a
                href="mailto:geral@amigosdochapim.org"
                className="px-6 py-3 border border-foreground/20 rounded-lg font-medium hover:border-foreground/40 transition-colors"
              >
                Falar connosco
              </a>
            </div>
          </div>

          {/* Transparência - available to all */}
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Transparência</h2>
            <a
              href="https://docs.google.com/spreadsheets/d/1eKD3LuBVSBuWO2aAKzYMNsrtAU6dnwcImb7ELD-tDjw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-foreground/5 rounded-xl p-4 hover:bg-foreground/10 transition-colors"
            >
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium">Custos Operacionais</p>
                <p className="text-sm text-foreground/60">Ver folha de cálculo completa</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-foreground/40" />
            </a>
          </div>
        </div>

        <footer className="py-6 text-center text-sm text-foreground/50">
          <div className="flex justify-center gap-6">
            <Link href="/termos" className="hover:text-foreground transition-colors">
              Termos
            </Link>
            <Link href="/privacidade" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
            <a href="mailto:geral@amigosdochapim.org" className="hover:text-foreground transition-colors">
              Contacto
            </a>
          </div>
        </footer>
      </main>
    );
  }

  const isAmigo = user.subscription.tier === "AMIGO";

  return (
    <main className="min-h-screen flex flex-col px-4">
      <div className="max-w-4xl mx-auto w-full flex-1 py-12">
        <header className="flex justify-between items-center mb-12">
          <Link href="/">
            <img src="/logo.png" alt="Amigos do Chapim" className="h-10" />
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            Sair
          </button>
        </header>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">
            Olá, {user.name || "Amigo"}!
          </h1>
          <p className="text-foreground/70">
            Bem-vindo à tua área de membro. És um{" "}
            <span className="font-medium">
              {user.subscription.tier === "AMIGO" ? "Amigo" : "Apoiante"}
            </span>
            .
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscription Card */}
          <div className="bg-foreground/5 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">A tua subscrição</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-foreground/70">Plano:</span>{" "}
                {user.subscription.tier === "AMIGO" ? "Amigo (12€/mês)" : "Apoiante (8€/mês)"}
              </p>
              <p>
                <span className="text-foreground/70">Estado:</span>{" "}
                <span className="text-green-600">Ativo</span>
              </p>
              <p>
                <span className="text-foreground/70">Próxima renovação:</span>{" "}
                {new Date(user.subscription.currentPeriodEnd).toLocaleDateString("pt-PT")}
              </p>
            </div>
            <button
              onClick={handleManageSubscription}
              className="mt-4 text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Gerir subscrição →
            </button>
          </div>

          {/* Content Card */}
          {isAmigo && (
            <div className="bg-foreground/5 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Conteúdo exclusivo</h2>
              <p className="text-sm text-foreground/70 mb-4">
                Como Amigo, tens acesso a conteúdo exclusivo e podes participar
                como júri na seleção de projetos.
              </p>
              <Link
                href="/em-construcao"
                className="inline-block text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Ver conteúdo →
              </Link>
            </div>
          )}

          {/* Jury Card - Only for Amigos */}
          {isAmigo && (
            <div className="bg-foreground/5 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Júri</h2>
              <p className="text-sm text-foreground/70 mb-4">
                Participa na votação de projetos e ajuda a decidir quais
                iniciativas culturais receberão apoio.
              </p>
              <Link
                href="/em-construcao"
                className="inline-block text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Ver votações →
              </Link>
            </div>
          )}

          {/* Upgrade Card - Only for Apoiantes */}
          {!isAmigo && (
            <div className="bg-foreground/10 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Torna-te Amigo</h2>
              <p className="text-sm text-foreground/70 mb-4">
                Faz upgrade para Amigo e ganha acesso ao júri e conteúdo
                exclusivo por apenas mais 4€/mês.
              </p>
              <a
                href="/api/stripe/upgrade"
                className="inline-block px-4 py-2 bg-foreground text-background rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                Fazer upgrade
              </a>
            </div>
          )}
        </div>

        {/* Transparência - available to all */}
        <div className="mt-12">
          <h2 className="text-lg font-medium mb-4">Transparência</h2>
          <a
            href="https://docs.google.com/spreadsheets/d/1eKD3LuBVSBuWO2aAKzYMNsrtAU6dnwcImb7ELD-tDjw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-foreground/5 rounded-xl p-4 hover:bg-foreground/10 transition-colors"
          >
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium">Custos Operacionais</p>
              <p className="text-sm text-foreground/60">Ver folha de cálculo completa</p>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto text-foreground/40" />
          </a>
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-foreground/50">
        <div className="flex justify-center gap-6">
          <Link href="/termos" className="hover:text-foreground transition-colors">
            Termos
          </Link>
          <Link href="/privacidade" className="hover:text-foreground transition-colors">
            Privacidade
          </Link>
          <a href="mailto:geral@amigosdochapim.org" className="hover:text-foreground transition-colors">
            Contacto
          </a>
        </div>
      </footer>
    </main>
  );
}
