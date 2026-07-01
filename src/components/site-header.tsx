import Image from "next/image";
import Link from "next/link";
import { AuthNavLink } from "@/components/auth-nav-link";
import { TornEdge } from "@/components/torn-edge";
import { CONTEST_WINDOWS } from "@/lib/contest";

// UTC, not Europe/Lisbon: applicationsCloseAt is 23:59:59Z, which is already
// past midnight in Lisbon - localizing would show "31 julho" and contradict
// the "30 julho 2026" copy on /o-que-deve-ser-entregue.
const CANDIDATURAS_FECHAM = CONTEST_WINDOWS.applicationsCloseAt.toLocaleDateString("pt-PT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

interface SiteHeaderProps {
  aprovadoCM: boolean;
}

export function SiteHeader({ aprovadoCM }: SiteHeaderProps) {
  return (
    <header className="relative w-full overflow-hidden bg-background">
      <AuthNavLink className="absolute top-4 right-4 z-30 px-4 py-2 text-sm font-medium bg-foreground/80 text-background hover:bg-foreground rounded-lg transition-colors backdrop-blur-sm" />

      <div className="flex flex-col md:flex-row md:min-h-[620px]">
        {/* Editorial panel */}
        <div className="relative z-10 flex flex-col justify-between gap-10 bg-panel text-background px-6 py-10 md:w-[38%] md:px-12 md:py-14">
          <div>
            <Image
              src="/logo_v2_beige.png"
              alt="Amigos do Chapim"
              width={300}
              height={114}
              priority
              className="w-40 md:w-48 h-auto object-contain"
            />
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 tracking-tight">
              Democratizar a arte.
            </h1>
            <p className="text-base md:text-lg text-background/80 max-w-sm mb-10">
              Uma iniciativa dedicada a ajudar os jovens artistas portugueses
            </p>

            <p className="text-xs md:text-sm text-background/60 mb-2 tracking-wide uppercase">
              1º Concurso de Curtas-Metragens
            </p>
            <p className="text-sm md:text-base text-background/80 max-w-sm mb-5">
              Candidaturas abertas até {CANDIDATURAS_FECHAM}. Financiamos a
              curta-metragem vencedora de um jovem artista português.
            </p>
            <Link
              href="/o-que-deve-ser-entregue"
              className="inline-flex w-fit items-center gap-2 bg-background text-foreground px-5 py-2.5 rounded-sm text-sm md:text-base font-medium hover:opacity-90 transition-opacity"
            >
              Candidatar →
            </Link>
          </div>

          <div>
            <p className="text-xs md:text-sm text-background/60 mb-3 tracking-wide">
              Com o apoio de
            </p>
            <div className="flex gap-6 items-center flex-wrap opacity-90">
              {aprovadoCM ? (
                <Image
                  src="/cm_odivelas_branco.png"
                  alt="Câmara Municipal de Odivelas"
                  width={100}
                  height={40}
                  className="h-8 md:h-10 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="text-xs uppercase tracking-widest">Parceiro 1</div>
                  <div className="text-xs uppercase tracking-widest">Parceiro 2</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Photo panel */}
        <div className="relative flex-1 min-h-[280px] md:min-h-0 bg-[#F0EBE0]">
          <Image
            src="/header-street.jpg"
            alt="Largo com pelourinho português"
            fill
            priority
            sizes="(min-width: 768px) 62vw, 100vw"
            className="object-cover mix-blend-multiply"
            style={{ objectPosition: "50% 45%" }}
          />

          {/* Seam texture, anchored to this panel's own edges so it doesn't
              depend on the editorial panel's (content-driven) height */}
          <TornEdge
            orientation="vertical"
            fill="var(--panel)"
            className="hidden md:block absolute top-0 left-0 h-full w-16 -translate-x-1/2"
          />
          <TornEdge
            orientation="horizontal"
            fill="var(--panel)"
            className="md:hidden absolute top-0 left-0 w-full h-12 -translate-y-1/2"
          />
        </div>
      </div>
    </header>
  );
}
