import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Amigos do Chapim",
  description: "Política de privacidade e proteção de dados pessoais dos Amigos do Chapim.",
};

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          <section>
            <p className="text-foreground/70 mb-8">
              Última atualização: {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">1. Introdução</h2>
            <p className="text-foreground/80 mb-3">
              Os Amigos do Chapim ("nós", "nosso") compromete-se a proteger a privacidade dos utilizadores da nossa plataforma. Esta Política de Privacidade explica como recolhemos, utilizamos e protegemos os seus dados pessoais.
            </p>
            <p className="text-foreground/80">
              Esta política está em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD) da União Europeia.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">2. Dados que Recolhemos</h2>

            <h3 className="text-lg font-semibold mb-2 mt-4">2.1 Informação Fornecida Diretamente</h3>
            <p className="text-foreground/80 mb-2">Quando se torna apoiante, recolhemos:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Nome completo</li>
              <li>Endereço de email</li>
              <li>Informação de pagamento (processada pela Stripe)</li>
              <li>Nível de subscrição escolhido</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4">2.2 Informação Recolhida Automaticamente</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Endereço IP</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Páginas visitadas e tempo de navegação</li>
              <li>Origem do tráfego (referrer)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">3. Como Utilizamos os Seus Dados</h2>
            <p className="text-foreground/80 mb-3">Utilizamos os dados pessoais recolhidos para:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Processar e gerir subscrições mensais</li>
              <li>Enviar confirmações de pagamento e recibos</li>
              <li>Fornecer acesso ao portal de votação do júri (para apoiantes "Amigo")</li>
              <li>Comunicar sobre projetos financiados e atualizações da organização</li>
              <li>Melhorar a experiência do utilizador na plataforma</li>
              <li>Cumprir obrigações legais e fiscais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">4. Partilha de Dados</h2>
            <p className="text-foreground/80 mb-3">
              Os seus dados pessoais não são vendidos a terceiros. Partilhamos dados apenas com:
            </p>

            <h3 className="text-lg font-semibold mb-2 mt-4">4.1 Prestadores de Serviços</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Stripe</strong> - Processamento de pagamentos</li>
              <li><strong>Fornecedores de hosting</strong> - Alojamento do website e base de dados</li>
              <li><strong>Fornecedores de email</strong> - Envio de comunicações autorizadas</li>
            </ul>
            <p className="text-foreground/80 mt-3">
              Todos os prestadores de serviços são contratualmente obrigados a proteger os seus dados e apenas os utilizam para os fins especificados.
            </p>

            <h3 className="text-lg font-semibold mb-2 mt-4">4.2 Obrigações Legais</h3>
            <p className="text-foreground/80">
              Podemos divulgar dados pessoais se exigido por lei ou por ordem judicial.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">5. Cookies e Tecnologias Semelhantes</h2>
            <p className="text-foreground/80 mb-3">
              Utilizamos cookies essenciais para o funcionamento da plataforma, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Cookies de sessão para manter o utilizador autenticado</li>
              <li>Cookies de preferências para guardar configurações</li>
            </ul>
            <p className="text-foreground/80 mt-3">
              Não utilizamos cookies de publicidade ou tracking de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">6. Segurança dos Dados</h2>
            <p className="text-foreground/80 mb-3">
              Implementamos medidas de segurança técnicas e organizacionais para proteger os seus dados pessoais, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Encriptação SSL/TLS para todas as comunicações</li>
              <li>Armazenamento seguro em bases de dados protegidas</li>
              <li>Acesso restrito a dados pessoais apenas a pessoal autorizado</li>
              <li>Processamento de pagamentos através de plataforma certificada PCI-DSS (Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">7. Os Seus Direitos (RGPD)</h2>
            <p className="text-foreground/80 mb-3">
              De acordo com o RGPD, tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Direito de acesso</strong> - Solicitar cópia dos seus dados pessoais</li>
              <li><strong>Direito de retificação</strong> - Corrigir dados incorretos ou incompletos</li>
              <li><strong>Direito ao apagamento</strong> - Solicitar a eliminação dos seus dados</li>
              <li><strong>Direito à portabilidade</strong> - Receber os seus dados em formato estruturado</li>
              <li><strong>Direito de oposição</strong> - Opor-se ao processamento dos seus dados</li>
              <li><strong>Direito de limitação</strong> - Solicitar restrição do processamento</li>
            </ul>
            <p className="text-foreground/80 mt-3">
              Para exercer qualquer destes direitos, contacte-nos através de geral@amigosdochapim.org.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">8. Retenção de Dados</h2>
            <p className="text-foreground/80 mb-3">
              Mantemos os seus dados pessoais apenas pelo tempo necessário para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Fornecer os serviços subscritos</li>
              <li>Cumprir obrigações legais e fiscais (mínimo 10 anos para registos contabilísticos)</li>
              <li>Resolver disputas e fazer cumprir os nossos acordos</li>
            </ul>
            <p className="text-foreground/80 mt-3">
              Após o cancelamento da subscrição, os seus dados serão anonimizados ou eliminados, exceto quando a retenção for legalmente exigida.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">9. Transferências Internacionais</h2>
            <p className="text-foreground/80">
              Os seus dados podem ser transferidos e processados em servidores localizados fora da União Europeia (nomeadamente através da Stripe). Garantimos que todas as transferências cumprem os requisitos do RGPD através de cláusulas contratuais padrão aprovadas.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">10. Menores</h2>
            <p className="text-foreground/80">
              A nossa plataforma não se destina a menores de 18 anos. Não recolhemos intencionalmente dados pessoais de menores. Se tomar conhecimento de que um menor forneceu dados pessoais, contacte-nos para que possamos eliminá-los.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">11. Alterações a Esta Política</h2>
            <p className="text-foreground/80">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre alterações significativas através de email ou aviso proeminente na plataforma. A data de "Última atualização" no topo indica quando a política foi revista pela última vez.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">12. Contacto</h2>
            <p className="text-foreground/80 mb-3">
              Para questões sobre privacidade ou para exercer os seus direitos RGPD:
            </p>
            <p className="text-foreground/80">
              <strong>Email:</strong> geral@amigosdochapim.org
            </p>
            <p className="text-foreground/80 mt-4">
              Se não estiver satisfeito com a nossa resposta, tem o direito de apresentar queixa à Comissão Nacional de Proteção de Dados (CNPD) em Portugal.
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
