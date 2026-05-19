import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, userHasJuryAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentContest } from "@/lib/contest-db";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user || !userHasJuryAccess(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contest = await getOrCreateCurrentContest();
  const body = await request.json();
  const orderedSubmissionIds = Array.isArray(body.orderedSubmissionIds)
    ? body.orderedSubmissionIds.filter((id: unknown) => typeof id === "string")
    : [];
  const uniqueIds = new Set(orderedSubmissionIds);

  if (orderedSubmissionIds.length === 0 || uniqueIds.size !== orderedSubmissionIds.length) {
    return NextResponse.json({ error: "Ranking inválido." }, { status: 400 });
  }

  const eligibleCount = await prisma.submission.count({
    where: {
      contestId: contest.id,
      id: { in: orderedSubmissionIds },
      status: { in: ["FINAL_MATERIALS_SUBMITTED", "FINALIST", "WINNER"] },
    },
  });

  if (eligibleCount !== orderedSubmissionIds.length) {
    return NextResponse.json({ error: "O ranking inclui candidaturas inválidas." }, { status: 400 });
  }

  const ranking = await prisma.juryRanking.upsert({
    where: {
      contestId_jurorId: {
        contestId: contest.id,
        jurorId: user.id,
      },
    },
    update: {
      orderedSubmissionIds,
      submittedAt: body.submit ? new Date() : null,
    },
    create: {
      contestId: contest.id,
      jurorId: user.id,
      orderedSubmissionIds,
      submittedAt: body.submit ? new Date() : null,
    },
  });

  return NextResponse.json({ ranking });
}
