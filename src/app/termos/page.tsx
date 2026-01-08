import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos e Condições | Amigos do Chapim",
  description: "Termos e condições de utilização da plataforma Amigos do Chapim.",
};

export default function TermosPage() {
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <h1 className="text-3xl md:text-5xl font-semibold mb-6 md:mb-8 tracking-tight">
          Termos e Condições
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          <section>
            <p className="text-foreground/70 mb-8">
              Última atualização: {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-foreground/80">
              Ao aceder e utilizar o website dos Amigos do Chapim ("Plataforma"), concorda estar vinculado a estes Termos e Condições. Se não concordar com estes termos, não deve utilizar a Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">2. Sobre a Organização</h2>
            <p className="text-foreground/80 mb-3">
              Os Amigos do Chapim é uma associação sem fins lucrativos dedicada a facilitar o acesso às artes através da entreajuda. A nossa missão é apoiar jovens talentos artísticos através de financiamento e recursos.
            </p>
            <p className="text-foreground/80 mb-3">
              <strong>Identificação:</strong> ASSOCIAÇÃO AMIGOS DO CHAPIM, pessoa coletiva sem fins lucrativos, com o NIPC 519177029, com sede em Rua Alves Redol Nº1 6ºC, 2675-285 Odivelas, Lisboa.
            </p>
            <p className="text-foreground/80">
              Todos os fundos angariados são utilizados de forma transparente, conforme descrito na nossa política de transparência financeira.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">3. Subscrições e Contribuições</h2>

            <h3 className="text-lg font-semibold mb-2 mt-4">3.1 Natureza das Contribuições</h3>
            <p className="text-foreground/80 mb-3">
              As contribuições efetuadas através desta Plataforma constituem <strong>donativos</strong> à ASSOCIAÇÃO AMIGOS DO CHAPIM, uma associação sem fins lucrativos.
            </p>
            <p className="text-foreground/80 mb-3">
              Os donativos permitem:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4 mb-3">
              <li>Apoiar diretamente projetos artísticos</li>
              <li>Acesso à plataforma digital e aos seus conteúdos</li>
              <li>Visualização de candidaturas artísticas</li>
              <li>Participação no júri público (plano "Amigo")</li>
              <li>Acompanhamento dos projetos financiados</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4">3.2 Níveis de Apoio</h3>
            <p className="text-foreground/80 mb-3">
              Oferecemos dois níveis de apoio mensal:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Apoiante</strong> (8€/mês) - Contribuição direta para projetos artísticos</li>
              <li><strong>Amigo</strong> (12€/mês) - Todos os benefícios de Apoiante + participação no júri público + acesso a candidaturas</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4">3.3 Processamento de Pagamentos</h3>
            <p className="text-foreground/80 mb-3">
              As subscrições são processadas através da Stripe. Ao subscrever, concorda com os termos de serviço da Stripe e autoriza cobranças mensais recorrentes no método de pagamento fornecido.
            </p>

            <h3 className="text-lg font-semibold mb-2 mt-4">3.4 Cancelamento</h3>
            <p className="text-foreground/80">
              Pode cancelar a sua subscrição a qualquer momento sem penalizações. O cancelamento terá efeito no final do período de faturação atual. Não são efetuados reembolsos por períodos parciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">4. Participação no Júri</h2>
            <p className="text-foreground/80 mb-3">
              Os apoiantes do nível "Amigo" têm direito a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Aceder a todas as candidaturas submetidas ao concurso anual</li>
              <li>Votar por ordem de preferência nos projetos candidatos</li>
              <li>Participar na parcela pública do júri (33% do peso total)</li>
            </ul>
            <p className="text-foreground/80 mt-3">
              A participação no júri requer subscrição ativa do nível "Amigo" no momento da votação.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">5. Propriedade Intelectual</h2>
            <p className="text-foreground/80">
              Todos os conteúdos da Plataforma, incluindo textos, gráficos, logótipos e design, são propriedade dos Amigos do Chapim e estão protegidos por leis de propriedade intelectual. Não é permitida a reprodução sem autorização prévia.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">6. Limitação de Responsabilidade</h2>
            <p className="text-foreground/80 mb-3">
              Os Amigos do Chapim empenha-se em fornecer informação precisa e atualizada, mas não garante que a Plataforma estará sempre disponível ou livre de erros.
            </p>
            <p className="text-foreground/80">
              Não nos responsabilizamos por quaisquer danos diretos ou indiretos resultantes da utilização ou impossibilidade de utilização da Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">7. Alterações aos Termos</h2>
            <p className="text-foreground/80">
              Reservamo-nos o direito de alterar estes Termos e Condições a qualquer momento. As alterações entrarão em vigor após publicação na Plataforma. A utilização continuada após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">8. Lei Aplicável</h2>
            <p className="text-foreground/80">
              Estes Termos e Condições são regidos pela lei portuguesa. Qualquer litígio será da competência exclusiva dos tribunais portugueses.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">9. Contacto</h2>
            <p className="text-foreground/80">
              Para questões sobre estes Termos e Condições, contacte-nos através de:
            </p>
            <p className="text-foreground/80 mt-2">
              <strong>Email:</strong> geral@amigosdochapim.org
            </p>
            <p className="text-foreground/80 mt-2">
              <strong>Morada:</strong> Rua Alves Redol Nº1 6ºC, 2675-285 Odivelas, Lisboa
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 md:py-12 mt-12">
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
