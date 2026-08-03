"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FilePlus2,
  RefreshCw,
  Save,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  EMAIL_AUDIENCE_META,
  EMAIL_AUDIENCE_SEGMENTS,
  type EmailAudienceSegment,
} from "@/lib/email-audiences";
import { supabase } from "@/lib/supabase";

type EmailSendStatus = "QUEUED" | "SENDING" | "SENT" | "PARTIALLY_SENT" | "FAILED";
type EmailDeliveryStatus =
  | "QUEUED"
  | "SENDING"
  | "ACCEPTED"
  | "DELIVERED"
  | "BOUNCED"
  | "COMPLAINED"
  | "FAILED";

type EmailSendSummary = {
  id: string;
  draftId: string;
  name: string;
  subject: string;
  status: EmailSendStatus;
  recipientCount: number;
  acceptedCount: number;
  deliveredCount: number;
  failedCount: number;
  createdByEmail: string;
  createdAt: string;
  completedAt: string | null;
};

type EmailDraft = {
  id: string;
  name: string;
  subject: string;
  previewText: string | null;
  body: string;
  audienceSegments: EmailAudienceSegment[];
  recipientEmail: string | null;
  createdByEmail: string;
  sentByEmail: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  emailSend?: EmailSendSummary | null;
};

type AudienceStats = Record<EmailAudienceSegment, { count: number }>;

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

type DeliveryConfig = {
  configured: boolean;
  provider: string;
  region: string;
  fromEmail: string;
};

type SendPreview = {
  draftId: string;
  fingerprint: string;
  count: number;
  segmentCounts: Record<EmailAudienceSegment, number>;
  sample: Array<{ email: string; name: string | null; segments: EmailAudienceSegment[] }>;
  subject: string;
  recipientEmail: string | null;
  audienceSegments: EmailAudienceSegment[];
  delivery: DeliveryConfig;
};

type SendProgress = {
  id: string;
  status: EmailSendStatus;
  recipientCount: number;
  acceptedCount: number;
  failedCount: number;
  remaining: number;
};

type SendDetail = EmailSendSummary & {
  fromEmail: string;
  deliveries: Array<{
    id: string;
    email: string;
    name: string | null;
    status: EmailDeliveryStatus;
    error: string | null;
    attempts: number;
    acceptedAt: string | null;
    deliveredAt: string | null;
  }>;
};

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  subject: "",
  previewText: "",
  body: "",
  audienceSegments: [],
  recipientEmail: "",
};

const STATUS_LABELS: Record<EmailSendStatus, string> = {
  QUEUED: "Na fila",
  SENDING: "A enviar",
  SENT: "Enviado",
  PARTIALLY_SENT: "Envio parcial",
  FAILED: "Falhou",
};

const DELIVERY_STATUS_LABELS: Record<EmailDeliveryStatus, string> = {
  QUEUED: "Na fila",
  SENDING: "A enviar",
  ACCEPTED: "Aceite pelo SES",
  DELIVERED: "Entregue",
  BOUNCED: "Devolvido",
  COMPLAINED: "Marcado como spam",
  FAILED: "Falhou",
};

