import { NextRequest, NextResponse } from "next/server";
import { isNewsletterConfigured, subscribeToNewsletter } from "@/lib/loops";

const MAX_SOURCE_LENGTH = 80;
const MAX_PAGE_PATH_LENGTH = 300;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const email = text(body.email).toLowerCase();
  const source = text(body.source).slice(0, MAX_SOURCE_LENGTH) || "newsletter";
  const pagePath = text(body.pagePath).slice(0, MAX_PAGE_PATH_LENGTH) || request.headers.get("referer") || "";
  const honeypot = text(body.company);

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Introduz um email válido." }, { status: 400 });
  }

  if (!isNewsletterConfigured()) {
    return NextResponse.json(
      { error: "A newsletter ainda não está configurada." },
      { status: 503 },
    );
  }

  try {
    await subscribeToNewsletter({ email, source, pagePath });
  } catch (error) {
    console.error("Newsletter signup failed:", error);
    return NextResponse.json(
      { error: "Não foi possível guardar o email. Tenta novamente." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
