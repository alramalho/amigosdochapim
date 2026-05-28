"use client";

import { Send } from "lucide-react";
import { useState } from "react";

type ContactFormProps = {
  defaultContext?: string;
  defaultSubject?: string;
  compact?: boolean;
};

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  company: "",
};

export function ContactForm({
  defaultContext = "Contacto geral",
  defaultSubject = "",
  compact = false,
}: ContactFormProps) {
  const [form, setForm] = useState<FormState>({ ...initialForm, subject: defaultSubject });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          context: defaultContext,
          pageUrl: window.location.href,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível enviar a mensagem.");
      }

      setStatus("success");
      setFeedback("Mensagem enviada. Vamos responder por email assim que possível.");
      setForm({ ...initialForm, subject: defaultSubject });
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Não foi possível enviar a mensagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={compact ? "space-y-3" : "space-y-5"}>
      <input
        type="text"
        name="company"
        value={form.company}
        onChange={(event) => update("company", event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className={compact ? "grid gap-3" : "grid gap-4 md:grid-cols-2"}>
        <Field label="Nome" value={form.name} onChange={(value) => update("name", value)} required compact={compact} />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => update("email", value)}
          required
          compact={compact}
        />
      </div>
      <Field
        label="Assunto"
        value={form.subject}
        onChange={(value) => update("subject", value)}
        placeholder="Ajuda com a candidatura"
        compact={compact}
      />
      <label className="block">
        <span className={`block font-medium ${compact ? "mb-1 text-xs" : "mb-2 text-sm"}`}>Mensagem</span>
        <textarea
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          required
          rows={compact ? 4 : 6}
          maxLength={4000}
          className={`w-full border border-border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            compact ? "px-3 py-2 text-sm" : "px-3 py-2"
          }`}
        />
      </label>

      {feedback && (
        <p className={`text-sm ${status === "success" ? "text-green-700" : "text-red-600"}`}>{feedback}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 disabled:opacity-50 ${
          compact ? "w-full px-4 py-2 text-sm" : "px-5 py-3"
        }`}
      >
        <Send className="h-4 w-4" />
        {loading ? "A enviar..." : "Enviar mensagem"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  compact,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  compact?: boolean;
}) {
  return (
    <label className="block">
      <span className={`block font-medium ${compact ? "mb-1 text-xs" : "mb-2 text-sm"}`}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className={`w-full border border-border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          compact ? "px-3 py-2 text-sm" : "px-3 py-2"
        }`}
      />
    </label>
  );
}
