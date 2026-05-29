"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminEmails } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

type Submission = {
  id: string;
  candidateName: string;
  age: number;
  email: string;
  phone: string;
  status: string;
  residentInPortugal: boolean;
  cvUrl: string | null;
  motivation: string;
  synopsis: string;
  plotPoints: string;
  scriptSummary: string;
  visualIdeas: string;
  externalLinks: string | null;
  createdAt: string;
  updatedAt: string;
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

export default function AdminCandidaturaDetailPage() {
  const params = useParams<{ submissionId: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function loadSubmission() {
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
      const response = await fetch(`/api/admin/submissions/${params.submissionId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmission(data.submission || null);
      }

      setLoading(false);
    }

    loadSubmission();
  }, [params.submissionId, router]);

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center">A carregar candidatura...</main>;
  }

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">Sem autorização</p>
          <h1 className="text-3xl font-semibold mb-4">Não tens acesso a esta página.</h1>
          <Link href="/painel" className="inline-flex px-5 py-3 border border-border rounded-sm hover:bg-accent/30">
            Voltar ao painel
          </Link>
        </div>
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold mb-4">Candidatura não encontrada.</h1>
          <Link href="/admin/candidaturas" className="inline-flex px-5 py-3 border border-border rounded-sm hover:bg-accent/30">
            Voltar à gestão
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <Link href="/admin/candidaturas" className="text-sm text-foreground/60 hover:text-foreground">
            ← Candidaturas
          </Link>
          <span className="text-sm text-foreground/50">{statusLabels[submission.status] || submission.status}</span>
        </header>

        <article className="space-y-6">
          <section className="border border-border rounded-sm p-5">
            <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">Candidatura</p>
            <h1 className="text-3xl md:text-5xl font-semibold mb-3">{submission.candidateName}</h1>
            <div className="grid gap-2 text-sm text-foreground/65 sm:grid-cols-2">
              <p>Email: {submission.email}</p>
              <p>Telefone: {submission.phone}</p>
              <p>Idade: {submission.age}</p>
              <p>Residência em Portugal: {submission.residentInPortugal ? "Sim" : "Não"}</p>
              <p>Submetida: {formatDate(submission.createdAt)}</p>
              <p>Atualizada: {formatDate(submission.updatedAt)}</p>
            </div>
          </section>

          <Section title="Carta de motivação" content={submission.motivation} />
          <Section title="Sinopse" content={submission.synopsis} />
          <Section title="Plot points principais" content={submission.plotPoints} />
          <Section title="Argumento resumido" content={submission.scriptSummary} />
          <Section title="Ideias visuais pretendidas" content={submission.visualIdeas} />

          {submission.finalMaterials && (
            <section className="border border-border rounded-sm p-5">
              <h2 className="text-xl font-semibold mb-4">Materiais finais</h2>
              <Section title="Lista de material" content={submission.finalMaterials.materialList} nested />
              <Section title="Plano de orçamento" content={submission.finalMaterials.budgetPlan} nested />
              <Section title="Calendário de produção" content={submission.finalMaterials.productionCalendar} nested />
            </section>
          )}

          {(submission.cvUrl || submission.externalLinks || submission.finalMaterials?.externalLinks || submission.files?.length) && (
            <section className="border border-border rounded-sm p-5">
              <h2 className="text-xl font-semibold mb-3">Links e ficheiros</h2>
              <div className="space-y-2 text-sm">
                {submission.cvUrl && <ExternalLink href={submission.cvUrl}>Link para CV</ExternalLink>}
                {submission.files?.map((file) => (
                  <ExternalLink key={file.objectKey} href={file.publicUrl}>
                    {file.purpose === "CV" ? "CV" : "Ficheiro"} - {file.fileName}
                  </ExternalLink>
                ))}
                {submission.externalLinks && <p className="whitespace-pre-line text-foreground/70">{submission.externalLinks}</p>}
                {submission.finalMaterials?.externalLinks && (
                  <p className="whitespace-pre-line text-foreground/70">{submission.finalMaterials.externalLinks}</p>
                )}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
