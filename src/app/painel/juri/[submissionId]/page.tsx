"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Submission = {
  id: string;
  candidateName: string;
  age: number;
  email: string;
  phone: string;
  cvUrl: string | null;
  motivation: string;
  synopsis: string;
  plotPoints: string;
  scriptSummary: string;
  visualIdeas: string;
  externalLinks: string | null;
  files?: Array<{
    objectKey: string;
    publicUrl: string;
    fileName: string;
    purpose: "CV" | "FINAL_MATERIAL";
  }>;
  finalMaterials: null | {
    materialList: string;
    budgetPlan: string;
    productionCalendar: string;
    externalLinks: string | null;
  };
  juryReviews: Array<Record<string, unknown>>;
};

const criteria = [
  ["artisticQuality", "Qualidade artística"],
  ["originality", "Originalidade"],
  ["argumentClarity", "Clareza e estrutura do argumento"],
  ["aestheticVision", "Visão estética"],
  ["budgetViability", "Viabilidade orçamental"],
  ["motivation", "Motivação do candidato"],
] as const;

export default function JurySubmissionPage() {
  const params = useParams<{ submissionId: string }>();
  const submissionId = params.submissionId;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) return;
    fetch("/api/jury/submissions")
      .then((response) => response.json())
      .then((data) => {
        const item = data.submissions?.find((submission: Submission) => submission.id === submissionId);
        setSubmission(item || null);
        const review = item?.juryReviews?.[0] as Record<string, unknown> | undefined;
        if (review) {
          setScores(Object.fromEntries(criteria.map(([key]) => [key, String(review[key] || "")])));
          setNotes(String(review.notes || ""));
        }
      });
  }, [submissionId]);

  const save = async () => {
    if (!submissionId) return;
    const response = await fetch(`/api/jury/reviews/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...scores, notes }),
    });
    setMessage(response.ok ? "Avaliação guardada." : "Não foi possível guardar a avaliação.");
  };

  if (!submission) {
    return <main className="min-h-screen flex items-center justify-center">A carregar candidatura...</main>;
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <Link href="/painel/juri" className="text-sm text-foreground/60 hover:text-foreground">
            ← Área do júri
          </Link>
          <span className="text-sm text-foreground/50">{submission.email}</span>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <article className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-semibold mb-3">{submission.candidateName}</h1>
              <p className="text-foreground/60">
                {submission.age} anos · {submission.phone}
              </p>
            </div>

            <Section title="Sinopse" content={submission.synopsis} />
            <Section title="Plot points principais" content={submission.plotPoints} />
            <Section title="Argumento resumido" content={submission.scriptSummary} />
            <Section title="Ideias visuais" content={submission.visualIdeas} />
            <Section title="Motivação" content={submission.motivation} />
            {submission.finalMaterials && (
              <section className="border border-border rounded-sm p-5">
                <h2 className="text-xl font-semibold mb-4">Plano de produção</h2>
                <Section title="Material" content={submission.finalMaterials.materialList} nested />
                <Section title="Orçamento" content={submission.finalMaterials.budgetPlan} nested />
                <Section title="Calendário" content={submission.finalMaterials.productionCalendar} nested />
              </section>
            )}
            {(submission.cvUrl || submission.externalLinks || submission.finalMaterials?.externalLinks || submission.files?.length) && (
              <section className="border border-border rounded-sm p-5">
                <h2 className="text-xl font-semibold mb-3">Links e ficheiros</h2>
                <div className="space-y-2 text-sm">
                  {submission.cvUrl && <ExternalLink href={submission.cvUrl}>CV</ExternalLink>}
                  {submission.files?.map((file) => (
                    <ExternalLink key={file.objectKey} href={file.publicUrl}>
                      {file.purpose === "CV" ? "CV" : "Ficheiro"} - {file.fileName}
                    </ExternalLink>
                  ))}
                  {submission.externalLinks && <p className="whitespace-pre-line text-foreground/70">{submission.externalLinks}</p>}
                  {submission.finalMaterials?.externalLinks && <p className="whitespace-pre-line text-foreground/70">{submission.finalMaterials.externalLinks}</p>}
                </div>
              </section>
            )}
          </article>

          <aside className="border border-border rounded-sm p-5 h-fit sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Avaliação</h2>
            <div className="space-y-4">
              {criteria.map(([key, label]) => (
                <label key={key} className="block">
                  <span className="block text-sm font-medium mb-2">{label}</span>
                  <select
                    value={scores[key] || ""}
                    onChange={(event) => setScores((current) => ({ ...current, [key]: event.target.value }))}
                    className="w-full border border-border rounded-sm px-3 py-2 bg-background"
                  >
                    <option value="">Sem nota</option>
                    <option value="1">1 - Fraco</option>
                    <option value="2">2</option>
                    <option value="3">3 - Sólido</option>
                    <option value="4">4</option>
                    <option value="5">5 - Excelente</option>
                  </select>
                </label>
              ))}
              <label className="block">
                <span className="block text-sm font-medium mb-2">Notas privadas</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={6}
                  className="w-full border border-border rounded-sm px-3 py-2 bg-background"
                />
              </label>
              {message && <p className="text-sm text-foreground/70">{message}</p>}
              <button onClick={save} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-sm">
                Guardar avaliação
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Section({ title, content, nested = false }: { title: string; content: string; nested?: boolean }) {
  return (
    <section className={nested ? "mb-4 last:mb-0" : "border border-border rounded-sm p-5"}>
      <h2 className={nested ? "font-semibold mb-2" : "text-xl font-semibold mb-3"}>{title}</h2>
      <p className="whitespace-pre-line text-foreground/75 leading-relaxed">{content}</p>
    </section>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block text-primary underline underline-offset-4">
      {children}
    </a>
  );
}
