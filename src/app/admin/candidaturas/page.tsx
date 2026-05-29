"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/submissions")
      .then((response) => response.json())
      .then((data) => setSubmissions(data.submissions || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (submissionId: string, status: string) => {
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, status }),
    });
    load();
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center">A carregar candidaturas...</main>;
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <Link href="/painel" className="text-sm text-foreground/60 hover:text-foreground">
            ← Painel
          </Link>
          <Link href="/candidatar" className="text-sm text-foreground/60 hover:text-foreground">
            Nova candidatura
          </Link>
        </header>

        <h1 className="text-3xl md:text-5xl font-semibold mb-3">Gestão de candidaturas</h1>
        <p className="text-foreground/70 mb-4 max-w-3xl">
          Esta vista está disponível para admins durante todo o concurso. Os estados ajudam a acompanhar
          internamente a fase de cada candidatura e controlam quando certos materiais ficam visíveis ou disponíveis.
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
              </div>
              <label className="block">
                <span className="block text-xs uppercase tracking-wide text-foreground/50 mb-2">Estado</span>
                <select
                  value={submission.status}
                  onChange={(event) => updateStatus(submission.id, event.target.value)}
                  className="w-full border border-border rounded-sm px-3 py-2 bg-background text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {statusMeta[status].label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-foreground/50">
                  {statusMeta[submission.status]?.description || "Estado interno da candidatura."}
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
