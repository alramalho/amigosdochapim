"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Slot = { day: string; time: string; startsAt: string };
type Response = { jurorEmail: string; slotStart: string; choice: Choice };
type Choice = "YES" | "IF_NEEDED" | "NO";

type Payload = {
  durationMinutes: number;
  jurors: string[];
  isAdmin: boolean;
  viewerEmail: string;
  slots: Slot[];
  responses: Response[];
};

const choices: { value: Choice; label: string; className: string }[] = [
  { value: "YES", label: "Sim", className: "border-emerald-300 bg-emerald-100 text-emerald-900" },
  { value: "IF_NEEDED", label: "Se necessário", className: "border-amber-300 bg-amber-100 text-amber-900" },
  { value: "NO", label: "Não", className: "border-stone-300 bg-stone-100 text-stone-700" },
];

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function DisponibilidadePage() {
  const [data, setData] = useState<Payload | null>(null);
  const [mine, setMine] = useState<Record<string, Choice>>({});
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const headers = await authHeader();
      const response = await fetch("/api/jury/availability", { headers }).catch(() => null);

      if (!response?.ok) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      const payload: Payload = await response.json();
      setData(payload);
      setMine(
        Object.fromEntries(
          payload.responses
            .filter((item) => item.jurorEmail === payload.viewerEmail)
            .map((item) => [item.slotStart, item.choice])
        )
      );
      setLoading(false);
    }

    load();
  }, []);

  const choose = async (slotStart: string, choice: Choice) => {
    const previous = mine[slotStart];
    setMine((current) => ({ ...current, [slotStart]: choice }));
    setSavingSlot(slotStart);
    setError(null);

    const response = await fetch("/api/jury/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ slotStart, choice }),
    });

    setSavingSlot(null);

    if (!response.ok) {
      setMine((current) => {
        const reverted = { ...current };
        if (previous) reverted[slotStart] = previous;
        else delete reverted[slotStart];
        return reverted;
      });
      setError("Não foi possível guardar. Tenta novamente.");
    }
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center">A carregar...</main>;
  }

  if (forbidden || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-foreground/70">Esta página é reservada ao júri do concurso.</p>
      </main>
    );
  }

  const days = Array.from(new Set(data.slots.map((slot) => slot.day)));
  const answered = data.slots.filter((slot) => mine[slot.startsAt]).length;

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <Link href="/painel" className="text-sm text-foreground/60 hover:text-foreground">
            ← Painel
          </Link>
        </header>

        <h1 className="text-3xl md:text-5xl font-semibold mb-4">Disponibilidade para as entrevistas</h1>
        <p className="text-foreground/70 mb-2">
          Vamos entrevistar os 3 finalistas na semana de 7 a 13 de setembro, uma entrevista por dia,
          com {data.durationMinutes} minutos cada. Precisamos dos três jurados em todas.
        </p>
        <p className="text-foreground/60 text-sm mb-8">
          Marca cada horário. Quanto mais <strong>Sim</strong> conseguires, mais fácil será encontrar
          três dias. Horas de Lisboa. As respostas guardam-se automaticamente.
        </p>

        {error && (
          <p className="mb-6 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-sm px-4 py-3">
            {error}
          </p>
        )}

        <div className="space-y-4">
          {days.map((day) => (
            <section key={day} className="border border-border rounded-sm p-5">
              <h2 className="text-lg font-semibold mb-4 capitalize">{formatDay(day)}</h2>
              <div className="space-y-3">
                {data.slots
                  .filter((slot) => slot.day === day)
                  .map((slot) => (
                    <div key={slot.startsAt} className="flex flex-wrap items-center gap-3">
                      <span className="w-28 text-sm text-foreground/70">
                        {slot.time} – {endTime(slot.time, data.durationMinutes)}
                      </span>
                      <div className="flex gap-2">
                        {choices.map((option) => {
                          const active = mine[slot.startsAt] === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              disabled={savingSlot === slot.startsAt}
                              onClick={() => choose(slot.startsAt, option.value)}
                              className={`text-xs px-3 py-1.5 rounded-sm border transition-colors disabled:opacity-50 ${
                                active ? option.className : "border-border text-foreground/60 hover:bg-accent/40"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 text-sm text-foreground/60">
          Respondidos {answered} de {data.slots.length} horários.
        </p>
      </div>
    </main>
  );
}

function formatDay(day: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Lisbon",
  }).format(new Date(`${day}T12:00:00+01:00`));
}

function endTime(time: string, durationMinutes: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + durationMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
