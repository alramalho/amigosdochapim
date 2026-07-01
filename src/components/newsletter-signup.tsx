"use client";

import { MailPlus } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";

type NewsletterSignupProps = {
  title: string;
  description: string;
  source: string;
  buttonLabel?: string;
  className?: string;
};

export function NewsletterSignup({
  title,
  description,
  source,
  buttonLabel = "Receber novidades",
  className = "",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);
    setStatus("idle");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          source,
          pagePath: window.location.pathname,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível guardar o email.");
      }

      posthog.capture("newsletter_signup_submitted", {
        source,
        page_path: window.location.pathname,
      });
      setStatus("success");
      setFeedback("Ficaste na lista. Enviamos novidades quando houver algo útil.");
      setEmail("");
      setCompany("");
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Não foi possível guardar o email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`bg-accent/30 py-12 md:py-16 ${className}`}>
      <div className="mx-auto max-w-4xl px-4">
        <div className="grid gap-6 md:grid-cols-[1fr_minmax(18rem,24rem)] md:items-center md:gap-10">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/75 md:text-base">
              {description}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              type="text"
              name="company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
              <label className="sr-only" htmlFor={`newsletter-email-${source}`}>
                Email
              </label>
              <input
                id={`newsletter-email-${source}`}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="o.teu@email.com"
                className="min-h-11 flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <MailPlus className="h-4 w-4" />
                {loading ? "A guardar..." : buttonLabel}
              </button>
            </div>

            {feedback && (
              <p className={`text-sm ${status === "success" ? "text-green-700" : "text-red-600"}`}>
                {feedback}
              </p>
            )}
            <p className="text-xs leading-relaxed text-foreground/55">
              Sem spam. Podes sair da lista a qualquer momento.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
