import Link from "next/link";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contacto | Amigos do Chapim",
  description: "Contacta a equipa dos Amigos do Chapim.",
};

export default function ContactoPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border py-4 md:py-6">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="inline-flex text-sm text-foreground/60 hover:text-foreground">
            ← Voltar
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        <div className="max-w-2xl mb-8">
          <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">Contacto</p>
          <h1 className="text-3xl md:text-5xl font-semibold mb-4">Fala connosco</h1>
          <p className="text-foreground/70 md:text-lg">
            Para dúvidas sobre candidaturas, júri, apoios ou funcionamento da plataforma.
          </p>
        </div>

        <section className="border border-border bg-accent/20 rounded-sm p-5 md:p-6">
          <ContactForm defaultContext="Página de contacto" defaultSubject="Pedido de contacto" />
        </section>
      </section>
    </main>
  );
}
