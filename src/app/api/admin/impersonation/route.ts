import { NextRequest, NextResponse } from "next/server";
import { getAuthIdentity, isAdminEmail } from "@/lib/auth";
import { getOrCreateCurrentContest } from "@/lib/contest-db";
import {
  IMPERSONATION_COOKIE,
  IMPERSONATION_COOKIE_OPTIONS,
  canImpersonate,
} from "@/lib/impersonation";
import { prisma } from "@/lib/prisma";

async function requireRealAdmin(request: NextRequest) {
  const identity = await getAuthIdentity(request);

  if (!identity.realEmail || !isAdminEmail(identity.realEmail)) {
    return null;
  }

  return identity;
}

async function listTargets() {
  const contest = await getOrCreateCurrentContest();
  const [submissions, users] = await Promise.all([
    prisma.submission.findMany({
      where: { contestId: contest.id },
      select: {
        status: true,
        isTest: true,
        candidateName: true,
        user: { select: { email: true, name: true } },
      },
      orderBy: { candidateName: "asc" },
    }),
    prisma.user.findMany({
      select: { email: true, name: true },
      orderBy: { email: "asc" },
    }),
  ]);

  const targets = new Map<
    string,
    { email: string; name: string | null; status: string | null; isTest: boolean }
  >();

  for (const submission of submissions) {
    const email = submission.user.email.toLowerCase();
    targets.set(email, {
      email,
      name: submission.candidateName || submission.user.name,
      status: submission.status,
      isTest: submission.isTest,
    });
  }

  for (const user of users) {
    const email = user.email.toLowerCase();
    if (targets.has(email)) continue;
    targets.set(email, { email, name: user.name, status: null, isTest: false });
  }

  return Array.from(targets.values()).filter((target) => !isAdminEmail(target.email));
}

export async function GET(request: NextRequest) {
  const identity = await requireRealAdmin(request);

  if (!identity) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    realEmail: identity.realEmail,
    impersonatedEmail: identity.isImpersonating ? identity.effectiveEmail : null,
    isImpersonating: identity.isImpersonating,
    targets: await listTargets(),
  });
}

export async function POST(request: NextRequest) {
  const identity = await requireRealAdmin(request);

  if (!identity) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Indica o email a personificar." }, { status: 400 });
  }

  if (!canImpersonate(identity.realEmail!, email)) {
    return NextResponse.json(
      { error: "Não é possível personificar esta conta." },
      { status: 400 }
    );
  }

  const target = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { email: true, name: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Não existe uma conta com este email." }, { status: 404 });
  }

  const response = NextResponse.json({
    isImpersonating: true,
    impersonatedEmail: target.email.toLowerCase(),
  });
  response.cookies.set(IMPERSONATION_COOKIE, target.email.toLowerCase(), IMPERSONATION_COOKIE_OPTIONS);

  return response;
}

export async function DELETE(request: NextRequest) {
  const identity = await requireRealAdmin(request);

  if (!identity) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const response = NextResponse.json({ isImpersonating: false, impersonatedEmail: null });
  response.cookies.set(IMPERSONATION_COOKIE, "", { ...IMPERSONATION_COOKIE_OPTIONS, maxAge: 0 });

  return response;
}
