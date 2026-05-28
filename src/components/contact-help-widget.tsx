"use client";

import { CircleHelp, X } from "lucide-react";
import { useState } from "react";
import { ContactForm } from "@/components/contact-form";

export function ContactHelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <div
        className={`origin-bottom-right overflow-hidden border border-border bg-background shadow-xl transition-all duration-200 ease-out ${
          open ? "max-h-[560px] w-[min(calc(100vw-2.5rem),360px)] opacity-100" : "max-h-0 w-14 opacity-0"
        }`}
      >
        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Precisas de ajuda?</h2>
              <p className="mt-1 text-xs text-foreground/60">A tua mensagem vai para a equipa.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border hover:bg-accent/50"
              aria-label="Fechar ajuda"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ContactForm defaultContext="Widget de ajuda da candidatura" defaultSubject="Ajuda com a candidatura" compact />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label={open ? "Fechar ajuda" : "Abrir ajuda"}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <CircleHelp className="h-7 w-7" />}
      </button>
    </div>
  );
}
