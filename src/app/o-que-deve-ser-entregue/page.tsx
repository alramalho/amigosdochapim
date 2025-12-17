import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O Que Deve Ser Entregue | Amigos do Chapim",
  description: "Descobre o que precisas de entregar para te candidatares ao financiamento dos Amigos do Chapim.",
};

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
          Para te candidatares ao financiamento dos Amigos do Chapim, precisas de preparar os seguintes materiais.
        </p>
      </section>

      {/* Dados do Candidato */}
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="border border-border p-6 md:p-8 rounded-sm">
          <div className="flex items-start gap-3 md:gap-4 mb-4">
            <div className="bg-primary text-primary-foreground w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm md:text-base">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Dados do candidato</h2>
              <ul className="space-y-2 text-sm md:text-base text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Nome</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Idade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Pequena motivação (um texto breve explicando o porquê de te candidatares)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Componente Artística */}
      <section className="bg-accent/30 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="border border-border bg-background p-6 md:p-8 rounded-sm">
            <div className="flex items-start gap-3 md:gap-4 mb-4">
              <div className="bg-primary text-primary-foreground w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm md:text-base">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">Componente artística</h2>
                <p className="text-sm md:text-base text-foreground/70 mb-4">
                  Documento PDF com os seguintes elementos:
                </p>
                <ul className="space-y-3 text-sm md:text-base text-foreground/80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <div>
                      <strong>Sinopse:</strong> resumo básico da história
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <div>
                      <strong>Plot points principais:</strong> os momentos-chave da narrativa
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <div>
                      <strong>Argumento:</strong> versão completa ou quase completa do guião
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <div>
                      <strong>Descrição das ideias visuais:</strong> o estilo e linguagem visual pretendidos
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Material Visual */}
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="border border-border p-6 md:p-8 rounded-sm">
          <div className="flex items-start gap-3 md:gap-4 mb-4">
            <div className="bg-primary text-primary-foreground w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm md:text-base">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Material visual</h2>
              <p className="text-sm md:text-base text-foreground/70 mb-4">
                Uma das seguintes opções:
              </p>
              <ul className="space-y-3 text-sm md:text-base text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <div>
                    <strong>Teaser</strong> (1-2 minutos)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <div>
                    <strong>Vídeo conceptual</strong>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <div>
                    <strong>Storyboard</strong>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Portfólio */}
      <section className="bg-accent/30 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="border border-border bg-background p-6 md:p-8 rounded-sm">
            <div className="flex items-start gap-3 md:gap-4 mb-4">
              <div className="bg-primary text-primary-foreground w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm md:text-base">
                4
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">Portfólio</h2>
                <p className="text-sm md:text-base text-foreground/80">
                  Trabalhos anteriores que demonstrem a tua experiência e capacidade artística (opcional mas recomendado).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plano de Produção */}
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="border border-border p-6 md:p-8 rounded-sm">
          <div className="flex items-start gap-3 md:gap-4 mb-4">
            <div className="bg-primary text-primary-foreground w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm md:text-base">
              5
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Plano de produção</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 text-base md:text-lg">Plano orçamental</h3>
                  <p className="text-sm md:text-base text-foreground/70 mb-3">
                    Como serão usados os 1000€. Pode incluir:
                  </p>
                  <ul className="space-y-2 text-sm md:text-base text-foreground/80 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Equipamento extra (hardware, software, alugueres e compras)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Deslocações</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Guarda-roupa e adereços</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Pagamento de pessoal</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-base md:text-lg">Calendário de produção</h3>
                  <p className="text-sm md:text-base text-foreground/80">
                    Cronograma previsto para a execução do projeto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent/30 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">Pronto para te candidatar?</h2>
          <p className="text-base md:text-lg text-foreground/80 mb-6 md:mb-8">
            Descobre como o júri avalia as candidaturas.
          </p>
          <Link
            href="/juri"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-3 rounded-sm text-sm md:text-base font-medium hover:opacity-90 transition-opacity"
          >
            Como funciona o júri →
          </Link>
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
