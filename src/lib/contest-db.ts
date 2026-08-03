import { prisma } from "@/lib/prisma";
import { CONTEST_SLUG, CONTEST_WINDOWS } from "@/lib/contest";

export async function getOrCreateCurrentContest() {
  const now = new Date();
  const initialStatus =
    now > CONTEST_WINDOWS.applicationsCloseAt
      ? "INITIAL_REVIEW"
      : now >= CONTEST_WINDOWS.applicationsOpenAt
        ? "APPLICATIONS_OPEN"
        : "DRAFT";

  return prisma.contest.upsert({
    where: { slug: CONTEST_SLUG },
    update: CONTEST_WINDOWS,
    create: {
      title: "Concurso de Curtas-metragens dos Amigos do Chapim - 2026",
      slug: CONTEST_SLUG,
      status: initialStatus,
      ...CONTEST_WINDOWS,
    },
  });
}

export function formatSubmission(submission: any) {
  return {
    ...submission,
    createdAt: submission.createdAt?.toISOString?.() ?? submission.createdAt,
    updatedAt: submission.updatedAt?.toISOString?.() ?? submission.updatedAt,
    finalMaterials: submission.finalMaterials
      ? {
          ...submission.finalMaterials,
          createdAt: submission.finalMaterials.createdAt?.toISOString?.() ?? submission.finalMaterials.createdAt,
          updatedAt: submission.finalMaterials.updatedAt?.toISOString?.() ?? submission.finalMaterials.updatedAt,
        }
      : null,
    files: Array.isArray(submission.files)
      ? submission.files.map((file: any) => ({
          ...file,
          createdAt: file.createdAt?.toISOString?.() ?? file.createdAt,
        }))
      : submission.files,
  };
}
