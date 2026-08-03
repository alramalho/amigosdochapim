import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserEmail, isAdminEmail } from "@/lib/auth";
import { parseEmailAudienceSegments } from "@/lib/email-audiences";
import { getEmailAudienceData } from "@/lib/email-recipients";
import { prisma } from "@/lib/prisma";
import { getSesDeliveryConfig } from "@/lib/ses";

const MAX_NAME_LENGTH = 120;
const MAX_SUBJECT_LENGTH = 200;
const MAX_PREVIEW_LENGTH = 300;
const MAX_BODY_LENGTH = 50_000;
const MAX_EMAIL_LENGTH = 320;
const MAX_RECIPIENTS = 5_000;

async function requireAdminEmail(request: NextRequest) {
  const email = await getCurrentUserEmail(request);
  return email && isAdminEmail(email) ? email : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseRecipientSelections(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((selection) => text(selection))
        .filter(Boolean)
        .map((selection) => {
          const separator = selection.indexOf("|");
          return `${selection.slice(0, separator)}|${selection
            .slice(separator + 1)
            .toLowerCase()}`;
        })
    )
  );
}

function validateDraft(value: unknown) {
  const body = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const name = text(body.name);
  const subject = text(body.subject);
  const previewText = text(body.previewText);
  const messageBody = text(body.body);
  const audienceSegments = parseEmailAudienceSegments(body.audienceSegments);
  const recipientEmail = text(body.recipientEmail).toLowerCase();
  const recipientSelections = parseRecipientSelections(body.recipientSelections);

  if (
    !name ||
    !subject ||
    !messageBody ||
    (audienceSegments.length === 0 && !recipientEmail && recipientSelections.length === 0)
  ) {
    return { error: "Preenche o nome, assunto, mensagem e destinatário." } as const;
  }

  if (recipientSelections.length > 0 && (audienceSegments.length > 0 || recipientEmail)) {
    return { error: "Usa apenas a nova seleção de destinatários." } as const;
  }

  if (
    recipientEmail &&
    (recipientEmail.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail))
  ) {
    return { error: "Introduz um email válido para o destinatário." } as const;
  }

  if (
    recipientSelections.length > MAX_RECIPIENTS ||
    recipientSelections.some((selection) => {
      const separator = selection.indexOf("|");
      const segment = selection.slice(0, separator);
      const email = selection.slice(separator + 1).toLowerCase();
      return (
        separator < 1 ||
        !parseEmailAudienceSegments([segment]).length ||
        email.length > MAX_EMAIL_LENGTH ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );
    })
  ) {
    return { error: "A seleção contém destinatários inválidos." } as const;
  }

  if (name.length > MAX_NAME_LENGTH) {
    return { error: `O nome do rascunho não pode exceder ${MAX_NAME_LENGTH} caracteres.` } as const;
  }

  if (subject.length > MAX_SUBJECT_LENGTH) {
    return { error: `O assunto não pode exceder ${MAX_SUBJECT_LENGTH} caracteres.` } as const;
  }

  if (previewText.length > MAX_PREVIEW_LENGTH) {
    return { error: `O texto de pré-visualização não pode exceder ${MAX_PREVIEW_LENGTH} caracteres.` } as const;
  }

  if (messageBody.length > MAX_BODY_LENGTH) {
    return { error: `A mensagem não pode exceder ${MAX_BODY_LENGTH} caracteres.` } as const;
  }

  return {
    data: {
      name,
      subject,
      previewText: previewText || null,
      body: messageBody,
      audienceSegments,
      recipientEmail: recipientEmail || null,
      recipientSelections,
    },
  } as const;
}

async function requestJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const adminEmail = await requireAdminEmail(request);

  if (!adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [drafts, audienceData, sends] = await Promise.all([
    prisma.emailDraft.findMany({
      orderBy: { updatedAt: "desc" },
      include: { emailSend: true },
    }),
    getEmailAudienceData(),
    prisma.emailSend.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        draftId: true,
        name: true,
        subject: true,
        status: true,
        recipientCount: true,
        acceptedCount: true,
        deliveredCount: true,
        failedCount: true,
        archiveStatus: true,
        archiveError: true,
        createdByEmail: true,
        createdAt: true,
        completedAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    drafts,
    sends,
    audiences: audienceData.audiences,
    people: audienceData.people,
    audienceMembers: audienceData.audienceMembers,
    delivery: getSesDeliveryConfig(),
  });
}

export async function POST(request: NextRequest) {
  const adminEmail = await requireAdminEmail(request);

  if (!adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const validated = validateDraft(await requestJson(request));

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const draft = await prisma.emailDraft.create({
    data: { ...validated.data, createdByEmail: adminEmail },
  });

  return NextResponse.json({ draft }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const adminEmail = await requireAdminEmail(request);

  if (!adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requestBody = await requestJson(request);
  const id = text(requestBody && typeof requestBody === "object" ? requestBody.id : null);

  if (!id) {
    return NextResponse.json({ error: "Rascunho inválido." }, { status: 400 });
  }

  const validated = validateDraft(requestBody);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const existing = await prisma.emailDraft.findUnique({
    where: { id },
    select: { id: true, sentAt: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Rascunho não encontrado." }, { status: 404 });
  }

  if (existing.sentAt) {
    return NextResponse.json(
      { error: "Este email já foi enviado e ficou bloqueado como histórico." },
      { status: 409 }
    );
  }

  const draft = await prisma.emailDraft.update({ where: { id }, data: validated.data });
  return NextResponse.json({ draft });
}
