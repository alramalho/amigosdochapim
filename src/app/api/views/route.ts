import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function coord(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function POST(request: NextRequest) {
  let body: { path?: unknown; lat?: unknown; lng?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const path = body.path;
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 512) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  // Don't count admin/internal pages.
  if (path.startsWith("/admin")) {
    return NextResponse.json({ ok: true });
  }

  // Coarse, IP-derived estimate from Vercel's edge headers (never the raw IP).
  const cityRaw = request.headers.get("x-vercel-ip-city");
  const country = request.headers.get("x-vercel-ip-country") || null;
  const region = request.headers.get("x-vercel-ip-country-region") || null;
  const city = cityRaw ? decodeURIComponent(cityRaw) : null;

  // Precise location, only present when the visitor opted in.
  const latitude = coord(body.lat);
  const longitude = coord(body.lng);
  const precise = latitude !== null && longitude !== null;

  await prisma.pageView.create({
    data: { path, country, region, city, latitude, longitude, precise },
  });

  return NextResponse.json({ ok: true });
}
