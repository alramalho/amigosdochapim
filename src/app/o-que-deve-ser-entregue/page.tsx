import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O Que Deve Ser Entregue | Amigos do Chapim",
  description: "Descobre o que precisas de entregar para te candidatares ao financiamento dos Amigos do Chapim.",
};

const calendario = [
  ["Candidatura inicial", "15 maio - 30 junho 2026"],
  ["Avaliação da candidatura inicial", "1 - 15 julho 2026"],
  ["Entrega dos requisitos da fase final", "16 - 31 julho 2026"],
  ["Entrevista online com o júri", "1 - 15 agosto 2026"],
  ["Seleção da curta vencedora", "16 - 31 agosto 2026"],
  ["Produção da curta", "1 setembro - 15 dezembro 2026"],
];

export default function OQueDeveSerEntreguePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border py-4 md:py-6">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm md:text-base text-foreground/60 hover:text-foreground transition-colors"
          >
            ← Voltar à página principal
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-8 pb-8 md:pt-16 md:pb-12">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold mb-4 md:mb-6 tracking-tight">
          O que deve ser entregue
        </h1>
        <p className="text-base md:text-xl text-foreground/80 leading-relaxed">
          O concurso tem duas fases. A primeira candidatura apresenta o candidato
          e a proposta artística; só os candidatos selecionados avançam para a
          entrega complementar da fase final.
        </p>
      </section>

      {/* Fase 1 */}
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">
            15 maio - 30 junho 2026
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold">Candidatura inicial</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-border p-6 md:p-8 rounded-sm">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">Dados do candidato</h3>
            <ul className="space-y-2 text-sm md:text-base text-foreground/80">
              <li>Nome</li>
              <li>Idade</li>
              <li>Email</li>
              <li>Contacto telefónico</li>
              <li>CV</li>
              <li>Carta de motivação de 1 a 2 páginas</li>
            </ul>
          </div>

          <div className="border border-border p-6 md:p-8 rounded-sm">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">Componente artística</h3>
            <p className="text-sm md:text-base text-foreground/70 mb-4">
              Documento PDF com os seguintes elementos:
            </p>
            <ul className="space-y-2 text-sm md:text-base text-foreground/80">
              <li>Sinopse</li>
              <li>Plot points principais</li>
              <li>Argumento resumido</li>
              <li>Descrição das ideias visuais pretendidas</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Fase 2 */}
      <section className="bg-accent/30 py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">
              16 - 31 julho 2026
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold">Entrega dos requisitos da fase final</h2>
          </div>

          <div className="border border-border bg-background p-6 md:p-8 rounded-sm">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">Plano de produção detalhado</h3>
            <p className="text-sm md:text-base text-foreground/70 mb-4">
              Esta entrega é pedida apenas aos candidatos selecionados após a
              candidatura inicial.
            </p>
            <ul className="space-y-2 text-sm md:text-base text-foreground/80">
              <li>Listagem do material a utilizar</li>
              <li>Orçamento de utilização do prémio de 1000€</li>
              <li>Calendário de produção</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Calendário */}
      <section className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Calendário do concurso</h2>
        <div className="border border-border rounded-sm overflow-hidden">
          {calendario.map(([etapa, periodo], index) => (
            <div
              key={etapa}
              className={`grid gap-1 md:grid-cols-[1fr_auto] px-4 py-4 md:px-6 ${
                index > 0 ? "border-t border-border" : ""
              }`}
            >
              <span className="font-medium text-sm md:text-base">{etapa}</span>
              <span className="text-sm md:text-base text-foreground/70">{periodo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent/30 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">Como é feita a escolha?</h2>
          <p className="text-base md:text-lg text-foreground/80 mb-6 md:mb-8">
            Descobre como o júri avalia as candidaturas e como funciona a votação final.
          </p>
          <Link
            href="/juri"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-3 rounded-sm text-sm md:text-base font-medium hover:opacity-90 transition-opacity"
          >
            Como funciona o júri →
          </Link>
          <div className="mt-5">
            <Link
              href="/regulamento-concurso-curtas-2026.docx"
              className="text-primary underline underline-offset-4 hover:no-underline text-sm md:text-base"
            >
              Consultar regulamento completo →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link
            href="/"
            className="text-sm md:text-base text-foreground/60 hover:text-foreground transition-colors"
          >
            ← Voltar à página principal
          </Link>
        </div>
      </footer>
    </div>
  );
}
