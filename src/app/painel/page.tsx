"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Edit3, ExternalLink, FileSpreadsheet, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getAdminEmails } from "@/lib/admin";

//note to self
// stripe + supabase finished locally. now was a matter of testing it out in prod in the Real Goncalos account (double check env vars)
// I was also amidst testing the email integration. I've changed the dns recrod sbut they say it might take up to 60mins... im not receiving emails

interface UserData {
  name: string | null;
  subscription: {
    tier: "APOIANTE" | "AMIGO";
    status: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "INCOMPLETE";
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    isActive: boolean;
  } | null;
  donations: {
    total: number;
    count: number;
  };
  contributions: {
    total: number;
    count: number;
  };
  hasJuryAccess: boolean;
  hasCreditsAccess: boolean;
}

export default function PainelPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);

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
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setNameDraft(userData.name || "");
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

  const saveName = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingName(true);
    setNameMessage(null);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/entrar");
      return;
    }

    const response = await fetch("/api/user/me", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: nameDraft }),
    });

    const data = await response.json().catch(() => ({}));
    setSavingName(false);

    if (!response.ok) {
      setNameMessage(data.error || "Não foi possível guardar o nome.");
      return;
    }

    setUser(data);
    setNameDraft(data.name || "");
    setEditingName(false);
    setNameMessage("Nome atualizado.");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/70">A carregar...</p>
      </main>
    );
  }

  // User not found in our DB (only exists in Supabase)
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col px-4">
        <div className="max-w-4xl mx-auto w-full flex-1 py-12">
          <header className="flex justify-between items-center mb-12">
            <Link href="/">
              <img src="/logo_v2.png" alt="Amigos do Chapim" className="h-10" />
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
              Bem-vindo ao teu painel
            </h1>
            <p className="text-foreground/70 mb-8">
              Não encontrámos contribuições associadas a este email. Podes submeter ou acompanhar uma candidatura, ou falar connosco se o teu acesso ao júri deveria aparecer aqui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/painel/candidatura"
                className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Ver candidatura
              </Link>
              <a
                href={`mailto:geral@amigosdochapim.org?subject=Acesso ao painel&body=Email: ${encodeURIComponent(userEmail || "")}`}
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

  const hasSubscription = !!user.subscription;
  const activeSubscription = user.subscription?.isActive;
  const isAdmin = !!userEmail && getAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS).includes(userEmail.toLowerCase());

  // Determine user tier for display purposes
  const getUserTier = () => {
    if (user.hasCreditsAccess) return "Patrocinador";
    if (user.hasJuryAccess) return "Amigo";
    if (activeSubscription || user.contributions.total > 0) return "Apoiante";
    return "Membro";
  };

  return (
    <main className="min-h-screen flex flex-col px-4">
      <div className="max-w-4xl mx-auto w-full flex-1 py-12">
        <header className="flex justify-between items-center mb-12">
          <Link href="/">
            <img src="/logo_v2.png" alt="Amigos do Chapim" className="h-10" />
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
          <div className="mb-1">
            {editingName ? (
              <form onSubmit={saveName} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="sr-only" htmlFor="member-name">
                  Nome
                </label>
                <input
                  id="member-name"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  maxLength={80}
                  placeholder="O teu nome"
                  className="w-full sm:max-w-sm border border-border rounded-sm bg-background px-3 py-2 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingName}
                    className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNameDraft(user.name || "");
                      setEditingName(false);
                      setNameMessage(null);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-3 py-2 text-sm text-foreground/70"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-semibold">
                  Olá, {user.name || "Amigo"}!
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setEditingName(true);
                    setNameMessage(null);
                  }}
                  aria-label="Alterar nome"
                  title="Alterar nome"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-foreground/50 mb-2">{userEmail}</p>
          {nameMessage && <p className="text-sm text-foreground/60 mb-2">{nameMessage}</p>}
          <p className="text-foreground/70">
            Bem-vindo à tua área de membro. És um{" "}
            <span className="font-medium">{getUserTier()}</span>.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscription Card - Only if has subscription */}
          {hasSubscription && (
            <div className="bg-foreground/5 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">A tua subscrição</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-foreground/70">Plano:</span>{" "}
                  {user.subscription!.tier === "AMIGO" ? "Amigo (12€/mês)" : "Apoiante (8€/mês)"}
                </p>
                <p>
                  <span className="text-foreground/70">Estado:</span>{" "}
                  <span className={subscriptionStatusClass(user.subscription!)}>
                    {subscriptionStatusLabel(user.subscription!)}
                  </span>
                </p>
                <p>
                  <span className="text-foreground/70">
                    {user.subscription!.isActive && !user.subscription!.cancelAtPeriodEnd
                      ? "Próxima renovação:"
                      : "Termina em:"}
                  </span>{" "}
                  {new Date(user.subscription!.currentPeriodEnd).toLocaleDateString("pt-PT")}
                </p>
              </div>
              <button
                onClick={handleManageSubscription}
                className="mt-4 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Gerir subscrição →
              </button>
            </div>
          )}

          {/* Contributions Card */}
          <div className="bg-foreground/5 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">As tuas contribuições</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-foreground/70">Total contribuído:</span>{" "}
                <span className="font-medium">{user.contributions.total}€</span>
              </p>
              {user.hasJuryAccess && (
                <p className="text-green-600 font-medium mt-2">
                  ✓ Tens acesso ao júri
                </p>
              )}
              {!user.hasJuryAccess && (
                <p className="text-foreground/60 mt-2">
                  Faltam {(25 - user.contributions.total).toFixed(0)}€ para acesso ao júri
                </p>
              )}
              {user.hasCreditsAccess && (
                <p className="text-green-600 font-medium">
                  ✓ Apareces nos créditos
                </p>
              )}
              {!user.hasCreditsAccess && user.hasJuryAccess && (
                <p className="text-foreground/60">
                  Faltam {(45 - user.contributions.total).toFixed(0)}€ para aparecer nos créditos
                </p>
              )}
            </div>
          </div>

          {/* Jury Card - For users with jury access */}
          {user.hasJuryAccess && (
            <div className="bg-foreground/5 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Júri</h2>
              <p className="text-sm text-foreground/70 mb-4">
                Participa na votação de projetos e ajuda a decidir quais
                iniciativas culturais receberão apoio.
              </p>
              <Link
                href="/painel/juri"
                className="inline-block text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Ver candidaturas →
              </Link>
            </div>
          )}

          {/* Candidate Card - Jury members cannot submit */}
          {!user.hasJuryAccess && (
            <div className="bg-foreground/5 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Candidatura</h2>
              <p className="text-sm text-foreground/70 mb-4">
                Submete ou acompanha a tua candidatura ao concurso de curtas-metragens de 2026.
              </p>
              <Link
                href="/painel/candidatura"
                className="inline-block text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Ver candidatura →
              </Link>
            </div>
          )}

          {/* Admin Card */}
          {isAdmin && (
            <div className="bg-foreground/5 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Admin</h2>
              <p className="text-sm text-foreground/70 mb-4">
                Gere candidaturas, finalistas e estados do concurso.
              </p>
              <Link
                href="/admin/candidaturas"
                className="inline-block text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Gerir candidaturas →
              </Link>
            </div>
          )}

          {/* Upgrade Card - For users without jury access */}
          {!user.hasJuryAccess && (
            <div className="bg-foreground/10 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Desbloqueia o acesso ao júri</h2>
              <p className="text-sm text-foreground/70 mb-4">
                Subscreve o plano Amigo (12€/mês) ou faz uma doação única de 25€ ou mais
                para aceder às candidaturas e participar na votação do júri.
              </p>
              <Link
                href="/#como-ajudar"
                className="inline-block px-4 py-2 bg-foreground text-background rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                Contribuir
              </Link>
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

function subscriptionStatusLabel(subscription: NonNullable<UserData["subscription"]>) {
  if (subscription.status === "ACTIVE" && subscription.cancelAtPeriodEnd) {
    return "Ativa até ao fim do período";
  }

  if (subscription.status === "ACTIVE" && subscription.isActive) {
    return "Ativa";
  }

  const labels: Record<NonNullable<UserData["subscription"]>["status"], string> = {
    ACTIVE: "Expirada",
    CANCELLED: "Cancelada",
    PAST_DUE: "Pagamento em atraso",
    INCOMPLETE: "Incompleta",
  };

  return labels[subscription.status];
}

function subscriptionStatusClass(subscription: NonNullable<UserData["subscription"]>) {
  if (subscription.status === "ACTIVE" && subscription.isActive) {
    return subscription.cancelAtPeriodEnd ? "text-amber-700" : "text-green-600";
  }

  if (subscription.status === "PAST_DUE") {
    return "text-amber-700";
  }

  return "text-red-600";
}
