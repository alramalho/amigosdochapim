import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, userHasJuryAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentContest, formatSubmission } from "@/lib/contest-db";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user || !userHasJuryAccess(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contest = await getOrCreateCurrentContest();
  const submissions = await prisma.submission.findMany({
    where: {
      contestId: contest.id,
      status: {
        in: ["FINAL_MATERIALS_SUBMITTED", "FINALIST", "WINNER"],
      },
    },
    include: {
      finalMaterials: true,
      files: true,
      juryReviews: {
        where: { jurorId: user.id },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const ranking = await prisma.juryRanking.findUnique({
    where: {
      contestId_jurorId: {
        contestId: contest.id,
        jurorId: user.id,
      },
    },
  });

  return NextResponse.json({
    contest,
    submissions: submissions.map(formatSubmission),
    ranking,
  });
}
