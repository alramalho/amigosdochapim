import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateCurrentContest } from "@/lib/contest-db";
import { canSubmitFinalMaterials, isWithinWindow } from "@/lib/contest";
import { createPresignedUploadUrl, validateUploadRequest, type UploadPurpose } from "@/lib/s3";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  const body = await request.json();
  const upload = validateUploadRequest(body);

  if ("error" in upload) {
    return NextResponse.json({ error: upload.error }, { status: 400 });
  }

  const contest = await getOrCreateCurrentContest();

  if (
    upload.purpose === "CV" &&
    (contest.status !== "APPLICATIONS_OPEN" ||
      !isWithinWindow(contest.applicationsOpenAt, contest.applicationsCloseAt))
  ) {
    return NextResponse.json({ error: "As candidaturas estão encerradas." }, { status: 403 });
  }

  if (upload.purpose === "FINAL_MATERIAL") {
    if (!user) {
      return NextResponse.json({ error: "Inicia sessão para enviar os materiais finais." }, { status: 401 });
    }

    if (!isWithinWindow(contest.finalMaterialsOpenAt, contest.finalMaterialsCloseAt)) {
      return NextResponse.json({ error: "A entrega dos materiais finais não está aberta." }, { status: 403 });
    }

    const submission = await prisma.submission.findUnique({
      where: {
        contestId_userId: {
          contestId: contest.id,
          userId: user.id,
        },
      },
      select: { status: true },
    });

    if (!submission || !canSubmitFinalMaterials(submission.status)) {
      return NextResponse.json({ error: "Esta candidatura não está selecionada para a fase final." }, { status: 403 });
    }
  }

  const presigned = await createPresignedUploadUrl({
    ownerSegment: user ? `users/${user.id}` : `pending/${crypto.randomUUID()}`,
    contestSlug: contest.slug,
    purpose: upload.purpose as UploadPurpose,
    fileName: upload.fileName,
    contentType: upload.contentType,
  });

  return NextResponse.json({
    ...presigned,
    fileName: upload.fileName,
    contentType: upload.contentType,
    sizeBytes: upload.sizeBytes,
  });
}
