import { NextRequest, NextResponse } from "next/server";
import { ensureCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentContest } from "@/lib/contest-db";
import { isWithinWindow } from "@/lib/contest";

const requiredFields = [
  "candidateName",
  "age",
  "email",
  "phone",
  "motivation",
  "synopsis",
  "plotPoints",
  "scriptSummary",
  "visualIdeas",
] as const;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const user = await ensureCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contest = await getOrCreateCurrentContest();

  if (
    contest.status !== "APPLICATIONS_OPEN" ||
    !isWithinWindow(contest.applicationsOpenAt, contest.applicationsCloseAt)
  ) {
    return NextResponse.json({ error: "As candidaturas não estão abertas." }, { status: 403 });
  }

  const body = await request.json();
  const missing = requiredFields.filter((field) => !text(body[field]));

  if (missing.length > 0 || Number.isNaN(Number(body.age)) || !body.residentInPortugal) {
    return NextResponse.json({ error: "Preenche todos os campos obrigatórios." }, { status: 400 });
  }

  const submission = await prisma.submission.upsert({
    where: {
      contestId_userId: {
        contestId: contest.id,
        userId: user.id,
      },
    },
    update: {
      candidateName: text(body.candidateName),
      age: Number(body.age),
      email: text(body.email),
      phone: text(body.phone),
      residentInPortugal: Boolean(body.residentInPortugal),
      cvUrl: text(body.cvUrl) || null,
      motivation: text(body.motivation),
      synopsis: text(body.synopsis),
      plotPoints: text(body.plotPoints),
      scriptSummary: text(body.scriptSummary),
      visualIdeas: text(body.visualIdeas),
      externalLinks: text(body.externalLinks) || null,
      status: "SUBMITTED",
    },
    create: {
      contestId: contest.id,
      userId: user.id,
      candidateName: text(body.candidateName),
      age: Number(body.age),
      email: text(body.email),
      phone: text(body.phone),
      residentInPortugal: Boolean(body.residentInPortugal),
      cvUrl: text(body.cvUrl) || null,
      motivation: text(body.motivation),
      synopsis: text(body.synopsis),
      plotPoints: text(body.plotPoints),
      scriptSummary: text(body.scriptSummary),
      visualIdeas: text(body.visualIdeas),
      externalLinks: text(body.externalLinks) || null,
      status: "SUBMITTED",
    },
  });

  return NextResponse.json({ submission });
}
