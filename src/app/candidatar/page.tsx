"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const initialForm = {
  candidateName: "",
  age: "",
  email: "",
  phone: "",
  residentInPortugal: false,
  cvUrl: "",
  motivation: "",
  synopsis: "",
  plotPoints: "",
  scriptSummary: "",
  visualIdeas: "",
  externalLinks: "",
};

export default function CandidatarPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const devEmail = process.env.NEXT_PUBLIC_DEV_AUTH_EMAIL;
      if (!session && !devEmail) {
        router.push("/entrar");
        return;
      }
      if (session?.user.email) {
        setForm((current) => ({ ...current, email: session.user.email! }));
      } else if (devEmail) {
        setForm((current) => ({ ...current, email: devEmail }));
      }
      setCheckingAuth(false);
    });
  }, [router]);

  const update = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Não foi possível submeter a candidatura.");
      setLoading(false);
      return;
    }

    router.push("/painel/candidatura");
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/70">A verificar acesso...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border py-4 md:py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-foreground/60 hover:text-foreground">
            ← Voltar
          </Link>
          <Link href="/painel/candidatura" className="text-sm text-foreground/60 hover:text-foreground">
            Ver candidatura
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <div className="max-w-3xl mb-8">
          <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">
            15 maio - 15 julho 2026
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold mb-4">Candidatura inicial</h1>
          <p className="text-foreground/70 md:text-lg">
            Submete os dados do candidato e a proposta artística em formato resumido. Os finalistas serão contactados para entregar o plano de produção detalhado.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-8">
          <section className="border border-border rounded-sm p-5 md:p-6">
            <h2 className="text-xl font-semibold mb-5">Dados do candidato</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome" value={form.candidateName} onChange={(value) => update("candidateName", value)} required />
              <Field label="Idade" type="number" value={form.age} onChange={(value) => update("age", value)} required />
              <Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required />
              <Field label="Contacto telefónico" value={form.phone} onChange={(value) => update("phone", value)} required />
              <Field label="Link para CV" value={form.cvUrl} onChange={(value) => update("cvUrl", value)} placeholder="Drive, PDF público ou website" />
            </div>
            <label className="flex gap-3 mt-5 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={form.residentInPortugal}
                onChange={(event) => update("residentInPortugal", event.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
                required
              />
              Confirmo que o candidato tem residência em Portugal.
            </label>
          </section>

          <section className="border border-border rounded-sm p-5 md:p-6">
            <h2 className="text-xl font-semibold mb-5">Componente artística</h2>
            <div className="space-y-4">
              <TextArea label="Carta de motivação" value={form.motivation} onChange={(value) => update("motivation", value)} required />
              <TextArea label="Sinopse" value={form.synopsis} onChange={(value) => update("synopsis", value)} required />
              <TextArea label="Plot points principais" value={form.plotPoints} onChange={(value) => update("plotPoints", value)} required />
              <TextArea label="Argumento resumido" value={form.scriptSummary} onChange={(value) => update("scriptSummary", value)} required />
              <TextArea label="Ideias visuais pretendidas" value={form.visualIdeas} onChange={(value) => update("visualIdeas", value)} required />
              <TextArea label="Links externos opcionais" value={form.externalLinks} onChange={(value) => update("externalLinks", value)} placeholder="Vimeo, YouTube, Drive, portfolio ou referências relevantes" />
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "A submeter..." : "Submeter candidatura"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 border border-border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
