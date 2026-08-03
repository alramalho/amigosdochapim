import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const metadata: Metadata = {
  title: "Candidaturas Encerradas | Amigos do Chapim",
  description: "As candidaturas ao Concurso de Curtas-Metragens de 2026 encerraram a 30 de julho.",
};

export default function CandidatarPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border py-4 md:py-6">
        <div className="mx-auto max-w-4xl px-4">
          <Link href="/" className="text-sm text-foreground/60 transition-colors hover:text-foreground">
            ← Voltar à página principal
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-14 md:py-24">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-primary">
          Concurso de Curtas-Metragens 2026
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          As candidaturas estão encerradas.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/75">
          A fase de candidatura terminou a 30 de julho de 2026. Obrigado a todas as pessoas que
          partilharam os seus projetos connosco. Estamos agora a avaliar as propostas recebidas.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-border p-6">
            <h2 className="text-xl font-semibold">Já submeteste uma candidatura?</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              Entra no painel para consultar a candidatura e acompanhar os próximos passos do concurso.
            </p>
            <Link
              href="/painel/candidatura"
              className="mt-5 inline-flex rounded-sm border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent/30"
            >
              Consultar candidatura →
            </Link>
          </div>
          <div className="rounded-sm border border-border p-6">
            <h2 className="text-xl font-semibold">Consultar esta edição</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              O calendário, os requisitos e o regulamento continuam disponíveis como referência.
            </p>
            <Link
              href="/o-que-deve-ser-entregue"
              className="mt-5 inline-flex text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
            >
              Ver informação do concurso →
            </Link>
          </div>
        </div>
      </section>

      <NewsletterSignup
        title="Recebe notícias sobre os próximos concursos"
        description="Deixa-nos o teu email para saberes quando surgirem novas oportunidades para jovens artistas."
        source="candidatar-closed"
        buttonLabel="Receber novidades"
      />
    </main>
  );
}
