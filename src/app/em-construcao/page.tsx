import Link from "next/link";

export default function EmConstrucaoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-2xl font-semibold mb-4">Em construção</h1>
        <p className="text-foreground/70 mb-8">
          Esta página ainda está a ser desenvolvida. Volta em breve!
        </p>
        <Link
          href="/painel"
          className="inline-block px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Voltar ao painel
        </Link>
      </div>
    </main>
  );
}
