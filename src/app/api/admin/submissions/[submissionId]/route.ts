import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { formatSubmission } from "@/lib/contest-db";
import { prisma } from "@/lib/prisma";

async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user || !isAdminEmail(user.email)) {
    return null;
  }

  return user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const user = await requireAdmin(request);

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      finalMaterials: true,
      files: true,
      juryReviews: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json({ submission: formatSubmission(submission) });
}
