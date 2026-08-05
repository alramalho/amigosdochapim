"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getAdminEmails } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

type Submission = {
  id: string;
  candidateName: string;
  email: string;
  status: string;
  synopsis: string;
  finalMaterials: unknown | null;
  files?: unknown[];
  juryReviews: unknown[];
};

type StatusToast = {
  type: "success" | "error";
  message: string;
};

const statuses = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "SELECTED_FOR_FINAL",
  "FINAL_MATERIALS_SUBMITTED",
  "FINALIST",
  "WINNER",
  "REJECTED",
];

const statusMeta: Record<string, { label: string; description: string; className: string }> = {
  DRAFT: {
    label: "Rascunho",
    description: "Ainda não deve ser considerada para avaliação.",
    className: "border-stone-200 bg-stone-100/60 text-stone-700",
  },
  SUBMITTED: {
    label: "Recebida",
    description: "Candidatura submetida e pronta para triagem.",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  IN_REVIEW: {
    label: "Em análise",
    description: "A equipa está a rever a candidatura.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  SELECTED_FOR_FINAL: {
    label: "Selecionada para final",
    description: "O candidato pode entregar os materiais finais.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  FINAL_MATERIALS_SUBMITTED: {
    label: "Materiais finais recebidos",
    description: "Entrega final recebida e disponível para avaliação.",
    className: "border-teal-200 bg-teal-50 text-teal-800",
  },
  FINALIST: {
    label: "Finalista",
    description: "Candidatura confirmada como finalista.",
    className: "border-violet-200 bg-violet-50 text-violet-800",
  },
  WINNER: {
    label: "Vencedora",
    description: "Projeto vencedor do concurso.",
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
  },
  REJECTED: {
    label: "Não selecionada",
    description: "Candidatura fora da fase seguinte.",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export default function AdminCandidaturasPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [excludedCount, setExcludedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [updatingSubmissionIds, setUpdatingSubmissionIds] = useState<string[]>([]);
  const [statusToast, setStatusToast] = useState<StatusToast | null>(null);
  const toastTimer = useRef<number | null>(null);

  const load = (token: string) => {
    return fetch("/api/admin/submissions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setExcludedCount(data.excludedCount || 0);
      });
  };

  useEffect(() => {
    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/entrar");
        return;
      }

      const email = session.user.email?.toLowerCase();
      const isAdmin = !!email && getAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS).includes(email);

      if (!isAdmin) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);
      setAccessToken(session.access_token);
      await load(session.access_token)
        .catch(() => {
          setAuthorized(false);
        })
      .finally(() => setLoading(false));
    }

    checkAccess();
  }, [router]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showStatusToast = (toast: StatusToast) => {
    setStatusToast(toast);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setStatusToast(null), 3500);
  };

  const updateStatus = async (submissionId: string, status: string) => {
    if (!accessToken) return;

    setUpdatingSubmissionIds((current) => [...current, submissionId]);

    try {
      const response = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionId, status }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.submission) {
        throw new Error(data.error || "Não foi possível atualizar o estado.");
      }

      setSubmissions((current) => current.map((submission) =>
        submission.id === submissionId ? data.submission : submission
      ));
      showStatusToast({
        type: "success",
        message: `Estado atualizado para “${statusMeta[status]?.label || status}”.`,
      });
    } catch (error) {
      showStatusToast({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível atualizar o estado.",
      });
    } finally {
      setUpdatingSubmissionIds((current) => current.filter((id) => id !== submissionId));
    }
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center">A carregar candidaturas...</main>;
  }

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">Sem autorização</p>
          <h1 className="text-3xl font-semibold mb-4">Não tens acesso a esta página.</h1>
          <p className="text-foreground/70 mb-6">
            Esta área é reservada aos administradores dos Amigos do Chapim.
          </p>
          <Link href="/painel" className="inline-flex px-5 py-3 border border-border rounded-sm hover:bg-accent/30">
            Voltar ao painel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10">
      {statusToast && (
        <div
          role={statusToast.type === "error" ? "alert" : "status"}
          aria-live={statusToast.type === "error" ? "assertive" : "polite"}
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-sm border px-4 py-3 text-sm shadow-lg ${
            statusToast.type === "error"
              ? "border-rose-300 bg-rose-50 text-rose-900"
              : "border-emerald-300 bg-emerald-50 text-emerald-900"
          }`}
        >
          {statusToast.message}
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <Link href="/painel" className="text-sm text-foreground/60 hover:text-foreground">
            ← Painel
          </Link>
          <Link href="/admin/comunicacoes" className="text-sm text-foreground/60 hover:text-foreground">
            Comunicações
          </Link>
        </header>

        <h1 className="text-3xl md:text-5xl font-semibold mb-3">Gestão de candidaturas</h1>
        <p className="text-foreground/70 mb-4 max-w-3xl">
          Esta vista está disponível para admins durante todo o concurso. Os estados ajudam a acompanhar
          internamente a fase de cada candidatura e controlam quando certos materiais ficam visíveis ou disponíveis.
        </p>
        <p className="text-sm text-foreground/55 mb-4">
          Excluídas: {excludedCount} candidaturas de teste/admin.
        </p>

        <div className="mb-8 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </div>

        <div className="border border-border rounded-sm overflow-hidden bg-background">
          {submissions.map((submission, index) => (
            <div
              key={submission.id}
              className={`grid gap-4 md:grid-cols-[1fr_220px_260px] p-5 ${index > 0 ? "border-t border-border" : ""}`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{submission.candidateName}</h2>
                  <StatusPill status={submission.status} />
                </div>
                <p className="text-sm text-foreground/50">{submission.email}</p>
                <p className="text-sm text-foreground/70 mt-2">{submission.synopsis}</p>
              </div>
              <div className="text-sm text-foreground/60">
                <p>{submission.finalMaterials ? "Entrega final recebida" : "Sem entrega final"}</p>
                <p>{submission.files?.length || 0} ficheiros</p>
                <p>{submission.juryReviews?.length || 0} avaliações</p>
                <Link
                  href={`/admin/candidaturas/${submission.id}`}
                  className="mt-3 inline-block text-primary underline underline-offset-4 hover:no-underline"
                >
                  Ver candidatura completa →
                </Link>
              </div>
              <label className="block">
                <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-foreground/50 mb-2">
                  Estado
                  {updatingSubmissionIds.includes(submission.id) && (
                    <span
                      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-foreground/25 border-t-foreground"
                      role="status"
                      aria-label="A guardar estado"
                    />
                  )}
                </span>
                <select
                  value={submission.status}
                  onChange={(event) => updateStatus(submission.id, event.target.value)}
                  disabled={updatingSubmissionIds.includes(submission.id)}
                  aria-busy={updatingSubmissionIds.includes(submission.id)}
                  className="w-full border border-border rounded-sm px-3 py-2 bg-background text-sm disabled:cursor-wait disabled:opacity-60"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {statusMeta[status].label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-foreground/50" aria-live="polite">
                  {updatingSubmissionIds.includes(submission.id)
                    ? "A guardar alteração..."
                    : statusMeta[submission.status]?.description || "Estado interno da candidatura."}
                </p>
              </label>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const meta = statusMeta[status] || {
    label: status,
    description: "Estado interno da candidatura.",
    className: "border-border bg-accent/30 text-foreground/70",
  };

  return (
    <span
      title={meta.description}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium leading-none ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
