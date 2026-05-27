import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentContest } from "@/lib/contest-db";
import { isWithinWindow } from "@/lib/contest";
import { getS3Config, parseUploadDescriptor } from "@/lib/s3";
import { userHasJuryAccess } from "@/lib/auth";
import { sendSubmissionAdminEmails, sendSubmissionConfirmationEmail } from "@/lib/loops";

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
  const contest = await getOrCreateCurrentContest();

  if (
    contest.status !== "APPLICATIONS_OPEN" ||
    !isWithinWindow(contest.applicationsOpenAt, contest.applicationsCloseAt)
  ) {
    return NextResponse.json({ error: "As candidaturas não estão abertas." }, { status: 403 });
  }

  const body = await request.json();
  const missing = requiredFields.filter((field) => !text(body[field]));
  const email = text(body.email).toLowerCase();

  if (missing.length > 0 || !email.includes("@") || Number.isNaN(Number(body.age)) || !body.residentInPortugal) {
    return NextResponse.json({ error: "Preenche todos os campos obrigatórios." }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
    include: {
      subscription: true,
      donations: true,
    },
  });

  if (userHasJuryAccess(user)) {
    return NextResponse.json({ error: "Membros do júri não podem submeter candidaturas." }, { status: 403 });
  }

  const cvFile = parseUploadDescriptor(body.cvFile);
  const { bucket } = getS3Config();
  const existingSubmission = await prisma.submission.findUnique({
    where: {
      contestId_userId: {
        contestId: contest.id,
        userId: user.id,
      },
    },
  });

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

  if (cvFile) {
    await prisma.submissionFile.upsert({
      where: { objectKey: cvFile.objectKey },
      update: {
        submissionId: submission.id,
        userId: user.id,
        purpose: "CV",
        bucket,
        publicUrl: cvFile.publicUrl,
        fileName: cvFile.fileName,
        contentType: cvFile.contentType,
        sizeBytes: cvFile.sizeBytes,
      },
      create: {
        submissionId: submission.id,
        userId: user.id,
        purpose: "CV",
        bucket,
        objectKey: cvFile.objectKey,
        publicUrl: cvFile.publicUrl,
        fileName: cvFile.fileName,
        contentType: cvFile.contentType,
        sizeBytes: cvFile.sizeBytes,
      },
    });
  }

  const emailResults = await Promise.allSettled([
    sendSubmissionConfirmationEmail({
      submissionId: submission.id,
      candidateName: submission.candidateName,
      email: submission.email,
      phone: submission.phone,
      age: submission.age,
      synopsis: submission.synopsis,
      contestTitle: contest.title,
      submittedAt: submission.updatedAt,
      isUpdate: Boolean(existingSubmission),
    }),
    sendSubmissionAdminEmails({
      submissionId: submission.id,
      candidateName: submission.candidateName,
      email: submission.email,
      phone: submission.phone,
      age: submission.age,
      synopsis: submission.synopsis,
      contestTitle: contest.title,
      submittedAt: submission.updatedAt,
      isUpdate: Boolean(existingSubmission),
    }),
  ]);

  emailResults.forEach((result) => {
    if (result.status === "rejected") {
      console.error("Failed to send submission email:", result.reason);
    }
  });

  return NextResponse.json({ submission });
}
