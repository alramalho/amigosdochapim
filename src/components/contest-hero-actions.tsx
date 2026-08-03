import Link from "next/link";

export function ContestHeroActions() {
  return (
    <div className="mt-8 border-l border-background/30 pl-4">
      <p className="text-xs uppercase tracking-wide text-background/60">
        Concurso de Curtas 2026
      </p>
      <p className="mt-1 text-sm font-medium text-background/90">
        Candidaturas encerradas
      </p>
      <Link
        href="#novidades"
        className="mt-4 inline-flex text-sm text-background/75 underline underline-offset-4 transition-colors hover:text-background"
      >
        Receber próximas novidades →
      </Link>
    </div>
  );
}
