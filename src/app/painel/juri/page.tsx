"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Submission = {
  id: string;
  candidateName: string;
  status: string;
  synopsis: string;
  finalMaterials: null | { budgetPlan: string };
  juryReviews: unknown[];
};

export default function JuriPainelPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [ranking, setRanking] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => fetch("/api/jury/submissions", {
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    }))
      .then((response) => response.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setRanking(data.ranking?.orderedSubmissionIds || data.submissions?.map((submission: Submission) => submission.id) || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const move = (id: string, direction: -1 | 1) => {
    setRanking((current) => {
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  };

  const saveRanking = async (submit = false) => {
    setMessage(null);
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch("/api/jury/ranking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ orderedSubmissionIds: ranking, submit }),
    });
    setMessage(response.ok ? (submit ? "Ranking final submetido." : "Rascunho guardado.") : "Não foi possível guardar o ranking.");
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
          <Link href="/juri" className="text-sm text-foreground/60 hover:text-foreground">
            Como funciona o júri
          </Link>
        </header>

        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-semibold mb-3">Área do júri</h1>
          <p className="text-foreground/70 max-w-2xl">
            Revê as candidaturas finalistas, guarda notas por critério e ordena a tua preferência final.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section>
            <h2 className="text-xl font-semibold mb-4">Candidaturas para avaliação</h2>
            <div className="space-y-3">
              {submissions.map((submission) => (
                <Link
                  key={submission.id}
                  href={`/painel/juri/${submission.id}`}
                  className="block border border-border rounded-sm p-5 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{submission.candidateName}</h3>
                      <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{submission.synopsis}</p>
                    </div>
                    <span className="text-xs text-foreground/50 whitespace-nowrap">
                      {submission.juryReviews?.length ? "Revista" : "Por rever"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <aside className="border border-border rounded-sm p-5 h-fit">
            <h2 className="text-xl font-semibold mb-4">Ranking final</h2>
            <div className="space-y-2">
              {ranking.map((id, index) => {
                const submission = submissions.find((item) => item.id === id);
                if (!submission) return null;
                return (
                  <div key={id} className="flex items-center gap-3 border border-border rounded-sm p-3">
                    <span className="font-semibold w-6">{index + 1}</span>
                    <span className="text-sm flex-1">{submission.candidateName}</span>
                    <button onClick={() => move(id, -1)} className="text-xs text-foreground/60 hover:text-foreground">↑</button>
                    <button onClick={() => move(id, 1)} className="text-xs text-foreground/60 hover:text-foreground">↓</button>
                  </div>
                );
              })}
            </div>
            {message && <p className="text-sm text-foreground/70 mt-4">{message}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={() => saveRanking(false)} className="px-4 py-2 border border-border rounded-sm text-sm">
                Guardar
              </button>
              <button onClick={() => saveRanking(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm">
                Submeter
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
