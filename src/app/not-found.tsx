import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-foreground/20 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página não encontrada</h2>
        <p className="text-foreground/70 mb-8">
          A página que procuras não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
