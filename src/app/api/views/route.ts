import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let path: unknown;

  try {
    ({ path } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof path !== "string" || !path.startsWith("/") || path.length > 512) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  // Don't count admin/internal pages.
  if (path.startsWith("/admin")) {
    return NextResponse.json({ ok: true });
  }

  await prisma.pageView.create({ data: { path } });

  return NextResponse.json({ ok: true });
}
