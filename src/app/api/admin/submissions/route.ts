import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentContest, formatSubmission } from "@/lib/contest-db";

const submissionStatuses = new Set([
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "SELECTED_FOR_FINAL",
  "FINAL_MATERIALS_SUBMITTED",
  "FINALIST",
  "WINNER",
  "REJECTED",
]);

const excludedSubmissionEmails = new Set([
  "alexandre.ramalho.1998@gmail.com",
  "lia.borges@icloud.com",
]);

async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user || !isAdminEmail(user.email)) {
    return null;
  }

  return user;
}

function canonicalEmail(email: string) {
  const [local, domain] = email.toLowerCase().split("@");
  if (!local || !domain) return email.toLowerCase();
  return `${local.split("+")[0]}@${domain}`;
}

function shouldExcludeSubmission(submission: { email: string }) {
  return excludedSubmissionEmails.has(canonicalEmail(submission.email));
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
  const visibleSubmissions = submissions.filter((submission) => !shouldExcludeSubmission(submission));

  return NextResponse.json({
    contest,
    submissions: visibleSubmissions.map(formatSubmission),
    excludedCount: submissions.length - visibleSubmissions.length,
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

  if (!submissionStatuses.has(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
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
