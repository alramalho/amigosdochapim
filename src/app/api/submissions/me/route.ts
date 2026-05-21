import { NextRequest, NextResponse } from "next/server";
import { ensureCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentContest, formatSubmission } from "@/lib/contest-db";
import { isWithinWindow } from "@/lib/contest";
import { getS3Config, parseUploadDescriptor } from "@/lib/s3";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: NextRequest) {
  const user = await ensureCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contest = await getOrCreateCurrentContest();
  const submission = await prisma.submission.findUnique({
    where: {
      contestId_userId: {
        contestId: contest.id,
        userId: user.id,
      },
    },
    include: { finalMaterials: true, files: true },
  });

  return NextResponse.json({
    contest,
    submission: submission ? formatSubmission(submission) : null,
  });
}

export async function PATCH(request: NextRequest) {
  const user = await ensureCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contest = await getOrCreateCurrentContest();

  if (!isWithinWindow(contest.finalMaterialsOpenAt, contest.finalMaterialsCloseAt)) {
    return NextResponse.json({ error: "A entrega final ainda não está aberta." }, { status: 403 });
  }

  const submission = await prisma.submission.findUnique({
    where: {
      contestId_userId: {
        contestId: contest.id,
        userId: user.id,
      },
    },
  });

  if (!submission || submission.status !== "SELECTED_FOR_FINAL") {
    return NextResponse.json({ error: "Esta candidatura não está selecionada para a fase final." }, { status: 403 });
  }

  const body = await request.json();
  const materialList = text(body.materialList);
  const budgetPlan = text(body.budgetPlan);
  const productionCalendar = text(body.productionCalendar);
  const uploadedFiles = Array.isArray(body.files)
    ? (body.files as unknown[])
        .map(parseUploadDescriptor)
        .filter((file): file is NonNullable<ReturnType<typeof parseUploadDescriptor>> => Boolean(file))
    : [];

  if (!materialList || !budgetPlan || !productionCalendar) {
    return NextResponse.json({ error: "Preenche todos os campos obrigatórios." }, { status: 400 });
  }

  const finalMaterials = await prisma.submissionFinalMaterials.upsert({
    where: { submissionId: submission.id },
    update: {
      materialList,
      budgetPlan,
      productionCalendar,
      externalLinks: text(body.externalLinks) || null,
    },
    create: {
      submissionId: submission.id,
      materialList,
      budgetPlan,
      productionCalendar,
      externalLinks: text(body.externalLinks) || null,
    },
  });

  await prisma.submission.update({
    where: { id: submission.id },
    data: { status: "FINAL_MATERIALS_SUBMITTED" },
  });

  if (uploadedFiles.length > 0) {
    const { bucket } = getS3Config();
    await prisma.$transaction(
      uploadedFiles.map((file) =>
        prisma.submissionFile.upsert({
          where: { objectKey: file.objectKey },
          update: {
            submissionId: submission.id,
            userId: user.id,
            purpose: "FINAL_MATERIAL",
            bucket,
            publicUrl: file.publicUrl,
            fileName: file.fileName,
            contentType: file.contentType,
            sizeBytes: file.sizeBytes,
          },
          create: {
            submissionId: submission.id,
            userId: user.id,
            purpose: "FINAL_MATERIAL",
            bucket,
            objectKey: file.objectKey,
            publicUrl: file.publicUrl,
            fileName: file.fileName,
            contentType: file.contentType,
            sizeBytes: file.sizeBytes,
          },
        })
      )
    );
  }

  return NextResponse.json({ finalMaterials });
}
