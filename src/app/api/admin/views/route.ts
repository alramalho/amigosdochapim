import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ptDistrictCode, PT_DISTRICTS } from "@/lib/geo";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requestedDays = Number(new URL(request.url).searchParams.get("days"));
  const days = Math.min(Math.max(Number.isFinite(requestedDays) ? requestedDays : 30, 1), 365);

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));
  const where = { createdAt: { gte: since } };

  const [total, daily, byPath, ptRegions, countries, precisePoints] = await Promise.all([
    prisma.pageView.count({ where }),
    prisma.$queryRaw<{ day: Date; count: number }[]>`
      SELECT date_trunc('day', "created_at") AS day, count(*)::int AS count
      FROM "page_views"
      WHERE "created_at" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.pageView.groupBy({
      by: ["path"],
      where,
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
    }),
    prisma.pageView.groupBy({
      by: ["region"],
      where: { ...where, country: "PT" },
      _count: { _all: true },
    }),
    prisma.pageView.groupBy({
      by: ["country"],
      where,
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
    }),
    prisma.pageView.findMany({
      where: { ...where, precise: true, latitude: { not: null }, longitude: { not: null } },
      select: { latitude: true, longitude: true, country: true },
      take: 3000,
    }),
  ]);

  // Aggregate PT views by district code (matches the GeoJSON "DI" property).
  const districtCounts = new Map<string, number>();
  for (const row of ptRegions) {
    const code = ptDistrictCode(row.region);
    if (code) districtCounts.set(code, (districtCounts.get(code) ?? 0) + row._count._all);
  }

  return NextResponse.json({
    days,
    total,
    daily: daily.map((entry) => ({ day: entry.day, count: Number(entry.count) })),
    byPath: byPath.map((entry) => ({ path: entry.path, count: entry._count._all })),
    byDistrict: Array.from(districtCounts, ([code, count]) => ({
      code,
      district: PT_DISTRICTS[code],
      count,
    })).sort((a, b) => b.count - a.count),
    byCountry: countries
      .filter((entry) => entry.country)
      .map((entry) => ({ country: entry.country as string, count: entry._count._all })),
    precisePoints: precisePoints.map((p) => ({
      lat: p.latitude as number,
      lng: p.longitude as number,
      country: p.country,
    })),
  });
}
