import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Como Funciona o Júri | Amigos do Chapim",
  description: "Entende como funciona o processo de avaliação e votação dos projetos nos Amigos do Chapim.",
};

export default function JuriPage() {
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
          Como funciona o júri
        </h1>
        <p className="text-base md:text-xl text-foreground/80 leading-relaxed">
          O júri dos Amigos do Chapim é composto por três parcelas distintas, garantindo uma avaliação equilibrada entre especialização técnica, visão interna da organização e participação da comunidade.
        </p>
      </section>

      {/* As 3 Parcelas do Júri */}
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-10">As três parcelas do júri</h2>

        <div className="space-y-6 md:space-y-8">
          {/* Parcela Pública */}
          <div className="border border-border p-6 md:p-8 rounded-sm">
            <div className="flex items-start gap-3 md:gap-4 mb-4">
              <div className="bg-primary text-primary-foreground w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm md:text-base">
                1
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2">Parcela Pública</h3>
                <p className="text-sm md:text-base text-foreground/70 mb-3 md:mb-4">
                  Composta por todos os apoiantes do nível <strong>Amigo</strong> (12€/mês).
                </p>
                <p className="text-sm md:text-base text-foreground/80">
                  Esta parcela representa a voz da comunidade e garante que os projetos escolhidos têm apoio popular. Cada "Amigo" tem acesso a todas as candidaturas submetidas e vota por ordem de preferência.
                </p>
              </div>
            </div>
          </div>

          {/* Parcela Interna */}
          <div className="border border-border p-6 md:p-8 rounded-sm">
            <div className="flex items-start gap-3 md:gap-4 mb-4">
              <div className="bg-primary text-primary-foreground w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm md:text-base">
                2
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2">Parcela Interna</h3>
                <p className="text-sm md:text-base text-foreground/70 mb-3 md:mb-4">
                  Composta pelos membros fundadores e coordenadores da organização.
                </p>
                <p className="text-sm md:text-base text-foreground/80 mb-4">
                  Esta parcela traz conhecimento profundo da missão e valores dos Amigos do Chapim, avaliando não apenas a qualidade artística mas também o alinhamento com os objetivos da organização e a viabilidade de execução.
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-semibold mb-3 text-sm md:text-base">Critérios de avaliação:</h4>
                  <ul className="space-y-2 text-sm md:text-base text-foreground/70">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Qualidade artística</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Originalidade</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Clareza, estrutura e qualidade do argumento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Visão estética e qualidade da execução</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Viabilidade orçamental</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Motivação do candidato</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Parcela Externa */}
          <div className="border border-border p-6 md:p-8 rounded-sm">
            <div className="flex items-start gap-3 md:gap-4 mb-4">
              <div className="bg-primary text-primary-foreground w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm md:text-base">
                3
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2">Parcela de Especialistas Externos</h3>
                <p className="text-sm md:text-base text-foreground/70 mb-3 md:mb-4">
                  Composta por artistas, cineastas e criadores convidados.
                </p>
                <p className="text-sm md:text-base text-foreground/80">
                  Profissionais reconhecidos em diversas áreas artísticas trazem uma perspetiva técnica e crítica especializada. Esta parcela garante que os projetos escolhidos têm mérito artístico genuíno e potencial de impacto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sistema de Votação */}
      <section className="bg-accent/30 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8">Sistema de votação por preferência</h2>

          <div className="space-y-4 md:space-y-6 text-base md:text-lg leading-relaxed">
            <p>
              Utilizamos o sistema de <strong>Ranked-Choice Voting</strong> (Voto por Ordem de Preferência), considerado um dos métodos mais justos e representativos de escolha coletiva.
            </p>

            <div className="bg-background border border-border p-5 md:p-6 rounded-sm">
              <h3 className="font-semibold mb-4 text-lg md:text-xl">Como funciona?</h3>
              <ol className="space-y-3 list-decimal list-inside text-sm md:text-base">
                <li>Cada membro de cada parcela do júri ordena os projetos candidatos por ordem de preferência (1º, 2º, 3º, etc.).</li>
                <li>Os votos são contabilizados de forma ponderada: a primeira escolha recebe mais peso, seguida da segunda, e assim sucessivamente.</li>
                <li>O sistema elimina gradualmente os projetos com menor apoio, redistribuindo os votos até emergir um vencedor com apoio amplo.</li>
              </ol>
            </div>

            <p>
              Este método garante que o projeto vencedor não precisa apenas de uma maioria simples, mas de <strong>apoio amplo e consistente</strong> de toda a comunidade e júri. Projetos polarizadores que agradam muito a poucos mas desagradam a muitos têm menos probabilidade de vencer do que projetos com consenso alargado.
            </p>
          </div>
        </div>
      </section>

      {/* Ponderação das Parcelas */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8">Ponderação entre parcelas</h2>

        <p className="text-base md:text-lg text-foreground/80 mb-6 md:mb-8">
          Cada parcela do júri contribui de forma igual para a decisão final. O resultado é calculado combinando as preferências das três parcelas, garantindo equilíbrio entre voz popular, visão estratégica e excelência técnica.
        </p>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          <div className="text-center p-5 md:p-6 border border-border rounded-sm">
            <div className="text-4xl md:text-5xl font-semibold mb-2">33%</div>
            <p className="text-sm md:text-base text-foreground/70">Parcela Pública</p>
          </div>
          <div className="text-center p-5 md:p-6 border border-border rounded-sm">
            <div className="text-4xl md:text-5xl font-semibold mb-2">33%</div>
            <p className="text-sm md:text-base text-foreground/70">Parcela Interna</p>
          </div>
          <div className="text-center p-5 md:p-6 border border-border rounded-sm">
            <div className="text-4xl md:text-5xl font-semibold mb-2">33%</div>
            <p className="text-sm md:text-base text-foreground/70">Especialistas Externos</p>
          </div>
        </div>
      </section>

      {/* Como Participar */}
      <section className="bg-accent/30 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8">Como participar no júri?</h2>

          <p className="text-base md:text-lg text-foreground/80 mb-6 md:mb-8">
            A parcela pública do júri está aberta a todos os apoiantes do nível <strong>Amigo</strong>. Ao tornares-te um Amigo dos Amigos do Chapim, ganhas o direito de:
          </p>

          <ul className="space-y-3 text-sm md:text-lg mb-6 md:mb-8">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">✓</span>
              <span>Rever todas as candidaturas submetidas ao concurso anual</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">✓</span>
              <span>Votar por ordem de preferência nos projetos candidatos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">✓</span>
              <span>Acompanhar o processo de deliberação de forma transparente</span>
            </li>
          </ul>

          <Link
            href="/#como-ajudar"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-3 rounded-sm text-sm md:text-base font-medium hover:opacity-90 transition-opacity"
          >
            Tornar-me um Amigo →
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
