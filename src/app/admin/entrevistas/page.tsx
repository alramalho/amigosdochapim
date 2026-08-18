"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Slot = { day: string; time: string; startsAt: string };
type Choice = "YES" | "IF_NEEDED" | "NO";
type Response = { jurorEmail: string; slotStart: string; choice: Choice };

type Payload = {
  durationMinutes: number;
  jurors: string[];
  isAdmin: boolean;
  viewerEmail: string;
  slots: Slot[];
  responses: Response[];
};

export default function AdminEntrevistasPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/jury/availability", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => null);

      if (!response?.ok) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      setData(await response.json());
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center">A carregar...</main>;
  }

  if (forbidden || !data?.isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-foreground/70">Sem acesso.</p>
      </main>
    );
  }

  const byKey = new Map(data.responses.map((item) => [`${item.jurorEmail}|${item.slotStart}`, item.choice]));
  const scored = data.slots.map((slot) => {
    const answers = data.jurors.map((juror) => byKey.get(`${juror}|${slot.startsAt}`));
    return {
      ...slot,
      answers,
      yes: answers.filter((choice) => choice === "YES").length,
      ifNeeded: answers.filter((choice) => choice === "IF_NEEDED").length,
      missing: answers.filter((choice) => !choice).length,
    };
  });

  const total = data.jurors.length;
  const allYes = scored.filter((slot) => slot.yes === total);
  const workable = scored.filter((slot) => slot.yes < total && slot.yes + slot.ifNeeded === total);
  const days = Array.from(new Set(data.slots.map((slot) => slot.day)));
  const viableDays = Array.from(new Set(allYes.map((slot) => slot.day)));
  const responded = data.jurors.filter((juror) =>
    data.responses.some((item) => item.jurorEmail === juror)
  );

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <Link href="/painel" className="text-sm text-foreground/60 hover:text-foreground">
            ← Painel
          </Link>
        </header>

        <h1 className="text-3xl md:text-5xl font-semibold mb-6">Entrevistas · disponibilidade do júri</h1>

        <div className="grid gap-3 sm:grid-cols-3 mb-8">
          <Stat label="Jurados que responderam" value={`${responded.length} / ${total}`} />
          <Stat
            label="Dias com os 3 disponíveis"
            value={`${viableDays.length}`}
            tone={viableDays.length >= 3 ? "good" : "bad"}
          />
          <Stat label="Horários todos Sim" value={`${allYes.length}`} />
        </div>

        {viableDays.length >= 3 ? (
          <p className="mb-8 text-sm border border-emerald-200 bg-emerald-50 text-emerald-900 rounded-sm px-4 py-3">
            Há {viableDays.length} dias em que os três jurados estão disponíveis. Escolhe três e envia
            as datas aos finalistas.
          </p>
        ) : (
          <p className="mb-8 text-sm border border-amber-200 bg-amber-50 text-amber-900 rounded-sm px-4 py-3">
            Ainda não há três dias com os três jurados disponíveis
            {responded.length < total ? " — faltam respostas." : " — considera os horários “se necessário” abaixo."}
          </p>
        )}

        <div className="overflow-x-auto border border-border rounded-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/40 text-left">
                <th className="px-4 py-3 font-medium">Dia</th>
                {Array.from(new Set(data.slots.map((slot) => slot.time))).map((time) => (
                  <th key={time} className="px-4 py-3 font-medium whitespace-nowrap">{time}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="border-t border-border">
                  <td className="px-4 py-3 whitespace-nowrap capitalize">{formatDay(day)}</td>
                  {scored
                    .filter((slot) => slot.day === day)
                    .map((slot) => (
                      <td key={slot.startsAt} className="px-4 py-3">
                        <Cell yes={slot.yes} ifNeeded={slot.ifNeeded} missing={slot.missing} total={total} />
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {workable.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Possíveis com “se necessário”</h2>
            <p className="text-sm text-foreground/60 mb-3">
              Todos disponíveis, mas algum marcou como não ideal. Útil se faltarem dias.
            </p>
            <ul className="text-sm space-y-1">
              {workable.map((slot) => (
                <li key={slot.startsAt} className="text-foreground/70 capitalize">
                  {formatDay(slot.day)} às {slot.time}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-3">Jurados</h2>
          <ul className="text-sm space-y-1">
            {data.jurors.map((juror) => (
              <li key={juror} className="text-foreground/70">
                {juror} —{" "}
                {data.responses.some((item) => item.jurorEmail === juror) ? (
                  <span className="text-emerald-700">respondeu</span>
                ) : (
                  <span className="text-amber-700">sem resposta</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  const toneClass =
    tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-amber-700" : "text-foreground";

  return (
    <div className="border border-border rounded-sm px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function Cell({ yes, ifNeeded, missing, total }: { yes: number; ifNeeded: number; missing: number; total: number }) {
  if (yes === total) {
    return <span className="inline-block px-2 py-1 rounded-sm border border-emerald-300 bg-emerald-100 text-emerald-900 text-xs">3 Sim</span>;
  }

  if (yes + ifNeeded === total) {
    return <span className="inline-block px-2 py-1 rounded-sm border border-amber-300 bg-amber-100 text-amber-900 text-xs">{yes} Sim · {ifNeeded} talvez</span>;
  }

  return (
    <span className="text-xs text-foreground/50">
      {yes} Sim{missing > 0 ? ` · ${missing} s/ resposta` : ""}
    </span>
  );
}

function formatDay(day: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Lisbon",
  }).format(new Date(`${day}T12:00:00+01:00`));
}
