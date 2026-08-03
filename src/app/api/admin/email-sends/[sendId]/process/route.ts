import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserEmail, isAdminEmail } from "@/lib/auth";
import type { EmailAudienceSegment } from "@/lib/email-audiences";
import { refreshEmailSendCounts } from "@/lib/email-sends";
import { prisma } from "@/lib/prisma";
import { emailDeliveryError, sendSesEmail } from "@/lib/ses";

const BATCH_SIZE = 5;
const STALE_CLAIM_MS = 5 * 60 * 1_000;
const MANAGED_TOPICS = new Set(["NEWSLETTER", "PAYING_MEMBERS", "CONTEST_APPLICANTS"]);

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sendId: string }> }
) {
  const adminEmail = await getCurrentUserEmail(request);
  if (!adminEmail || !isAdminEmail(adminEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { sendId } = await params;
  const body = await request.json().catch(() => ({}));
  const retryFailed = body && typeof body === "object" && body.retryFailed === true;
  const send = await prisma.emailSend.findUnique({ where: { id: sendId } });

  if (!send) {
    return NextResponse.json({ error: "Envio não encontrado." }, { status: 404 });
  }

  const staleBefore = new Date(Date.now() - STALE_CLAIM_MS);
  await prisma.emailDelivery.updateMany({
    where: { sendId, status: "SENDING", updatedAt: { lt: staleBefore } },
    data: { status: "QUEUED", claimToken: null },
  });

  if (retryFailed) {
    await prisma.emailDelivery.updateMany({
      where: { sendId, status: "FAILED" },
      data: { status: "QUEUED", claimToken: null, error: null },
    });
  }

  const queued = await prisma.emailDelivery.findMany({
    where: { sendId, status: "QUEUED" },
    orderBy: { createdAt: "asc" },
    take: BATCH_SIZE,
    select: { id: true },
  });

  if (queued.length === 0) {
    const updated = await refreshEmailSendCounts(sendId);
    const remaining = await prisma.emailDelivery.count({
      where: { sendId, status: { in: ["QUEUED", "SENDING"] } },
    });
    return NextResponse.json({ send: updated, remaining, processed: 0 });
  }

  const claimToken = randomUUID();
  const claimedIds = queued.map(({ id }) => id);
  await prisma.$transaction([
    prisma.emailDelivery.updateMany({
      where: { id: { in: claimedIds }, status: "QUEUED" },
      data: { status: "SENDING", claimToken },
    }),
    prisma.emailSend.updateMany({
      where: { id: sendId, startedAt: null },
      data: { status: "SENDING", startedAt: new Date() },
    }),
  ]);

  const claimed = await prisma.emailDelivery.findMany({
    where: { sendId, claimToken, status: "SENDING" },
  });

  await Promise.all(
    claimed.map(async (delivery) => {
      try {
        const topicName =
          delivery.topicName && MANAGED_TOPICS.has(delivery.topicName)
            ? (delivery.topicName as Exclude<EmailAudienceSegment, "ADMINS">)
            : null;
        const providerMessageId = await sendSesEmail({
          sendId,
          subject: send.subject,
          previewText: send.previewText,
          body: send.body,
          email: delivery.email,
          topicName,
          segments: delivery.audienceSegments,
        });

        await prisma.emailDelivery.update({
          where: { id: delivery.id },
          data: {
            status: "ACCEPTED",
            providerMessageId,
            claimToken: null,
            error: null,
            attempts: { increment: 1 },
            acceptedAt: new Date(),
          },
        });
      } catch (error) {
        console.error(`SES delivery failed for ${delivery.id}:`, error);
        await prisma.emailDelivery.update({
          where: { id: delivery.id },
          data: {
            status: "FAILED",
            claimToken: null,
            error: emailDeliveryError(error),
            attempts: { increment: 1 },
          },
        });
      }
    })
  );

  const updated = await refreshEmailSendCounts(sendId);
  const remaining = await prisma.emailDelivery.count({
    where: { sendId, status: { in: ["QUEUED", "SENDING"] } },
  });

  return NextResponse.json({ send: updated, remaining, processed: claimed.length });
}
