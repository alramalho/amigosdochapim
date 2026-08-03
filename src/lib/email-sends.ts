import { prisma } from "@/lib/prisma";

export async function refreshEmailSendCounts(sendId: string) {
  const [send, grouped] = await Promise.all([
    prisma.emailSend.findUnique({
      where: { id: sendId },
      select: { id: true, completedAt: true },
    }),
    prisma.emailDelivery.groupBy({
      by: ["status"],
      where: { sendId },
      _count: { _all: true },
    }),
  ]);

  if (!send) return null;

  const counts = new Map(grouped.map((item) => [item.status, item._count._all]));
  const queuedCount = counts.get("QUEUED") || 0;
  const sendingCount = counts.get("SENDING") || 0;
  const acceptedCount = (counts.get("ACCEPTED") || 0) + (counts.get("DELIVERED") || 0);
  const deliveredCount = counts.get("DELIVERED") || 0;
  const failedCount =
    (counts.get("FAILED") || 0) +
    (counts.get("BOUNCED") || 0) +
    (counts.get("COMPLAINED") || 0);
  const remainingCount = queuedCount + sendingCount;

  const status =
    remainingCount > 0
      ? "SENDING"
      : failedCount === 0
        ? "SENT"
        : acceptedCount > 0
          ? "PARTIALLY_SENT"
          : "FAILED";

  return prisma.emailSend.update({
    where: { id: sendId },
    data: {
      status,
      acceptedCount,
      deliveredCount,
      failedCount,
      completedAt: remainingCount === 0 ? send.completedAt || new Date() : null,
    },
  });
}
