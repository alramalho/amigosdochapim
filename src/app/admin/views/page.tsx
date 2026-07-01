"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format, startOfDay, subDays } from "date-fns";
import { getAdminEmails } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { ViewsMap } from "@/components/views-map";

type ViewsData = {
  days: number;
  total: number;
  daily: { day: string; count: number }[];
  byPath: { path: string; count: number }[];
  byDistrict: { code: string; district: string; count: number }[];
  byCountry: { country: string; count: number }[];
  precisePoints: { lat: number; lng: number; country: string | null }[];
};

const ranges = [7, 30, 90];

export default function AdminViewsPage() {
  const router = useRouter();
  const [data, setData] = useState<ViewsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const load = (token: string, range: number) => {
    return fetch(`/api/admin/views?days=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((result) => setData(result));
  };

  useEffect(() => {
    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/entrar");
        return;
      }

      const email = session.user.email?.toLowerCase();
      const isAdmin = !!email && getAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS).includes(email);

      if (!isAdmin) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);
      setAccessToken(session.access_token);
      await load(session.access_token, days)
        .catch(() => setAuthorized(false))
        .finally(() => setLoading(false));
    }

    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const changeRange = async (range: number) => {
    setDays(range);
    if (accessToken) await load(accessToken, range);
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center">A carregar visualizações...</main>;
  }

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-sm uppercase tracking-wide text-primary font-medium mb-2">Sem autorização</p>
          <h1 className="text-3xl font-semibold mb-4">Não tens acesso a esta página.</h1>
          <p className="text-foreground/70 mb-6">
            Esta área é reservada aos administradores dos Amigos do Chapim.
          </p>
          <Link href="/painel" className="inline-flex px-5 py-3 border border-border rounded-sm hover:bg-accent/30">
            Voltar ao painel
          </Link>
        </div>
      </main>
    );
  }

  const dailyMap = new Map((data?.daily || []).map((entry) => [format(new Date(entry.day), "yyyy-MM-dd"), entry.count]));
  const series = Array.from({ length: days }, (_, index) => {
    const date = subDays(startOfDay(new Date()), days - 1 - index);
    return { date, count: dailyMap.get(format(date, "yyyy-MM-dd")) ?? 0 };
  });
  const maxCount = Math.max(1, ...series.map((point) => point.count));

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <Link href="/painel" className="text-sm text-foreground/60 hover:text-foreground">
            ← Painel
          </Link>
          <Link href="/admin/candidaturas" className="text-sm text-foreground/60 hover:text-foreground">
            Candidaturas
          </Link>
        </header>

        <h1 className="text-3xl md:text-5xl font-semibold mb-3">Visualizações</h1>
        <p className="text-foreground/70 mb-6 max-w-3xl">
          Visualizações de páginas registadas ao longo do tempo. Páginas de admin não são contabilizadas.
        </p>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {ranges.map((range) => (
              <button
                key={range}
                onClick={() => changeRange(range)}
                className={`px-3 py-1.5 text-sm rounded-sm border ${
                  days === range
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-accent/30"
                }`}
              >
                {range} dias
              </button>
            ))}
          </div>
          <p className="text-sm text-foreground/60">
            Total no período: <span className="font-semibold text-foreground">{data?.total ?? 0}</span>
          </p>
        </div>

        <div className="border border-border rounded-sm p-5 bg-foreground/5 mb-10">
          <h2 className="text-sm uppercase tracking-wide text-foreground/50 mb-4">Por dia</h2>
          <div className="flex items-end gap-[2px] h-48">
            {series.map((point) => (
              <div
                key={point.date.toISOString()}
                className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm"
                style={{ height: `${(point.count / maxCount) * 100}%` }}
                title={`${format(point.date, "dd/MM/yyyy")}: ${point.count} visualizações`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-foreground/50">
            <span>{series.length ? format(series[0].date, "dd/MM") : ""}</span>
            <span>{series.length ? format(series[series.length - 1].date, "dd/MM") : ""}</span>
          </div>
        </div>

        {data && (
          <div className="mb-10">
            <ViewsMap
              byDistrict={data.byDistrict || []}
              byCountry={data.byCountry || []}
              precisePoints={data.precisePoints || []}
            />
          </div>
        )}

        <div className="border border-border rounded-sm overflow-hidden bg-foreground/5">
          <div className="grid grid-cols-[1fr_120px] p-4 border-b border-border text-xs uppercase tracking-wide text-foreground/50">
            <span>Página</span>
            <span className="text-right">Visualizações</span>
          </div>
          {(data?.byPath || []).map((entry) => (
            <div key={entry.path} className="grid grid-cols-[1fr_120px] p-4 border-t border-border first:border-t-0 text-sm">
              <span className="truncate text-foreground/80">{entry.path}</span>
              <span className="text-right font-medium">{entry.count}</span>
            </div>
          ))}
          {!(data?.byPath || []).length && (
            <p className="p-4 text-sm text-foreground/50">Ainda sem visualizações registadas neste período.</p>
          )}
        </div>
      </div>
    </main>
  );
}
