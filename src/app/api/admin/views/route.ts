import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const [total, daily, byPath] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: since } } }),
    prisma.$queryRaw<{ day: Date; count: number }[]>`
      SELECT date_trunc('day', "created_at") AS day, count(*)::int AS count
      FROM "page_views"
      WHERE "created_at" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
    }),
  ]);

  return NextResponse.json({
    days,
    total,
    daily: daily.map((entry) => ({ day: entry.day, count: Number(entry.count) })),
    byPath: byPath.map((entry) => ({ path: entry.path, count: entry._count._all })),
  });
}
