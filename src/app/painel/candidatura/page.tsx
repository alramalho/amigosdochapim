"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Submission = {
  id: string;
  status: string;
  candidateName: string;
  synopsis: string;
  createdAt: string;
  files?: UploadedFile[];
  finalMaterials: null | {
    materialList: string;
    budgetPlan: string;
    productionCalendar: string;
    externalLinks: string | null;
  };
};

type UploadedFile = {
  objectKey: string;
  publicUrl: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  purpose?: "CV" | "FINAL_MATERIAL";
};

const finalInitial = {
  materialList: "",
  budgetPlan: "",
  productionCalendar: "",
  externalLinks: "",
};

export default function CandidaturaPainelPage() {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [finalForm, setFinalForm] = useState(finalInitial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [finalFiles, setFinalFiles] = useState<File[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => fetch("/api/submissions/me", {
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    }))
      .then((response) => response.json())
      .then((data) => {
        setSubmission(data.submission);
        if (data.submission?.finalMaterials) {
          setFinalForm({
            materialList: data.submission.finalMaterials.materialList,
            budgetPlan: data.submission.finalMaterials.budgetPlan,
            productionCalendar: data.submission.finalMaterials.productionCalendar,
            externalLinks: data.submission.finalMaterials.externalLinks || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const saveFinalMaterials = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    let uploadedFiles: UploadedFile[] = [];
    try {
      uploadedFiles = await Promise.all(finalFiles.map((file) => uploadFile(file, "FINAL_MATERIAL")));
    } catch (uploadError) {
      setMessage(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar os ficheiros.");
      setSaving(false);
      return;
    }

    const response = await fetch("/api/submissions/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeader()),
      },
      body: JSON.stringify({ ...finalForm, files: uploadedFiles }),
    });

    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível guardar a entrega final.");
      return;
    }

    setMessage("Entrega final guardada.");
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center">A carregar...</main>;
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <Link href="/painel" className="text-sm text-foreground/60 hover:text-foreground">
            ← Painel
          </Link>
          <Link href="/candidatar" className="text-sm text-foreground/60 hover:text-foreground">
            Editar candidatura
          </Link>
        </header>

        <h1 className="text-3xl md:text-5xl font-semibold mb-4">A tua candidatura</h1>

        {!submission ? (
          <div className="border border-border rounded-sm p-6 mt-8">
            <p className="text-foreground/70 mb-5">Ainda não submeteste candidatura para o concurso de 2026.</p>
            <Link href="/candidatar" className="inline-block px-5 py-3 bg-primary text-primary-foreground rounded-sm">
              Submeter candidatura
            </Link>
          </div>
        ) : (
          <div className="space-y-8 mt-8">
            <section className="border border-border rounded-sm p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">{submission.candidateName}</h2>
                  <p className="text-sm text-foreground/60 mt-1">{submission.synopsis}</p>
                  <p className="text-sm text-foreground/50 mt-3">
                    Submetida em {formatDateTime(submission.createdAt)}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-wide border border-border rounded-sm px-3 py-1 self-start">
                  {statusLabel(submission.status)}
                </span>
              </div>
            </section>

            {submission.status === "SELECTED_FOR_FINAL" || submission.finalMaterials ? (
              <section className="border border-border rounded-sm p-6">
                <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">
                  16 - 31 julho 2026
                </p>
                <h2 className="text-2xl font-semibold mb-4">Entrega dos requisitos da fase final</h2>
                <form onSubmit={saveFinalMaterials} className="space-y-4">
                  <TextArea label="Listagem do material a utilizar" value={finalForm.materialList} onChange={(value) => setFinalForm((current) => ({ ...current, materialList: value }))} />
                  <TextArea label="Orçamento de utilização do prémio de 1000€" value={finalForm.budgetPlan} onChange={(value) => setFinalForm((current) => ({ ...current, budgetPlan: value }))} />
                  <TextArea label="Calendário de produção" value={finalForm.productionCalendar} onChange={(value) => setFinalForm((current) => ({ ...current, productionCalendar: value }))} />
                  <TextArea label="Links externos complementares" value={finalForm.externalLinks} onChange={(value) => setFinalForm((current) => ({ ...current, externalLinks: value }))} required={false} />
                  <FileField label="Ficheiros complementares" files={finalFiles} onChange={setFinalFiles} />
                  {submission.files?.filter((file) => file.purpose === "FINAL_MATERIAL").length ? (
                    <div className="text-sm text-foreground/70">
                      <p className="font-medium mb-2">Ficheiros submetidos</p>
                      <div className="space-y-1">
                        {submission.files
                          ?.filter((file) => file.purpose === "FINAL_MATERIAL")
                          .map((file) => (
                            <a key={file.objectKey} href={file.publicUrl} target="_blank" rel="noopener noreferrer" className="block text-primary underline underline-offset-4">
                              {file.fileName}
                            </a>
                          ))}
                      </div>
                    </div>
                  ) : null}
                  {message && <p className="text-sm text-foreground/70">{message}</p>}
                  <button disabled={saving} className="px-5 py-3 bg-primary text-primary-foreground rounded-sm disabled:opacity-50">
                    {saving ? "A guardar..." : "Guardar entrega final"}
                  </button>
                </form>
              </section>
            ) : (
              <section className="bg-accent/30 rounded-sm p-6">
                <h2 className="text-xl font-semibold mb-2">Próximo passo</h2>
                <p className="text-foreground/70">
                  A candidatura será avaliada pela associação. Avisaremos por email quando houver novidades; se fores selecionado, esta página abre a entrega do plano de produção final.
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

async function uploadFile(file: File, purpose: "CV" | "FINAL_MATERIAL"): Promise<UploadedFile> {
  const presignResponse = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      purpose,
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    }),
  });

  const presign = await presignResponse.json().catch(() => ({}));
  if (!presignResponse.ok) {
    throw new Error(presign.error || "Não foi possível preparar o upload.");
  }

  const uploadResponse = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Não foi possível enviar o ficheiro.");
  }

  return {
    objectKey: presign.objectKey,
    publicUrl: presign.publicUrl,
    fileName: presign.fileName,
    contentType: presign.contentType,
    sizeBytes: presign.sizeBytes,
  };
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    SUBMITTED: "Submetida",
    IN_REVIEW: "Em avaliação",
    SELECTED_FOR_FINAL: "Selecionada para fase final",
    FINAL_MATERIALS_SUBMITTED: "Entrega final submetida",
    FINALIST: "Finalista",
    WINNER: "Vencedora",
    REJECTED: "Não selecionada",
  };

  return labels[status] || status;
}

function TextArea({
  label,
  value,
  onChange,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        required={required}
        className="w-full px-3 py-2 border border-border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function FileField({
  label,
  files,
  onChange,
}: {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2">{label}</span>
      <input
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
        onChange={(event) => onChange(Array.from(event.target.files || []))}
        className="w-full px-3 py-2 border border-border rounded-sm bg-background text-sm file:mr-3 file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm"
      />
      {files.length > 0 && (
        <span className="block text-xs text-foreground/60 mt-2">
          {files.map((file) => file.name).join(", ")}
        </span>
      )}
    </label>
  );
}
