import Link from "next/link";
import Image from "next/image";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AuthNavLink } from "@/components/auth-nav-link";
import { DonationSection } from "@/components/donation-section";
import { FAQItem } from "@/components/faq-item";

// Flag para mostrar logotipo da CM Odivelas (aguarda autorização)
// true em dev para testar, false em prod até ter autorização
const APROVADO_CM = process.env.NODE_ENV === "development";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <AuroraBackground className="w-full bg-primary text-primary-foreground">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-4 py-4 flex justify-end">
          <AuthNavLink className="px-4 py-2 text-sm font-medium bg-background/10 hover:bg-background/20 rounded-lg transition-colors backdrop-blur-sm" />
        </nav>

        <section className="max-w-5xl mx-auto px-4 pt-0 pb-10 md:pb-16 text-center relative z-10">
          <div className="mb-4 mb:mb-8 mt-2 flex justify-center opacity-80">
            <Image
              src="/logo_v2_beige.png"
              alt="Amigos do Chapim"
              width={300}
              height={150}
              priority
              className="w-48 h-20 md:w-64 md:h-32 object-contain"
            />
          </div>
          <div className="py-12 md:py-24">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold mb-4 md:mb-6 tracking-tight">
              Democratizar a arte.
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-primary-foreground/80 max-w-3xl mx-auto font-normal">
              Uma iniciativa dedicada a ajudar os jovens artistas portugueses
            </p>
          </div>
        </section>

        {/* Parceiros */}
        <section className="py-6 md:py-8 overflow-hidden relative z-10">
          <div className="flex gap-6 md:gap-12 items-center justify-center opacity-60 flex-wrap px-4">
            {APROVADO_CM ? (
              <Image
                src="/cm_odivelas_branco.png"
                alt="Câmara Municipal de Odivelas"
                width={100}
                height={40}
                className="h-8 md:h-10 w-auto object-contain"
              />
            ) : (
              <>
                <div className="text-xs md:text-sm uppercase tracking-widest">Parceiro 1</div>
                <div className="text-xs md:text-sm uppercase tracking-widest">Parceiro 2</div>
                <div className="text-xs md:text-sm uppercase tracking-widest">Parceiro 3</div>
                <div className="text-xs md:text-sm uppercase tracking-widest">Parceiro 4</div>
              </>
            )}
          </div>
        </section>
      </AuroraBackground>

      {/* Quem Somos */}
      <section id="quem-somos" className="max-w-4xl mx-auto px-4 py-12 md:py-24 scroll-mt-4">
        <a href="#quem-somos" className="group">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 md:mb-8 inline-flex items-center gap-2">
            Quem somos
            <span className="opacity-0 group-hover:opacity-50 transition-opacity text-lg">#</span>
          </h2>
        </a>
        <div className="space-y-4 text-base md:text-lg leading-relaxed">
          <p>
            Os Amigos do Chapim nasceram de conversas entre amigos na zona do
            Centro Comercial do Chapim, em Odivelas. Conhecemos de perto as
            barreiras que jovens talentos enfrentam: a falta de capital inicial
            para equipamento, a ausência de mentores, ou simplesmente não
            saberem por onde começar.
          </p>
          <p className="font-medium">
            A arte continua a ser um mundo de privilégio. Acreditamos que não
            deveria ser.
          </p>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="bg-accent/30 py-12 md:py-24 scroll-mt-4">
        <div className="max-w-4xl mx-auto px-4">
          <a href="#como-funciona" className="group">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 md:mb-8 inline-flex items-center gap-2">
              Como funciona
              <span className="opacity-0 group-hover:opacity-50 transition-opacity text-lg">#</span>
            </h2>
          </a>
          <div className="space-y-4 text-base md:text-lg leading-relaxed mb-6">
            <p>
              O processo é simples e transparente. Anualmente abrimos
              candidaturas para curtas-metragens. Cada candidato submete a sua
              proposta — sinopse, argumento, material visual e plano de produção.
              Um júri avalia o potencial artístico e a viabilidade de cada
              projeto, garantindo que os fundos apoiam as ideias mais prometedoras.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <Link
              href="/o-que-deve-ser-entregue"
              className="text-primary underline underline-offset-4 hover:no-underline text-sm md:text-base"
            >
              O que deve ser entregue? →
            </Link>
            <Link
              href="/juri"
              className="text-primary underline underline-offset-4 hover:no-underline text-sm md:text-base"
            >
              Como funciona o júri? →
            </Link>
          </div>
        </div>
      </section>

      {/* Como Ajudar */}
      <section
        id="como-ajudar"
        className="max-w-4xl mx-auto px-4 py-12 md:py-24 scroll-mt-4"
      >
        <a href="#como-ajudar" className="group">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 md:mb-8 inline-flex items-center gap-2">
            Como ajudar
            <span className="opacity-0 group-hover:opacity-50 transition-opacity text-lg">#</span>
          </h2>
        </a>
        <p className="text-base md:text-lg mb-8 md:mb-12">
          Oferecemos várias formas de apoio à nossa missão:
        </p>

        <DonationSection />
      </section>

      {/* Transparência Financeira */}
      <section id="transparencia" className="bg-accent/30 py-12 md:py-24 scroll-mt-4">
        <div className="max-w-4xl mx-auto px-4">
          <a href="#transparencia" className="group">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 md:mb-8 inline-flex items-center gap-2">
              Transparência financeira
              <span className="opacity-0 group-hover:opacity-50 transition-opacity text-lg">#</span>
            </h2>
          </a>
          <div className="space-y-6 text-base md:text-lg leading-relaxed">
            <p>
              Acreditamos que a confiança se constrói com transparência. Por
              isso, comprometemo-nos a partilhar de forma clara como os fundos
              são utilizados.
            </p>
            <div className="grid gap-6 md:grid-cols-2 md:gap-8 mt-6 md:mt-8">
              <div>
                <div className="text-3xl md:text-4xl font-semibold mb-2">
                  90%
                </div>
                <p className="text-sm md:text-base text-foreground/80">
                  Financiamento direto de projetos artísticos
                </p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-semibold mb-2">
                  10%
                </div>
                <p className="text-sm md:text-base text-foreground/80">
                  Custos operacionais
                </p>
              </div>
            </div>
            <details className="mt-6">
              <summary className="cursor-pointer font-medium hover:underline text-sm md:text-base">
                O que inclui os custos operacionais?
              </summary>
              <ul className="mt-4 space-y-2 text-sm md:text-base text-foreground/80 ml-4">
                <li>• Hosting do website e domínio</li>
                <li>• Base de dados e infraestrutura técnica</li>
                <li>
                  • Taxas de serviços de terceiros (Stripe cobra uma percentagem
                  sobre doações)
                </li>
                <li>• Possíveis honorários de júris externos convidados</li>
                <li>
                  • Deslocações de membros para garantir a execução dos projetos
                </li>
              </ul>
            </details>
            <Link
              href="/painel"
              className="inline-flex items-center gap-2 mt-8 text-sm md:text-base font-medium hover:underline"
            >
              Ver custos detalhados
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 py-12 md:py-24 scroll-mt-4">
        <a href="#faq" className="group">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 md:mb-12 inline-flex items-center gap-2">
            Perguntas frequentes
            <span className="opacity-0 group-hover:opacity-50 transition-opacity text-lg">#</span>
          </h2>
        </a>
        <div className="space-y-4">
          <FAQItem question="Que tipos de projetos artísticos são elegíveis?">
            Aceitamos candidaturas de todas as áreas artísticas: cinema,
            música, teatro, artes plásticas, fotografia, dança, e outras
            formas de expressão criativa.
          </FAQItem>
          <FAQItem question="Posso cancelar a minha subscrição a qualquer momento?">
            Sim, sem qualquer compromisso. Podes cancelar a tua subscrição a
            qualquer momento, sem penalizações.
          </FAQItem>
          <FAQItem question="Como funciona o sistema de votação por preferência do júri?">
            Utilizamos o método de <em>Ranked-Choice Voting</em> (Voto por
            Ordem de Preferência), onde cada membro do júri ordena os projetos
            por preferência. Este sistema garante que o projeto vencedor tem
            apoio amplo e não apenas maioria simples.
          </FAQItem>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 md:gap-12">
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
                Amigos do Chapim
              </h3>
              <p className="text-xs md:text-sm text-foreground/60">
                A democratizar a arte.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
                Contacto
              </h3>
              <p className="text-xs md:text-sm text-foreground/60">
                geral@amigosdochapim.org
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
                Legal
              </h3>
              <div className="space-y-2 text-xs md:text-sm">
                <Link
                  href="/termos"
                  className="block text-foreground/60 hover:text-foreground"
                >
                  Termos e Condições
                </Link>
                <Link
                  href="/privacidade"
                  className="block text-foreground/60 hover:text-foreground"
                >
                  Política de Privacidade
                </Link>
              </div>
            </div>
          </div>
          {/* Logos + Copyright */}
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border">
            <div className="flex gap-6 md:gap-8 items-center">
              <Image
                src="/logo_v2.png"
                alt="Amigos do Chapim"
                width={100}
                height={50}
                className="h-8 md:h-10 w-auto object-contain opacity-40"
              />
              {APROVADO_CM && (
                <Image
                  src="/cm_odivelas_preto.png"
                  alt="Câmara Municipal de Odivelas"
                  width={120}
                  height={40}
                  className="h-6 md:h-8 w-auto object-contain opacity-30"
                />
              )}
            </div>
            <div className="mt-4 md:mt-6 text-xs md:text-sm text-foreground/40">
              © 2025 Amigos do Chapim. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
