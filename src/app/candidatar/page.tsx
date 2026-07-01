"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ContactHelpWidget } from "@/components/contact-help-widget";
import { supabase } from "@/lib/supabase";
import posthog from "posthog-js";
import {
  SUBMISSION_EDIT_WINDOW_DAYS,
  canEditSubmission,
  getSubmissionEditDeadline,
} from "@/lib/submission-editing";

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

const CONTACT_EMAIL = "geral@amigosdochapim.org";

type UploadedFile = {
  objectKey: string;
  publicUrl: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
};

type ExistingSubmission = {
  candidateName: string;
  age: number;
  email: string;
  phone: string;
  residentInPortugal: boolean;
  cvUrl: string | null;
  motivation: string;
  synopsis: string;
  plotPoints: string;
  scriptSummary: string;
  visualIdeas: string;
  externalLinks: string | null;
  createdAt: string;
};

export default function CandidatarPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<ExistingSubmission | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadExistingSubmission() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return;

        const response = await fetch("/api/submissions/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data.submission || cancelled) return;

        const submission = data.submission as ExistingSubmission;
        setExistingSubmission(submission);
        setForm({
          candidateName: submission.candidateName,
          age: String(submission.age),
          email: submission.email,
          phone: submission.phone,
          residentInPortugal: submission.residentInPortugal,
          cvUrl: submission.cvUrl || "",
          motivation: submission.motivation,
          synopsis: submission.synopsis,
          plotPoints: submission.plotPoints,
          scriptSummary: submission.scriptSummary,
          visualIdeas: submission.visualIdeas,
          externalLinks: submission.externalLinks || "",
        });
      } catch (loadError) {
        console.error("Error loading existing submission:", loadError);
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    }

    loadExistingSubmission();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loadingExisting) {
      posthog.capture("candidatura_page_viewed", {
        has_existing_submission: Boolean(existingSubmission),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingExisting]);

  const update = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const editDeadline = existingSubmission ? getSubmissionEditDeadline(existingSubmission.createdAt) : null;
  const editAllowed = !existingSubmission || canEditSubmission(existingSubmission.createdAt);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editAllowed) {
      setError(`Só é possível editar a candidatura até ${SUBMISSION_EDIT_WINDOW_DAYS} dias depois da submissão.`);
      return;
    }

    setLoading(true);
    setError(null);

    let uploadedCv: UploadedFile | null = null;
    try {
      if (cvFile) {
        uploadedCv = await uploadFile(cvFile, "CV");
      }
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Não foi possível enviar o ficheiro.";
      posthog.capture("submission_error", { error: errorMessage, step: "cv_upload" });
      setError(errorMessage);
      setLoading(false);
      return;
    }

    let response: Response;
    try {
      response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cvFile: uploadedCv }),
      });
    } catch (submitError) {
      console.error("Submission request failed:", submitError);
      const errorMessage = `Não conseguimos contactar o servidor para guardar a candidatura. Confirma a ligação à internet e tenta novamente. Se o problema continuar, contacta ${CONTACT_EMAIL}.`;
      posthog.capture("submission_error", { error: "network_error", step: "submit" });
      setError(errorMessage);
      setLoading(false);
      return;
    }

    if (!response.ok) {
      const errorMessage = await errorFromResponse(response, "Não foi possível submeter a candidatura.");
      posthog.capture("submission_error", { error: errorMessage, step: "submit", status: response.status });
      setError(errorMessage);
      setLoading(false);
      return;
    }

    posthog.capture("submission_submitted", {
      is_update: Boolean(existingSubmission),
      has_cv_upload: Boolean(uploadedCv),
      has_cv_url: Boolean(form.cvUrl),
    });
    setSubmittedEmail(form.email);
    setForm(initialForm);
    setCvFile(null);
    setLoading(false);
  };

  if (loadingExisting) {
    return <main className="min-h-screen flex items-center justify-center">A carregar candidatura...</main>;
  }

  if (submittedEmail) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <p className="text-sm uppercase tracking-wide text-primary font-medium mb-3">Candidatura recebida</p>
          <h1 className="text-3xl md:text-5xl font-semibold mb-4">
            {existingSubmission ? "Candidatura atualizada." : "Obrigado pela submissão."}
          </h1>
          <p className="text-foreground/70 mb-6">
            Guardámos a candidatura associada a <strong>{submittedEmail}</strong>. Se precisares de acompanhar ou editar a candidatura mais tarde, entra com esse email no painel.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/" className="px-5 py-3 border border-border rounded-sm">
              Voltar ao início
            </Link>
            <Link href="/entrar" className="px-5 py-3 bg-primary text-primary-foreground rounded-sm">
              Entrar no painel
            </Link>
          </div>
        </div>
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
            15 maio - 30 julho 2026
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold mb-4">Candidatura inicial</h1>
          <p className="text-foreground/70 md:text-lg">
            {existingSubmission
              ? "Carregámos a tua candidatura existente para poderes rever os dados submetidos."
              : "Submete os dados do candidato e a proposta artística em formato resumido. Os finalistas serão contactados para entregar o plano de produção detalhado."}
          </p>
        </div>

        {existingSubmission && (
          <div className={`border rounded-sm p-4 mb-8 ${editAllowed ? "border-border bg-accent/20" : "border-primary/30 bg-accent/40"}`}>
            <p className="font-medium">
              {editAllowed ? "A edição ainda está aberta." : "A edição desta candidatura já fechou."}
            </p>
            <p className="text-sm text-foreground/70 mt-1">
              Só é possível alterar uma candidatura até {SUBMISSION_EDIT_WINDOW_DAYS} dias após a submissão.
              {editDeadline ? ` Neste caso, o prazo de edição termina em ${formatDateTime(editDeadline)}.` : ""}
            </p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-8">
          <section className="border border-border bg-accent/20 rounded-sm p-5 md:p-6">
            <h2 className="text-xl font-semibold mb-5">Dados do candidato</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome" value={form.candidateName} onChange={(value) => update("candidateName", value)} required disabled={!editAllowed} />
              <Field label="Idade" type="number" value={form.age} onChange={(value) => update("age", value)} required disabled={!editAllowed} />
              <Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required disabled={!editAllowed} />
              <Field label="Contacto telefónico" value={form.phone} onChange={(value) => update("phone", value)} required disabled={!editAllowed} />
              <Field label="Link para CV" value={form.cvUrl} onChange={(value) => update("cvUrl", value)} placeholder="Drive, PDF público ou website" disabled={!editAllowed} />
              <FileField label="Upload do CV" file={cvFile} onChange={setCvFile} disabled={!editAllowed} />
            </div>
            <label className="flex gap-3 mt-5 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={form.residentInPortugal}
                onChange={(event) => update("residentInPortugal", event.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
                required
                disabled={!editAllowed}
              />
              Confirmo que o candidato tem residência em Portugal.
            </label>
          </section>

          <section className="border border-border bg-accent/20 rounded-sm p-5 md:p-6">
            <h2 className="text-xl font-semibold mb-5">Componente artística</h2>
            <div className="space-y-4">
              <TextArea label="Carta de motivação" value={form.motivation} onChange={(value) => update("motivation", value)} required disabled={!editAllowed} />
              <TextArea label="Sinopse" value={form.synopsis} onChange={(value) => update("synopsis", value)} required disabled={!editAllowed} />
              <TextArea label="Plot points principais" value={form.plotPoints} onChange={(value) => update("plotPoints", value)} required disabled={!editAllowed} />
              <TextArea label="Argumento resumido" value={form.scriptSummary} onChange={(value) => update("scriptSummary", value)} required disabled={!editAllowed} />
              <TextArea label="Ideias visuais pretendidas" value={form.visualIdeas} onChange={(value) => update("visualIdeas", value)} required disabled={!editAllowed} />
              <TextArea label="Links externos opcionais" value={form.externalLinks} onChange={(value) => update("externalLinks", value)} placeholder="Vimeo, YouTube, Drive, portfolio ou referências relevantes" disabled={!editAllowed} />
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !editAllowed}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "A guardar..." : existingSubmission ? "Guardar alterações" : "Submeter candidatura"}
          </button>
        </form>
      </section>
      <ContactHelpWidget />
    </main>
  );
}

