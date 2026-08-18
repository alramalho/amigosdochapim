import { NextRequest, NextResponse } from "next/server";
import { getAuthIdentity, isAdminEmail } from "@/lib/auth";
import { getOrCreateCurrentContest } from "@/lib/contest-db";
import { getExternalJurorEmails } from "@/lib/interviews";
import {
  IMPERSONATION_COOKIE,
  IMPERSONATION_COOKIE_OPTIONS,
  canImpersonate,
} from "@/lib/impersonation";
import { isSpecialJurorEmail } from "@/lib/jury";
import { prisma } from "@/lib/prisma";

async function requireRealAdmin(request: NextRequest) {
  const identity = await getAuthIdentity(request);

  if (!identity.realEmail || !isAdminEmail(identity.realEmail)) {
    return null;
  }

  return identity;
}

type Target = {
  email: string;
  name: string | null;
  status: string | null;
  isTest: boolean;
  roles: string[];
};

// Roles are derived from existing data, never stored.
function rolesFor(email: string, hasSubmission: boolean, hasContributed: boolean) {
  const roles: string[] = [];

  if (isAdminEmail(email)) roles.push("ADMIN");
  if (isSpecialJurorEmail(email) && !isAdminEmail(email)) roles.push("EXTERNAL_JUROR");
  if (hasSubmission) roles.push("CANDIDATE");
  if (hasContributed) roles.push("CONTRIBUTOR");

  return roles;
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
      select: {
        email: true,
        name: true,
        donations: { select: { id: true }, take: 1 },
        subscription: { select: { id: true } },
      },
      orderBy: { email: "asc" },
    }),
  ]);

  const contributed = new Set(
    users
      .filter((user) => user.donations.length > 0 || user.subscription)
      .map((user) => user.email.toLowerCase())
  );

  const targets = new Map<string, Target>();

  for (const submission of submissions) {
    const email = submission.user.email.toLowerCase();
    targets.set(email, {
      email,
      name: submission.candidateName || submission.user.name,
      status: submission.status,
      isTest: submission.isTest,
      roles: rolesFor(email, true, contributed.has(email)),
    });
  }

  for (const user of users) {
    const email = user.email.toLowerCase();
    if (targets.has(email)) continue;
    targets.set(email, {
      email,
      name: user.name,
      status: null,
      isTest: false,
      roles: rolesFor(email, false, contributed.has(email)),
    });
  }

  // External jurors are impersonatable before they ever log in.
  for (const email of getExternalJurorEmails()) {
    if (targets.has(email)) continue;
    targets.set(email, {
      email,
      name: null,
      status: null,
      isTest: false,
      roles: rolesFor(email, false, false),
    });
  }

  return Array.from(targets.values())
    .filter((target) => !isAdminEmail(target.email))
    .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email, "pt"));
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

  let target = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { email: true, name: true },
  });

  // Jurors on the known list may not have signed in yet; their row is created on
  // first use exactly as it would be on their first login.
  if (!target && isSpecialJurorEmail(email)) {
    target = await prisma.user.create({
      data: { email },
      select: { email: true, name: true },
    });
  }

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
