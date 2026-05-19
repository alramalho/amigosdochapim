import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, userHasJuryAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function score(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 5) return null;
  return number;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const user = await getCurrentUser(request);

  if (!user || !userHasJuryAccess(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId } = await params;
  const review = await prisma.juryReview.findUnique({
    where: {
      submissionId_jurorId: {
        submissionId,
        jurorId: user.id,
      },
    },
  });

  return NextResponse.json({ review });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const user = await getCurrentUser(request);

  if (!user || !userHasJuryAccess(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId } = await params;
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });

  if (!submission || !["FINAL_MATERIALS_SUBMITTED", "FINALIST", "WINNER"].includes(submission.status)) {
    return NextResponse.json({ error: "Submission not available to jury." }, { status: 404 });
  }

  const body = await request.json();
  const review = await prisma.juryReview.upsert({
    where: {
      submissionId_jurorId: {
        submissionId,
        jurorId: user.id,
      },
    },
    update: {
      artisticQuality: score(body.artisticQuality),
      originality: score(body.originality),
      argumentClarity: score(body.argumentClarity),
      aestheticVision: score(body.aestheticVision),
      budgetViability: score(body.budgetViability),
      motivation: score(body.motivation),
      notes: text(body.notes) || null,
    },
    create: {
      submissionId,
      jurorId: user.id,
      artisticQuality: score(body.artisticQuality),
      originality: score(body.originality),
      argumentClarity: score(body.argumentClarity),
      aestheticVision: score(body.aestheticVision),
      budgetViability: score(body.budgetViability),
      motivation: score(body.motivation),
      notes: text(body.notes) || null,
    },
  });

  return NextResponse.json({ review });
}
