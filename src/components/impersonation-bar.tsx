"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Target = {
  email: string;
  name: string | null;
  status: string | null;
  isTest: boolean;
  roles: string[];
};

type State = {
  realEmail: string;
  impersonatedEmail: string | null;
  isImpersonating: boolean;
  targets: Target[];
};

const roleLabels: Record<string, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "border-violet-300 bg-violet-100 text-violet-900" },
  EXTERNAL_JUROR: { label: "Júri externo", className: "border-sky-300 bg-sky-100 text-sky-900" },
  CANDIDATE: { label: "Candidato", className: "border-emerald-300 bg-emerald-100 text-emerald-900" },
  CONTRIBUTOR: { label: "Contribuidor", className: "border-amber-300 bg-amber-100 text-amber-900" },
};

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Recebida",
  IN_REVIEW: "Em análise",
  SELECTED_FOR_FINAL: "Selecionada para final",
  FINAL_MATERIALS_SUBMITTED: "Materiais finais recebidos",
  FINALIST: "Finalista",
  WINNER: "Vencedora",
  REJECTED: "Não selecionada",
};

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export function ImpersonationBar() {
  const [state, setState] = useState<State | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const headers = await authHeader();
      if (!headers.Authorization) return;

      const response = await fetch("/api/admin/impersonation", { headers }).catch(() => null);
      if (!response?.ok || !active) return;

      setState(await response.json());
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!state) return [];
    const term = query.trim().toLowerCase();
    if (!term) return state.targets;

    return state.targets.filter(
      (target) =>
        target.email.includes(term) || (target.name || "").toLowerCase().includes(term)
    );
  }, [state, query]);

  if (!state) return null;

  const start = async (email: string) => {
    setBusy(true);
    setError(null);

    const response = await fetch("/api/admin/impersonation", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Não foi possível personificar esta conta.");
      setBusy(false);
      return;
    }

    window.location.reload();
  };

  const stop = async () => {
    setBusy(true);
    setError(null);

    const response = await fetch("/api/admin/impersonation", {
      method: "DELETE",
      headers: await authHeader(),
    });

    if (!response.ok) {
      setError("Não foi possível terminar a personificação.");
      setBusy(false);
      return;
    }

    window.location.reload();
  };

  const active = state.isImpersonating;
  const activeTarget = state.targets.find((target) => target.email === state.impersonatedEmail);

  return (
    <div className="fixed bottom-4 right-4 z-[60] print:hidden">
      {open && (
        <div className="mb-2 w-[min(92vw,26rem)] max-h-[70vh] overflow-hidden flex flex-col rounded-sm border border-border bg-background shadow-lg">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Personificar utilizador</p>
            <p className="text-xs text-foreground/60 mt-1">
              Vês o site exatamente como esta pessoa. As páginas de administração ficam
              indisponíveis enquanto estiveres a personificar.
            </p>
          </div>

          <div className="px-4 py-3 border-b border-border">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Procurar por nome ou email"
              className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && (
            <p className="px-4 py-2 text-xs text-rose-700 bg-rose-50 border-b border-rose-200">
              {error}
            </p>
          )}

          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-sm text-foreground/60">Nenhum utilizador encontrado.</p>
            ) : (
              filtered.map((target) => {
                const isCurrent = target.email === state.impersonatedEmail;

                return (
                  <button
                    key={target.email}
                    type="button"
                    disabled={busy || isCurrent}
                    onClick={() => start(target.email)}
                    className="w-full text-left px-4 py-3 border-b border-border/60 hover:bg-accent/40 disabled:opacity-60 disabled:hover:bg-transparent"
                  >
                    <span className="block text-sm font-medium">
                      {target.name || target.email}
                      {target.isTest && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-foreground/50">
                          teste
                        </span>
                      )}
                    </span>
                    {target.name && (
                      <span className="block text-xs text-foreground/60">{target.email}</span>
                    )}
                    {target.roles.length > 0 && (
                      <span className="flex flex-wrap gap-1 mt-1.5">
                        {target.roles.map((role) => {
                          const meta = roleLabels[role];
                          if (!meta) return null;

                          return (
                            <span
                              key={role}
                              className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border ${meta.className}`}
                            >
                              {meta.label}
                            </span>
                          );
                        })}
                      </span>
                    )}
                    {target.status && (
                      <span className="block text-xs text-foreground/50 mt-1">
                        {statusLabels[target.status] || target.status}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <div
        className={`flex items-center gap-2 rounded-sm border shadow-lg px-3 py-2 ${
          active ? "border-amber-300 bg-amber-100 text-amber-950" : "border-border bg-background"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="text-sm font-medium"
        >
          {active
            ? `A ver como ${activeTarget?.name || state.impersonatedEmail}`
            : "Personificar"}
        </button>

        {active && (
          <button
            type="button"
            onClick={stop}
            disabled={busy}
            className="text-xs uppercase tracking-wide border border-amber-400 rounded-sm px-2 py-1 hover:bg-amber-200 disabled:opacity-50"
          >
            {busy ? "..." : "Terminar"}
          </button>
        )}
      </div>
    </div>
  );
}
