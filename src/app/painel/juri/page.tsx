"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isJuryRankingSubmissionStatus } from "@/lib/contest";

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
        const nextSubmissions = (data.submissions || []) as Submission[];
        const eligibleIds = nextSubmissions
          .filter((submission) => isJuryRankingSubmissionStatus(submission.status))
          .map((submission) => submission.id);
        const savedIds = Array.isArray(data.ranking?.orderedSubmissionIds)
          ? data.ranking.orderedSubmissionIds.filter((id: string) => eligibleIds.includes(id))
          : [];

        setSubmissions(nextSubmissions);
        setRanking([...savedIds, ...eligibleIds.filter((id) => !savedIds.includes(id))]);
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

  const incompleteCount = submissions.filter((submission) => !submission.finalMaterials).length;

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
            Revê as candidaturas submetidas e guarda notas por critério. O ranking final abre apenas para os projetos que concluírem a segunda fase.
          </p>
        </div>

        {incompleteCount > 0 && (
          <div className="mb-8 border border-amber-300 bg-amber-50 text-amber-950 rounded-sm p-5">
            <h2 className="font-semibold mb-2">Atenção: os materiais ainda não estão completos</h2>
            <p className="text-sm leading-relaxed">
              Estás a consultar as candidaturas iniciais. {incompleteCount === 1
                ? "Há 1 candidatura que ainda não entregou"
                : `Há ${incompleteCount} candidaturas que ainda não entregaram`} o plano de produção da segunda fase. Esta área será atualizada automaticamente à medida que esses materiais forem submetidos.
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section>
            <h2 className="text-xl font-semibold mb-4">Candidaturas para avaliação</h2>
            {submissions.length === 0 ? (
              <div className="border border-border bg-accent/20 rounded-sm p-6">
                <h3 className="font-semibold mb-2">Ainda não há candidaturas submetidas.</h3>
                <p className="text-sm text-foreground/70">
                  As candidaturas aparecerão aqui assim que forem recebidas pela organização.
                </p>
              </div>
            ) : (
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
                      <div className="text-right whitespace-nowrap">
                        <span className="block text-xs text-foreground/50">
                          {submission.juryReviews?.length ? "Revista" : "Por rever"}
                        </span>
                        <span className={`block text-xs mt-1 ${submission.finalMaterials ? "text-emerald-700" : "text-amber-700"}`}>
                          {submission.finalMaterials ? "2.ª fase recebida" : "2.ª fase por entregar"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <aside className="border border-border rounded-sm p-5 h-fit">
            <h2 className="text-xl font-semibold mb-4">Ranking final</h2>
            {ranking.length === 0 ? (
              <p className="text-sm text-foreground/70">
                O ranking abre quando existirem candidaturas com a segunda fase submetida.
              </p>
            ) : (
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
            )}
            {message && <p className="text-sm text-foreground/70 mt-4">{message}</p>}
            <div className="flex gap-3 mt-5">
              <button disabled={ranking.length === 0} onClick={() => saveRanking(false)} className="px-4 py-2 border border-border rounded-sm text-sm disabled:opacity-50">
                Guardar
              </button>
              <button disabled={ranking.length === 0} onClick={() => saveRanking(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm disabled:opacity-50">
                Submeter
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