function delay(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export default function AdminCommunicationsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [sends, setSends] = useState<EmailSendSummary[]>([]);
  const [audiences, setAudiences] = useState<AudienceStats | null>(null);
  const [delivery, setDelivery] = useState<DeliveryConfig | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [people, setPeople] = useState<Person[]>([]);
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("segments");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preparingSend, setPreparingSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendPreview, setSendPreview] = useState<SendPreview | null>(null);
  const [sendConfirmation, setSendConfirmation] = useState("");
  const [sendProgress, setSendProgress] = useState<SendProgress | null>(null);
  const [sendDetail, setSendDetail] = useState<SendDetail | null>(null);
  const [loadingSendDetail, setLoadingSendDetail] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  async function loadData(token: string) {
    let response: Response;

    try {
      response = await fetch("/api/admin/email-drafts", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setFeedback("Não foi possível contactar o servidor para carregar as comunicações.");
      return false;
    }

    if (response.status === 403) {
      setAuthorized(false);
      return false;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setFeedback(data.error || "Não foi possível carregar as comunicações.");
      return false;
    }

    setDrafts(data.drafts || []);
    setSends(data.sends || []);
    setAudiences(data.audiences || null);
    setPeople(data.people || []);
    setDelivery(data.delivery || null);
    return true;
  }

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/entrar");
        return;
      }

      setAccessToken(session.access_token);
      await loadData(session.access_token);
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

  const currentDraft = form.id ? drafts.find((draft) => draft.id === form.id) : null;
  const currentDraftSent = Boolean(currentDraft?.sentAt);

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
    setSendPreview(null);
  };

  const newDraft = () => {
    setForm(EMPTY_FORM);
    setRecipientMode("segments");
    setFeedback(null);
    setCopyFeedback(null);
    setSendPreview(null);
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

  async function persistDraft() {
    if (!accessToken || currentDraftSent) return null;

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
      return null;
    }

    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setFeedback(data.error || "Não foi possível guardar o rascunho.");
      return null;
    }

    const saved = data.draft as EmailDraft;
    setDrafts((current) => [saved, ...current.filter((draft) => draft.id !== saved.id)]);
    selectDraft(saved);
    return saved;
  }

  const saveDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    const saved = await persistDraft();
    if (saved) setFeedback("Rascunho guardado.");
  };

  const prepareSend = async () => {
    if (!accessToken || currentDraftSent) return;
    setPreparingSend(true);
    setFeedback(null);

    const saved = await persistDraft();
    if (!saved) {
      setPreparingSend(false);
      return;
    }

    const response = await fetch("/api/admin/email-sends/preview", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftId: saved.id }),
    }).catch(() => null);

    setPreparingSend(false);
    if (!response) {
      setFeedback("Não foi possível preparar a confirmação do envio.");
      return;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setFeedback(data.error || "Não foi possível preparar a confirmação do envio.");
      return;
    }

    setSendPreview(data.preview);
    setSendConfirmation("");
  };

  async function processSend(sendId: string, retryFailed = false) {
    if (!accessToken) return;
    setSending(true);
    let shouldRetry = retryFailed;

    for (let batch = 0; batch < 2_000; batch += 1) {
      const response = await fetch(`/api/admin/email-sends/${sendId}/process`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ retryFailed: shouldRetry }),
      }).catch(() => null);
      shouldRetry = false;

      if (!response) {
        setFeedback("O envio foi interrompido. Podes retomá-lo nos envios recentes.");
        setSending(false);
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFeedback(data.error || "Não foi possível continuar o envio.");
        setSending(false);
        return;
      }

      const updated = data.send as EmailSendSummary;
      setSendProgress({
        id: updated.id,
        status: updated.status,
        recipientCount: updated.recipientCount,
        acceptedCount: updated.acceptedCount,
        failedCount: updated.failedCount,
        remaining: data.remaining,
      });

      if (data.remaining === 0) {
        await loadData(accessToken);
        setSending(false);
        setFeedback(
          updated.failedCount > 0
            ? `Envio concluído com ${updated.acceptedCount} aceites e ${updated.failedCount} falhas.`
            : `Email enviado para ${updated.acceptedCount} destinatário${updated.acceptedCount === 1 ? "" : "s"}.`
        );
        return;
      }

      await delay(450);
    }

    setSending(false);
    setFeedback("O envio foi pausado por segurança. Retoma-o nos envios recentes.");
  }

  async function loadSendDetail(sendId: string) {
    if (!accessToken) return;
    setLoadingSendDetail(true);
    const response = await fetch(`/api/admin/email-sends/${sendId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => null);
    setLoadingSendDetail(false);

    if (!response) {
      setFeedback("Não foi possível carregar o detalhe do envio.");
      return;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setFeedback(data.error || "Não foi possível carregar o detalhe do envio.");
      return;
    }

    setSendDetail(data.send);
  }

  const confirmSend = async () => {
    if (!accessToken || !sendPreview || sendConfirmation !== "ENVIAR") return;
    setSending(true);
    setFeedback(null);

    const response = await fetch("/api/admin/email-sends", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draftId: sendPreview.draftId,
        fingerprint: sendPreview.fingerprint,
        confirmation: sendConfirmation,
      }),
    }).catch(() => null);

    if (!response) {
      setSending(false);
      setFeedback("Não foi possível iniciar o envio.");
      return;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setSending(false);
      setSendPreview(null);
      setFeedback(data.error || "Não foi possível iniciar o envio.");
      return;
    }

    setSendPreview(null);
    setSendConfirmation("");
    await processSend(data.send.id);
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
    return <main className="flex min-h-screen items-center justify-center">A carregar comunicações...</main>;
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">Sem autorização</p>
          <h1 className="mb-4 text-3xl font-semibold">Não tens acesso a esta página.</h1>
          <p className="mb-6 text-foreground/70">Esta área é reservada aos administradores dos Amigos do Chapim.</p>
          <Link href="/painel" className="inline-flex rounded-sm border border-border px-5 py-3 hover:bg-accent/30">
            Voltar ao painel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <Link href="/painel" className="text-sm text-foreground/60 hover:text-foreground">← Painel</Link>
          <nav className="flex gap-4">
            <Link href="/admin/candidaturas" className="text-sm text-foreground/60 hover:text-foreground">Candidaturas</Link>
            <Link href="/admin/views" className="text-sm text-foreground/60 hover:text-foreground">Visualizações</Link>
          </nav>
        </header>

        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">Admin</p>
            <h1 className="text-3xl font-semibold md:text-5xl">Comunicações</h1>
            <p className="mt-3 text-foreground/70">Escreve, confirma os destinatários e envia diretamente pelo portal.</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
            delivery?.configured
              ? "border-emerald-700/20 bg-emerald-50/70 text-emerald-900"
              : "border-amber-600/30 bg-amber-50 text-amber-950"
          }`}>
            {delivery?.configured ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {delivery?.configured ? `${delivery.provider} · ${delivery.fromEmail}` : "Envio ainda não configurado"}
          </div>
        </div>

        {feedback && (
          <p className="mb-6 rounded-sm border border-border bg-white/40 px-4 py-3 text-sm shadow-sm" role="status">
            {feedback}
          </p>
        )}

        {sendProgress && (
          <div className="mb-6 rounded-sm border border-border/80 bg-white/40 p-4 shadow-sm" role="status">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium">{STATUS_LABELS[sendProgress.status]}</span>
              <span className="text-foreground/60">
                {sendProgress.acceptedCount}/{sendProgress.recipientCount} aceites
                {sendProgress.failedCount > 0 ? ` · ${sendProgress.failedCount} falhas` : ""}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.round(((sendProgress.acceptedCount + sendProgress.failedCount) / Math.max(sendProgress.recipientCount, 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)_minmax(280px,0.7fr)]">
          <aside className="space-y-7">
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-semibold">Rascunhos</h2>
                <button type="button" onClick={newDraft} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
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
                      className={`block w-full p-4 text-left transition-colors hover:bg-white/45 ${
                        index > 0 ? "border-t border-border" : ""
                      } ${form.id === draft.id ? "bg-white/55" : ""}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{draft.name}</span>
                        {draft.sentAt && <span className="text-[10px] uppercase tracking-wide text-emerald-800">Enviado</span>}
                      </span>
                      <span className="mt-1 block truncate text-xs text-foreground/60">{draft.subject}</span>
                      <span className="mt-2 block text-xs text-foreground/45">{new Date(draft.updatedAt).toLocaleString("pt-PT")}</span>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-3 font-semibold">Envios recentes</h2>
              <div className="overflow-hidden rounded-sm border border-border/80 bg-white/30 shadow-sm">
                {sends.length === 0 ? (
                  <p className="p-4 text-sm text-foreground/60">Nenhum email enviado.</p>
                ) : (
                  sends.slice(0, 8).map((send, index) => (
                    <div key={send.id} className={`p-4 ${index > 0 ? "border-t border-border" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium">{send.name}</span>
                        <span className={`shrink-0 text-[10px] uppercase tracking-wide ${
                          send.status === "SENT" ? "text-emerald-800" : send.status === "SENDING" ? "text-amber-800" : "text-red-800"
                        }`}>
                          {STATUS_LABELS[send.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-foreground/55">{send.acceptedCount}/{send.recipientCount} aceites{send.failedCount ? ` · ${send.failedCount} falhas` : ""}</p>
                      <button
                        type="button"
                        disabled={loadingSendDetail}
                        onClick={() => loadSendDetail(send.id)}
                        className="mt-2 text-xs text-foreground/60 hover:text-foreground disabled:opacity-50"
                      >
                        Ver detalhe
                      </button>
                      {(send.status === "SENDING" || send.status === "FAILED" || send.status === "PARTIALLY_SENT") && (
                        <button
                          type="button"
                          disabled={sending}
                          onClick={() => processSend(send.id, send.status !== "SENDING")}
                          className="ml-3 mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                        >
                          <RefreshCw className="h-3 w-3" /> {send.status === "SENDING" ? "Retomar" : "Repetir falhas"}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>

          <form onSubmit={saveDraft} className="space-y-6">
            {currentDraftSent && (
              <div className="rounded-sm border border-emerald-800/20 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
                Este email já foi enviado e está bloqueado como histórico. Cria um novo rascunho para voltar a enviá-lo.
              </div>
            )}

            <section className="rounded-sm border border-border/80 bg-white/30 p-5 shadow-sm md:p-6">
              <h2 className="text-xl font-semibold">Destinatários</h2>
              <div className="mb-5 mt-4 inline-flex rounded-sm border border-border bg-white/30 p-1">
                <button
                  type="button"
                  disabled={currentDraftSent}
                  onClick={() => changeRecipientMode("segments")}
                  className={`rounded-sm px-3 py-2 text-sm transition-colors disabled:opacity-50 ${
                    recipientMode === "segments" ? "bg-foreground text-background" : "hover:bg-white/50"
                  }`}
                >
                  Públicos
                </button>
                <button
                  type="button"
                  disabled={currentDraftSent}
                  onClick={() => changeRecipientMode("single")}
                  className={`rounded-sm px-3 py-2 text-sm transition-colors disabled:opacity-50 ${
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
                    onChange={(event) => setForm((current) => ({ ...current, recipientEmail: event.target.value }))}
                    required
                    disabled={currentDraftSent}
                    placeholder="nome@email.com"
                    className="w-full rounded-sm border border-border bg-white/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                  <datalist id="known-email-recipients">
                    {people.map((person) => <option key={person.email} value={person.email}>{person.name || person.email}</option>)}
                  </datalist>
                  <span className="mt-2 block text-xs text-foreground/55">Escolhe uma pessoa conhecida ou escreve qualquer email válido.</span>
                </label>
              ) : (
                <div className="space-y-3">
                  {EMAIL_AUDIENCE_SEGMENTS.map((segment) => {
                    const stats = audiences?.[segment];
                    return (
                      <label key={segment} className="flex cursor-pointer gap-3 rounded-sm border border-border/80 bg-white/25 p-4 hover:bg-white/45">
                        <input
                          type="checkbox"
                          checked={form.audienceSegments.includes(segment)}
                          onChange={() => toggleAudience(segment)}
                          disabled={currentDraftSent}
                          className="mt-1 h-4 w-4 accent-primary"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-2 font-medium">
                            {EMAIL_AUDIENCE_META[segment].label}
                            <span className="text-xs font-normal text-foreground/50">{stats?.count ?? 0} contactos</span>
                          </span>
                          <span className="mt-1 block text-sm text-foreground/60">{EMAIL_AUDIENCE_META[segment].description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-sm border border-border/80 bg-white/30 p-5 shadow-sm md:p-6">
              <h2 className="mb-5 text-xl font-semibold">Conteúdo</h2>
              <div className="space-y-3">
                <Field label="Nome interno" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} placeholder="Ex.: Resultado da primeira fase" maxLength={120} disabled={currentDraftSent} />
                <Field label="Assunto" value={form.subject} onChange={(subject) => setForm((current) => ({ ...current, subject }))} maxLength={200} disabled={currentDraftSent} />
                <Field label="Texto de pré-visualização (opcional)" value={form.previewText} onChange={(previewText) => setForm((current) => ({ ...current, previewText }))} maxLength={300} required={false} disabled={currentDraftSent} />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Mensagem</span>
                  <textarea
                    value={form.body}
                    onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                    rows={14}
                    maxLength={50_000}
                    required
                    disabled={currentDraftSent}
                    className="w-full rounded-sm border border-border bg-white/40 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                    placeholder="Escreve aqui a mensagem..."
                  />
                </label>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={saving || sending || currentDraftSent} className="inline-flex items-center gap-2 rounded-sm border border-border bg-white/35 px-5 py-3 text-sm font-medium hover:bg-white/55 disabled:opacity-50">
                <Save className="h-4 w-4" /> {saving ? "A guardar..." : form.id ? "Guardar" : "Guardar rascunho"}
              </button>
              <button type="button" onClick={prepareSend} disabled={saving || preparingSend || sending || currentDraftSent || !delivery?.configured} className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                <Send className="h-4 w-4" /> {preparingSend ? "A confirmar..." : "Preparar envio"}
              </button>
              <button type="button" onClick={copyDraft} className="inline-flex items-center gap-2 px-2 py-3 text-sm text-foreground/65 hover:text-foreground">
                <Copy className="h-4 w-4" /> Copiar
              </button>
              {copyFeedback && <span className="text-sm text-foreground/60" role="status">{copyFeedback}</span>}
            </div>
          </form>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-sm border border-border/80 bg-white/30 p-5 shadow-sm md:p-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/50">Pré-visualização</p>
              <p className="text-xs text-foreground/50">De: {delivery?.fromEmail || "Por configurar"}</p>
              <p className="mt-1 text-xs text-foreground/50">Para: {selectedRecipientLabel || "Destinatário por definir"}</p>
              <h2 className="mt-4 text-xl font-semibold">{form.subject || "Assunto do email"}</h2>
              {form.previewText && <p className="mt-2 text-sm italic text-foreground/55">{form.previewText}</p>}
              <div className="mt-6 whitespace-pre-wrap border-t border-border pt-5 text-sm leading-relaxed text-foreground/80">{form.body || "A mensagem aparece aqui enquanto escreves."}</div>
              {recipientMode === "segments" && form.audienceSegments.some((segment) => segment !== "ADMINS") && (
                <p className="mt-6 border-t border-border pt-4 text-xs text-foreground/45">O email incluirá gestão de preferências e cancelamento de subscrição.</p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {sendPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4" role="dialog" aria-modal="true" aria-labelledby="send-confirmation-title">
          <div className="w-full max-w-lg rounded-sm border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">Confirmação final</p>
                <h2 id="send-confirmation-title" className="mt-1 text-2xl font-semibold">Enviar para {sendPreview.count} destinatário{sendPreview.count === 1 ? "" : "s"}?</h2>
              </div>
              <button type="button" onClick={() => setSendPreview(null)} disabled={sending} aria-label="Fechar" className="p-1 text-foreground/55 hover:text-foreground disabled:opacity-50"><X className="h-5 w-5" /></button>
            </div>

            <dl className="mt-6 space-y-3 rounded-sm border border-border bg-white/35 p-4 text-sm">
              <div className="grid grid-cols-[80px_1fr] gap-3"><dt className="text-foreground/55">De</dt><dd>{sendPreview.delivery.fromEmail}</dd></div>
              <div className="grid grid-cols-[80px_1fr] gap-3"><dt className="text-foreground/55">Assunto</dt><dd>{sendPreview.subject}</dd></div>
              <div className="grid grid-cols-[80px_1fr] gap-3"><dt className="text-foreground/55">Público</dt><dd>{sendPreview.recipientEmail || sendPreview.audienceSegments.map((segment) => EMAIL_AUDIENCE_META[segment].label).join(", ")}</dd></div>
            </dl>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">Amostra de destinatários</p>
              <div className="max-h-32 overflow-auto text-xs text-foreground/60">
                {sendPreview.sample.map((recipient) => <p key={recipient.email}>{recipient.name ? `${recipient.name} · ` : ""}{recipient.email}</p>)}
                {sendPreview.count > sendPreview.sample.length && <p>+ {sendPreview.count - sendPreview.sample.length} restantes</p>}
              </div>
            </div>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-medium">Escreve ENVIAR para confirmar</span>
              <input value={sendConfirmation} onChange={(event) => setSendConfirmation(event.target.value.toUpperCase())} autoFocus className="w-full rounded-sm border border-border bg-white/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setSendPreview(null)} disabled={sending} className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent/30 disabled:opacity-50">Cancelar</button>
              <button type="button" onClick={confirmSend} disabled={sending || sendConfirmation !== "ENVIAR"} className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                <Send className="h-4 w-4" /> {sending ? "A iniciar..." : "Enviar agora"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sendDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4" role="dialog" aria-modal="true" aria-labelledby="send-detail-title">
          <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-sm border border-border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">Histórico do envio</p>
                <h2 id="send-detail-title" className="mt-1 text-2xl font-semibold">{sendDetail.name}</h2>
                <p className="mt-1 text-sm text-foreground/60">{sendDetail.subject}</p>
              </div>
              <button type="button" onClick={() => setSendDetail(null)} aria-label="Fechar" className="p-1 text-foreground/55 hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-3 gap-3 border-b border-border bg-white/25 px-6 py-4 text-sm">
              <div><span className="block text-xs text-foreground/50">Destinatários</span>{sendDetail.recipientCount}</div>
              <div><span className="block text-xs text-foreground/50">Aceites</span>{sendDetail.acceptedCount}</div>
              <div><span className="block text-xs text-foreground/50">Entregues</span>{sendDetail.deliveredCount}</div>
            </div>

            <div className="max-h-[58vh] overflow-auto p-6">
              <div className="space-y-2">
                {sendDetail.deliveries.map((recipient) => (
                  <div key={recipient.id} className="rounded-sm border border-border/80 bg-white/30 px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="min-w-0 break-all">{recipient.name ? `${recipient.name} · ` : ""}{recipient.email}</span>
                      <span className={`shrink-0 text-xs ${
                        recipient.status === "DELIVERED"
                          ? "text-emerald-800"
                          : ["FAILED", "BOUNCED", "COMPLAINED"].includes(recipient.status)
                            ? "text-red-800"
                            : "text-foreground/55"
                      }`}>
                        {DELIVERY_STATUS_LABELS[recipient.status]}
                      </span>
                    </div>
                    {recipient.error && <p className="mt-2 text-xs text-red-800">{recipient.error}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={maxLength} required={required} disabled={disabled} className="w-full rounded-sm border border-border bg-white/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60" />
    </label>
  );
}
