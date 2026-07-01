"use client";

import { geoMercator, geoNaturalEarth1, geoPath, type ExtendedFeatureCollection } from "d3-geo";
import { useEffect, useMemo, useState } from "react";

type District = { code: string; district: string; count: number };
type Country = { country: string; count: number };
type Point = { lat: number; lng: number; country: string | null };

type FeatureCollection = {
  features: { properties: Record<string, string>; geometry: unknown; type: string }[];
};

const W = 640;
const H = 560;

export function ViewsMap({
  byDistrict,
  byCountry,
  precisePoints,
}: {
  byDistrict: District[];
  byCountry: Country[];
  precisePoints: Point[];
}) {
  const [mode, setMode] = useState<"pt" | "world">("pt");
  const [pt, setPt] = useState<FeatureCollection | null>(null);
  const [world, setWorld] = useState<FeatureCollection | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);

  useEffect(() => {
    fetch("/maps/pt-districts.json").then((r) => r.json()).then(setPt).catch(() => {});
    fetch("/maps/world-countries.json").then((r) => r.json()).then(setWorld).catch(() => {});
  }, []);

  const districtByCode = useMemo(() => new Map(byDistrict.map((d) => [d.code, d])), [byDistrict]);
  const countByCountry = useMemo(() => new Map(byCountry.map((c) => [c.country, c.count])), [byCountry]);

  const geo = mode === "pt" ? pt : world;

  const projection = useMemo(() => {
    if (!geo) return null;
    const p = mode === "pt" ? geoMercator() : geoNaturalEarth1();
    p.fitSize([W, H], geo as unknown as ExtendedFeatureCollection);
    return p;
  }, [geo, mode]);

  const pathGen = useMemo(() => (projection ? geoPath(projection) : null), [projection]);

  const max = useMemo(
    () =>
      mode === "pt"
        ? Math.max(1, ...byDistrict.map((d) => d.count))
        : Math.max(1, ...byCountry.map((c) => c.count)),
    [mode, byDistrict, byCountry]
  );

  const points = useMemo(
    () => (mode === "pt" ? precisePoints.filter((p) => p.country === "PT") : precisePoints),
    [mode, precisePoints]
  );

  const fillOpacity = (count: number) => (count > 0 ? 0.15 + 0.75 * (count / max) : 0.05);

  return (
    <div className="border border-border rounded-sm p-5 bg-foreground/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm uppercase tracking-wide text-foreground/50">Por localização</h2>
        <div className="flex gap-2">
          {(["pt", "world"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-sm rounded-sm border ${
                mode === m
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-accent/30"
              }`}
            >
              {m === "pt" ? "Portugal" : "Mundo"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {pathGen &&
            geo?.features.map((feature, index) => {
              const isPt = mode === "pt";
              const code = isPt
                ? feature.properties.DI
                : feature.properties.ISO_A2_EH || feature.properties.ISO_A2;
              const count = isPt
                ? districtByCode.get(code)?.count ?? 0
                : countByCountry.get(code) ?? 0;
              const name = isPt
                ? districtByCode.get(code)?.district ?? feature.properties.Distrito
                : feature.properties.NAME;
              const d = pathGen(feature as unknown as GeoJSON.Feature);
              if (!d) return null;
              return (
                <path
                  key={index}
                  d={d}
                  fill="var(--primary)"
                  fillOpacity={fillOpacity(count)}
                  stroke="var(--background)"
                  strokeWidth={0.5}
                  className="cursor-default transition-[fill-opacity]"
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget.ownerSVGElement as SVGElement).getBoundingClientRect();
                    setTooltip({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      label: `${name}: ${count}`,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}

          {projection &&
            points.map((p, index) => {
              const xy = projection([p.lng, p.lat]);
              if (!xy) return null;
              return (
                <circle
                  key={`pt-${index}`}
                  cx={xy[0]}
                  cy={xy[1]}
                  r={3}
                  fill="#059669"
                  fillOpacity={0.8}
                  stroke="var(--background)"
                  strokeWidth={0.75}
                />
              );
            })}
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-sm bg-foreground text-background text-xs px-2 py-1 -translate-x-1/2 -translate-y-full"
            style={{ left: tooltip.x, top: tooltip.y - 6 }}
          >
            {tooltip.label}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-foreground/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-primary/60" /> Estimativa (sombreado, por IP)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-600" /> Verificado (localização partilhada)
        </span>
      </div>
    </div>
  );
}
