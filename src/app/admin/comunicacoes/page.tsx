"use client";

import { Copy, FilePlus2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  EMAIL_AUDIENCE_META,
  EMAIL_AUDIENCE_SEGMENTS,
  type EmailAudienceSegment,
} from "@/lib/email-audiences";
import { supabase } from "@/lib/supabase";

type EmailDraft = {
  id: string;
  name: string;
  subject: string;
  previewText: string | null;
  body: string;
  audienceSegments: EmailAudienceSegment[];
  recipientEmail: string | null;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
};

type AudienceStats = Record<EmailAudienceSegment, { count: number | null; external?: boolean }>;

type FormState = {
  id: string | null;
  name: string;
  subject: string;
  previewText: string;
  body: string;
  audienceSegments: EmailAudienceSegment[];
  recipientEmail: string;
};

type Person = { email: string; name: string | null };
type RecipientMode = "segments" | "single";

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  subject: "",
  previewText: "",
  body: "",
  audienceSegments: [],
  recipientEmail: "",
};

export default function AdminCommunicationsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [audiences, setAudiences] = useState<AudienceStats | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [people, setPeople] = useState<Person[]>([]);
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("segments");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/entrar");
        return;
      }

      setAccessToken(session.access_token);
      let response: Response;

      try {
        response = await fetch("/api/admin/email-drafts", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } catch {
        setFeedback("Não foi possível contactar o servidor para carregar os rascunhos.");
        setLoading(false);
        return;
      }

      if (response.status === 403) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback(data.error || "Não foi possível carregar os rascunhos.");
        setLoading(false);
        return;
      }

      setDrafts(data.drafts || []);
      setAudiences(data.audiences || null);
      setPeople(data.people || []);
      setLoading(false);
    }

    load();
  }, [router]);

  const selectedRecipientLabel = useMemo(
    () =>
      form.recipientEmail ||
      form.audienceSegments.map((segment) => EMAIL_AUDIENCE_META[segment].label).join(", "),
    [form.audienceSegments, form.recipientEmail]
  );

  const selectDraft = (draft: EmailDraft) => {
    setForm({
      id: draft.id,
      name: draft.name,
      subject: draft.subject,
      previewText: draft.previewText || "",
      body: draft.body,
      audienceSegments: draft.audienceSegments,
      recipientEmail: draft.recipientEmail || "",
    });
    setRecipientMode(draft.recipientEmail ? "single" : "segments");
    setFeedback(null);
    setCopyFeedback(null);
  };

  const newDraft = () => {
    setForm(EMPTY_FORM);
    setRecipientMode("segments");
    setFeedback(null);
    setCopyFeedback(null);
  };

  const toggleAudience = (segment: EmailAudienceSegment) => {
    setForm((current) => ({
      ...current,
      audienceSegments: current.audienceSegments.includes(segment)
        ? current.audienceSegments.filter((value) => value !== segment)
        : [...current.audienceSegments, segment],
    }));
  };

  const changeRecipientMode = (mode: RecipientMode) => {
    setRecipientMode(mode);
    setForm((current) => ({
      ...current,
      audienceSegments: mode === "single" ? [] : current.audienceSegments,
      recipientEmail: mode === "segments" ? "" : current.recipientEmail,
    }));
  };

  const saveDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;

    setSaving(true);
    setFeedback(null);

    let response: Response;

    try {
      response = await fetch("/api/admin/email-drafts", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
    } catch {
      setSaving(false);
      setFeedback("Não foi possível contactar o servidor para guardar o rascunho.");
      return;
    }
    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setFeedback(data.error || "Não foi possível guardar o rascunho.");
      return;
    }

    const saved = data.draft as EmailDraft;
    setDrafts((current) => [saved, ...current.filter((draft) => draft.id !== saved.id)]);
    selectDraft(saved);
    setFeedback("Rascunho guardado. Nenhum email foi enviado.");
  };

  const copyDraft = async () => {
    const content = [
      `Para: ${selectedRecipientLabel || "Por definir"}`,
      `Assunto: ${form.subject || "Por definir"}`,
      form.previewText ? `Pré-visualização: ${form.previewText}` : "",
      "",
      form.body,
    ]
      .filter((line, index) => line || index >= 3)
      .join("\n");

    try {
      await navigator.clipboard.writeText(content);
      setCopyFeedback("Conteúdo copiado.");
    } catch {
      setCopyFeedback("Não foi possível copiar automaticamente.");
    }
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center">A carregar comunicações...</main>;
  }

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">Sem autorização</p>
          <h1 className="text-3xl font-semibold mb-4">Não tens acesso a esta página.</h1>
          <p className="text-foreground/70 mb-6">Esta área é reservada aos administradores dos Amigos do Chapim.</p>
          <Link href="/painel" className="inline-flex px-5 py-3 border border-border rounded-sm hover:bg-accent/30">
            Voltar ao painel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link href="/painel" className="text-sm text-foreground/60 hover:text-foreground">← Painel</Link>
          <nav className="flex gap-4">
            <Link href="/admin/candidaturas" className="text-sm text-foreground/60 hover:text-foreground">Candidaturas</Link>
            <Link href="/admin/views" className="text-sm text-foreground/60 hover:text-foreground">Visualizações</Link>
          </nav>
        </header>

        <div className="mb-8 max-w-3xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">Admin</p>
          <h1 className="text-3xl font-semibold md:text-5xl">Comunicações</h1>
          <p className="mt-4 text-foreground/70">
            Prepara e partilha rascunhos para públicos específicos. Esta área guarda conteúdo, mas não envia emails.
          </p>
        </div>

        <div className="mb-8 rounded-sm border border-amber-300/70 bg-white/30 p-4 text-sm text-amber-950 shadow-sm">
          <strong>Modo rascunho:</strong> não existe qualquer ação de envio nesta página. Depois da revisão,
          copia o conteúdo para o Loops e confirma aí o público antes de enviar.
        </div>

        {feedback && (
          <p className="mb-6 rounded-sm border border-border bg-accent/20 px-4 py-3 text-sm" role="status">
            {feedback}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)_minmax(280px,0.7fr)]">
          <aside>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold">Rascunhos guardados</h2>
              <button
                type="button"
                onClick={newDraft}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <FilePlus2 className="h-4 w-4" /> Novo
              </button>
            </div>
            <div className="overflow-hidden rounded-sm border border-border/80 bg-white/30 shadow-sm">
              {drafts.length === 0 ? (
                <p className="p-4 text-sm text-foreground/60">Ainda não existem rascunhos.</p>
              ) : (
                drafts.map((draft, index) => (
                  <button
                    key={draft.id}
                    type="button"
                    onClick={() => selectDraft(draft)}
                    className={`block w-full p-4 text-left transition-colors hover:bg-accent/30 ${
                      index > 0 ? "border-t border-border" : ""
                    } ${form.id === draft.id ? "bg-accent/40" : ""}`}
                  >
                    <span className="block font-medium">{draft.name}</span>
                    <span className="mt-1 block truncate text-xs text-foreground/60">{draft.subject}</span>
                    <span className="mt-2 block text-xs text-foreground/45">
                      {new Date(draft.updatedAt).toLocaleString("pt-PT")}
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <form onSubmit={saveDraft} className="space-y-6">
            <section className="rounded-sm border border-border/80 bg-white/30 p-5 shadow-sm md:p-6">
              <h2 className="text-xl font-semibold">Destinatários</h2>
              <div className="mb-5 mt-4 inline-flex rounded-sm border border-border bg-white/30 p-1">
                <button
                  type="button"
                  onClick={() => changeRecipientMode("segments")}
                  className={`rounded-sm px-3 py-2 text-sm transition-colors ${
                    recipientMode === "segments" ? "bg-foreground text-background" : "hover:bg-white/50"
                  }`}
                >
                  Públicos
                </button>
                <button
                  type="button"
                  onClick={() => changeRecipientMode("single")}
                  className={`rounded-sm px-3 py-2 text-sm transition-colors ${
                    recipientMode === "single" ? "bg-foreground text-background" : "hover:bg-white/50"
                  }`}
                >
                  Uma pessoa
                </button>
              </div>

              {recipientMode === "single" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Pessoa ou email</span>
                  <input
                    type="email"
                    list="known-email-recipients"
                    value={form.recipientEmail}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, recipientEmail: event.target.value }))
                    }
                    required
                    placeholder="nome@email.com"
                    className="w-full rounded-sm border border-border bg-white/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <datalist id="known-email-recipients">
                    {people.map((person) => (
                      <option key={person.email} value={person.email}>
                        {person.name || person.email}
                      </option>
                    ))}
                  </datalist>
                  <span className="mt-2 block text-xs text-foreground/55">
                    Escolhe uma pessoa conhecida ou escreve qualquer email válido.
                  </span>
                </label>
              ) : (
                <>
                  <p className="mb-4 text-sm text-foreground/60">
                    Podes selecionar mais do que um. A mesma pessoa pode pertencer a vários públicos.
                  </p>
                  <div className="space-y-3">
                    {EMAIL_AUDIENCE_SEGMENTS.map((segment) => {
                      const stats = audiences?.[segment];
                      return (
                        <label key={segment} className="flex cursor-pointer gap-3 rounded-sm border border-border/80 bg-white/25 p-4 hover:bg-white/45">
                          <input
                            type="checkbox"
                            checked={form.audienceSegments.includes(segment)}
                            onChange={() => toggleAudience(segment)}
                            className="mt-1 h-4 w-4 accent-primary"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center justify-between gap-2 font-medium">
                              {EMAIL_AUDIENCE_META[segment].label}
                              <span className="text-xs font-normal text-foreground/50">
                                {stats?.count === null ? "Contagem no Loops" : `${stats?.count ?? 0} contactos`}
                              </span>
                            </span>
                            <span className="mt-1 block text-sm text-foreground/60">
                              {EMAIL_AUDIENCE_META[segment].description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </section>

            <section className="rounded-sm border border-border/80 bg-white/30 p-5 shadow-sm md:p-6">
              <h2 className="mb-5 text-xl font-semibold">Conteúdo do rascunho</h2>
              <div className="space-y-3">
                <Field
                  label="Nome interno"
                  value={form.name}
                  onChange={(name) => setForm((current) => ({ ...current, name }))}
                  placeholder="Ex.: Resultado da primeira fase"
                  maxLength={120}
                />
                <Field
                  label="Assunto"
                  value={form.subject}
                  onChange={(subject) => setForm((current) => ({ ...current, subject }))}
                  maxLength={200}
                />
                <Field
                  label="Texto de pré-visualização (opcional)"
                  value={form.previewText}
                  onChange={(previewText) => setForm((current) => ({ ...current, previewText }))}
                  maxLength={300}
                  required={false}
                />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Mensagem</span>
                  <textarea
                    value={form.body}
                    onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                    rows={14}
                    maxLength={50_000}
                    required
                    className="w-full rounded-sm border border-border bg-white/40 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Escreve aqui a mensagem..."
                  />
                </label>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "A guardar..." : form.id ? "Guardar alterações" : "Guardar rascunho"}
              </button>
              <button
                type="button"
                onClick={copyDraft}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 text-sm font-medium hover:bg-accent/30"
              >
                <Copy className="h-4 w-4" /> Copiar conteúdo
              </button>
              {copyFeedback && <span className="text-sm text-foreground/60" role="status">{copyFeedback}</span>}
            </div>
          </form>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-sm border border-border/80 bg-white/30 p-5 shadow-sm md:p-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/50">Pré-visualização</p>
              <p className="text-xs text-foreground/50">Para: {selectedRecipientLabel || "Destinatário por definir"}</p>
              <h2 className="mt-4 text-xl font-semibold">{form.subject || "Assunto do email"}</h2>
              {form.previewText && <p className="mt-2 text-sm italic text-foreground/55">{form.previewText}</p>}
              <div className="mt-6 whitespace-pre-wrap border-t border-border pt-5 text-sm leading-relaxed text-foreground/80">
                {form.body || "A mensagem aparece aqui enquanto escreves."}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className="w-full rounded-sm border border-border bg-white/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
