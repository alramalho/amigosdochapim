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
  "SUBMITTED",
  "IN_REVIEW",
  "SELECTED_FOR_FINAL",
  "FINAL_MATERIALS_SUBMITTED",
  "FINALIST",
  "WINNER",
  "REJECTED",
];

const statusLabels: Record<string, string> = {
  SUBMITTED: "Submetida",
  IN_REVIEW: "Em avaliação",
  SELECTED_FOR_FINAL: "Selecionada para fase final",
  FINAL_MATERIALS_SUBMITTED: "Entrega final submetida",
  FINALIST: "Finalista",
  WINNER: "Vencedora",
  REJECTED: "Não selecionada",
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
        <p className="text-foreground/70 mb-8">
          Acompanha submissões, marca finalistas e controla o estado usado pela área do júri.
        </p>

        <div className="border border-border rounded-sm overflow-hidden">
          {submissions.map((submission, index) => (
            <div
              key={submission.id}
              className={`grid gap-4 md:grid-cols-[1fr_220px_260px] p-5 ${index > 0 ? "border-t border-border" : ""}`}
            >
              <div>
                <h2 className="font-semibold">{submission.candidateName}</h2>
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
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
