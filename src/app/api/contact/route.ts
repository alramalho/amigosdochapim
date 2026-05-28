import { NextRequest, NextResponse } from "next/server";
import { isContactHelpEmailConfigured, sendContactHelpAdminEmails } from "@/lib/loops";

const MAX_MESSAGE_LENGTH = 4000;

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

  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const subject = text(body.subject) || "Pedido de ajuda";
  const message = text(body.message);
  const context = text(body.context) || "Contacto geral";
  const pageUrl = text(body.pageUrl) || request.headers.get("referer") || "Sem página indicada";
  const honeypot = text(body.company);

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !isValidEmail(email) || !message) {
    return NextResponse.json({ error: "Preenche o nome, email e mensagem." }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "A mensagem é demasiado longa." }, { status: 400 });
  }

  if (!isContactHelpEmailConfigured()) {
    return NextResponse.json(
      { error: "O formulário de contacto ainda não está ativo. Contacta-nos por email: geral@amigosdochapim.org." },
      { status: 503 }
    );
  }

  await sendContactHelpAdminEmails({
    requesterName: name,
    requesterEmail: email,
    subject,
    message,
    context,
    pageUrl,
    userAgent: request.headers.get("user-agent") || "",
    submittedAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}
