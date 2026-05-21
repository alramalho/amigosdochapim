import { prisma } from "@/lib/prisma";
import { CONTEST_SLUG, CONTEST_WINDOWS } from "@/lib/contest";

export async function getOrCreateCurrentContest() {
  return prisma.contest.upsert({
    where: { slug: CONTEST_SLUG },
    update: {},
    create: {
      title: "Concurso de Curtas-metragens dos Amigos do Chapim - 2026",
      slug: CONTEST_SLUG,
      status: "APPLICATIONS_OPEN",
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
