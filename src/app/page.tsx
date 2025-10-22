import Link from "next/link";
import Image from "next/image";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <AuroraBackground className="w-full">
        <section className="max-w-5xl mx-auto px-4 pt-0 pb-10 md:pb-16 text-center relative z-10">
          <div className="mb-4 mb:mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Amigos do Chapim"
              width={300}
              height={150}
              priority
              className="w-48 h-24 md:w-64 md:h-37 object-contain"
            />
          </div>
          <div className="py-12 md:py-24">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-semibold mb-4 md:mb-6 tracking-tight px-2">
              Democratizar a arte.
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-foreground/80 max-w-3xl mx-auto font-normal px-4">
              Uma organização sem fins lucrativos dedicada a ajudar os jovens artistas portugueses
            </p>
          </div>
        </section>
      </AuroraBackground>

      {/* Marquee de Parcerias */}
      <section className="border-y border-border py-6 md:py-8 overflow-hidden">
        <div className="flex gap-6 md:gap-12 items-center justify-center opacity-40 flex-wrap px-4">
          <div className="text-xs md:text-sm uppercase tracking-widest">
            Parceiro 1
          </div>
          <div className="text-xs md:text-sm uppercase tracking-widest">
            Parceiro 2
          </div>
          <div className="text-xs md:text-sm uppercase tracking-widest">
            Parceiro 3
          </div>
          <div className="text-xs md:text-sm uppercase tracking-widest">
            Parceiro 4
          </div>
          <div className="text-xs md:text-sm uppercase tracking-widest">
            Parceiro 5
          </div>
        </div>
      </section>

      {/* Quem Somos */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 md:mb-8">
          Quem somos
        </h2>
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
      <section className="bg-accent/30 py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 md:mb-8">
            Como funciona
          </h2>
          <div className="space-y-4 text-base md:text-lg leading-relaxed mb-6">
            <p>
              O processo é simples e transparente. Anualmente abrimos
              candidaturas abertas a todos. Um júri avalia o potencial artístico
              e a viabilidade financeira de cada projeto, garantindo que os
              fundos apoiam os projetos mais prometedores e dedicados.
            </p>
          </div>
          <Link
            href="/juri"
            className="inline-block text-primary underline underline-offset-4 hover:no-underline text-sm md:text-base"
          >
            Como funciona o júri? →
          </Link>
        </div>
      </section>

      {/* Como Ajudar */}
      <section
        id="como-ajudar"
        className="max-w-4xl mx-auto px-4 py-12 md:py-24"
      >
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 md:mb-8">
          Como ajudar
        </h2>
        <p className="text-base md:text-lg mb-3 md:mb-4">
          Oferecemos duas formas de apoio à nossa missão:
        </p>
        <p className="text-sm md:text-base text-foreground/70 mb-8 md:mb-12 italic">
          Os primeiros 50 apoiantes de cada ano aparecem nos créditos do projeto
          vencedor.
        </p>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Tier 1 - Apoiante */}
          <div className="border border-border p-6 md:p-8 rounded-sm">
            <div className="mb-4">
              <h3 className="text-xl md:text-2xl font-semibold mb-2">
                Apoiante
              </h3>
              <div className="text-2xl md:text-3xl font-semibold">
                8€{" "}
                <span className="text-base md:text-lg font-normal text-foreground/60">
                  / mês
                </span>
              </div>
            </div>
            <p className="text-sm md:text-base text-foreground/80">
              Contribui diretamente para o financiamento de projetos artísticos.
            </p>
          </div>

          {/* Tier 2 - Amigo */}
          <div className="border-2 border-primary p-6 md:p-8 rounded-sm relative">
            <div className="mb-4">
              <h3 className="text-xl md:text-2xl font-semibold mb-2">Amigo</h3>
              <div className="text-2xl md:text-3xl font-semibold">
                12€{" "}
                <span className="text-base md:text-lg font-normal text-foreground/60">
                  / mês
                </span>
              </div>
            </div>
            <ul className="space-y-2 text-sm md:text-base text-foreground/80">
              <li>• Tudo do plano Apoiante</li>
              <li>• Participação na parcela pública do júri</li>
              <li>• Acesso a todas as candidaturas submetidas</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Transparência Financeira */}
      <section className="bg-accent/30 py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 md:mb-8">
            Transparência financeira
          </h2>
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
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 md:mb-12">
          Perguntas frequentes
        </h2>
        <div className="space-y-6 md:space-y-8">
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Que tipos de projetos artísticos são elegíveis?
            </h3>
            <p className="text-sm md:text-base text-foreground/80">
              Aceitamos candidaturas de todas as áreas artísticas: cinema,
              música, teatro, artes plásticas, fotografia, dança, e outras
              formas de expressão criativa.
            </p>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Posso cancelar a minha subscrição a qualquer momento?
            </h3>
            <p className="text-sm md:text-base text-foreground/80">
              Sim, sem qualquer compromisso. Podes cancelar a tua subscrição a
              qualquer momento, sem penalizações.
            </p>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Como funciona o sistema de votação por preferência do júri?
            </h3>
            <p className="text-sm md:text-base text-foreground/80">
              Utilizamos o método de <em>Ranked-Choice Voting</em> (Voto por
              Ordem de Preferência), onde cada membro do júri ordena os projetos
              por preferência. Este sistema garante que o projeto vencedor tem
              apoio amplo e não apenas maioria simples.
            </p>
          </div>
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
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border text-center text-xs md:text-sm text-foreground/40">
            © 2025 Amigos do Chapim. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
