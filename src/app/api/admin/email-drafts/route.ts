import { NextRequest, NextResponse } from "next/server";
import { getAdminEmails } from "@/lib/admin";
import { getCurrentUserEmail, isAdminEmail } from "@/lib/auth";
import { parseEmailAudienceSegments } from "@/lib/email-audiences";
import { isNewsletterConfigured } from "@/lib/loops";
import { prisma } from "@/lib/prisma";

const MAX_NAME_LENGTH = 120;
const MAX_SUBJECT_LENGTH = 200;
const MAX_PREVIEW_LENGTH = 300;
const MAX_BODY_LENGTH = 50_000;

async function requireAdminEmail(request: NextRequest) {
  const email = await getCurrentUserEmail(request);
  return email && isAdminEmail(email) ? email : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateDraft(value: unknown) {
  const body = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const name = text(body.name);
  const subject = text(body.subject);
  const previewText = text(body.previewText);
  const messageBody = text(body.body);
  const audienceSegments = parseEmailAudienceSegments(body.audienceSegments);

  if (!name || !subject || !messageBody || audienceSegments.length === 0) {
    return { error: "Preenche o nome, assunto, mensagem e pelo menos um público." } as const;
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

  const now = new Date();
  const [drafts, payingMembers, applicants] = await Promise.all([
    prisma.emailDraft.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.subscription.findMany({
      where: { status: "ACTIVE", currentPeriodEnd: { gt: now } },
      select: { user: { select: { email: true } } },
    }),
    prisma.submission.findMany({
      where: { status: { not: "DRAFT" } },
      select: { email: true },
      distinct: ["email"],
    }),
  ]);

  return NextResponse.json({
    drafts,
    audiences: {
      NEWSLETTER: { count: null, external: true },
      PAYING_MEMBERS: { count: new Set(payingMembers.map(({ user }) => user.email.toLowerCase())).size },
      ADMINS: { count: getAdminEmails(process.env.ADMIN_EMAILS).length },
      CONTEST_APPLICANTS: { count: new Set(applicants.map(({ email }) => email.toLowerCase())).size },
    },
    delivery: {
      mode: "draft-only",
      provider: "Loops",
      newsletterConfigured: isNewsletterConfigured(),
    },
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

  const existing = await prisma.emailDraft.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    return NextResponse.json({ error: "Rascunho não encontrado." }, { status: 404 });
  }

  const draft = await prisma.emailDraft.update({ where: { id }, data: validated.data });
  return NextResponse.json({ draft });
}