function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

async function uploadFile(file: File, purpose: "CV" | "FINAL_MATERIAL"): Promise<UploadedFile> {
  let presignResponse: Response;
  try {
    presignResponse = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purpose,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      }),
    });
  } catch (presignError) {
    console.error("Upload preparation request failed:", presignError);
    throw new Error(
      `Não conseguimos preparar o envio do ficheiro. Confirma a ligação à internet e tenta novamente. Se o problema continuar, contacta ${CONTACT_EMAIL}.`
    );
  }

  const presign = await presignResponse.json().catch(() => ({}));
  if (!presignResponse.ok) {
    throw new Error(presign.error || "Não foi possível preparar o upload.");
  }

  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
  } catch (uploadError) {
    console.error("Direct file upload failed:", uploadError);
    throw new Error(
      `Não conseguimos enviar o ficheiro. Confirma a ligação à internet e tenta novamente. Também podes submeter a candidatura sem upload e colocar um link público para o CV.`
    );
  }

  if (!uploadResponse.ok) {
    throw new Error(
      `Não foi possível enviar o ficheiro (${uploadResponse.status}). Tenta novamente ou coloca um link público para o CV.`
    );
  }

  return {
    objectKey: presign.objectKey,
    publicUrl: presign.publicUrl,
    fileName: presign.fileName,
    contentType: presign.contentType,
    sizeBytes: presign.sizeBytes,
  };
}

async function errorFromResponse(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  return data && typeof data.error === "string" ? data.error : fallback;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
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
        disabled={disabled}
        className="w-full px-3 py-2 border border-border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
      />
    </label>
  );
}

function FileField({
  label,
  file,
  onChange,
  disabled,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2">{label}</span>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-border rounded-sm bg-background text-sm file:mr-3 file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm disabled:opacity-60"
      />
      {file && <span className="block text-xs text-foreground/60 mt-2">{file.name}</span>}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
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
        disabled={disabled}
        className="w-full px-3 py-2 border border-border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
      />
    </label>
  );
}
