import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentContest, formatSubmission } from "@/lib/contest-db";

async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user || !isAdminEmail(user.email)) {
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contest = await getOrCreateCurrentContest();
  const submissions = await prisma.submission.findMany({
    where: { contestId: contest.id },
    include: {
      finalMaterials: true,
      files: true,
      juryReviews: true,
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    contest,
    submissions: submissions.map(formatSubmission),
  });
}

export async function PATCH(request: NextRequest) {
  const user = await requireAdmin(request);

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  if (typeof body.submissionId !== "string" || typeof body.status !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const submission = await prisma.submission.update({
    where: { id: body.submissionId },
    data: { status: body.status },
    include: {
      finalMaterials: true,
      files: true,
      juryReviews: true,
      user: { select: { email: true, name: true } },
    },
  });

  return NextResponse.json({ submission: formatSubmission(submission) });
}
