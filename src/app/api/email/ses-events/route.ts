import { createVerify } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { refreshEmailSendCounts } from "@/lib/email-sends";
import { prisma } from "@/lib/prisma";

type SnsEnvelope = {
  Type?: string;
  MessageId?: string;
  TopicArn?: string;
  Message?: string;
  Subject?: string;
  Timestamp?: string;
  Token?: string;
  SubscribeURL?: string;
  SignatureVersion?: string;
  Signature?: string;
  SigningCertURL?: string;
};

type SesEvent = {
  eventType?: string;
  notificationType?: string;
  mail?: { messageId?: string };
  delivery?: { timestamp?: string };
  bounce?: {
    bounceType?: string;
    bounceSubType?: string;
    timestamp?: string;
    bouncedRecipients?: Array<{ diagnosticCode?: string }>;
  };
  complaint?: { timestamp?: string; complaintFeedbackType?: string };
  reject?: { reason?: string };
  failure?: { errorMessage?: string };
};

const certificateCache = new Map<string, string>();

function signingFields(type: string) {
  return type === "Notification"
    ? ["Message", "MessageId", "Subject", "Timestamp", "TopicArn", "Type"]
    : ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"];
}

function trustedSnsUrl(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const region = process.env.SES_REGION || "eu-west-1";
    const expectedHost = `sns.${region}.amazonaws.com`;
    const validCertificatePath = /^\/SimpleNotificationService-[A-Za-z0-9_-]+\.pem$/;

    if (
      url.protocol !== "https:" ||
      url.hostname !== expectedHost ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      !validCertificatePath.test(url.pathname)
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function trustedSubscribeUrl(envelope: SnsEnvelope) {
  if (!envelope.SubscribeURL || !envelope.Token || !envelope.TopicArn) return null;

  try {
    const url = new URL(envelope.SubscribeURL);
    const region = process.env.SES_REGION || "eu-west-1";

    if (
      url.protocol !== "https:" ||
      url.hostname !== `sns.${region}.amazonaws.com` ||
      url.port ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.searchParams.get("Action") !== "ConfirmSubscription" ||
      url.searchParams.get("TopicArn") !== envelope.TopicArn ||
      url.searchParams.get("Token") !== envelope.Token
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

async function verifySnsEnvelope(envelope: SnsEnvelope) {
  const expectedTopicArn = process.env.SES_SNS_TOPIC_ARN;
  const certificateUrl = trustedSnsUrl(envelope.SigningCertURL);

  if (
    !expectedTopicArn ||
    envelope.TopicArn !== expectedTopicArn ||
    !certificateUrl ||
    !envelope.Signature ||
    !["1", "2"].includes(envelope.SignatureVersion || "") ||
    !["Notification", "SubscriptionConfirmation", "UnsubscribeConfirmation"].includes(
      envelope.Type || ""
    )
  ) {
    return false;
  }

  let certificate = certificateCache.get(certificateUrl.href);
  if (!certificate) {
    const response = await fetch(certificateUrl, { cache: "no-store" });
    if (!response.ok) return false;
    certificate = await response.text();
    certificateCache.set(certificateUrl.href, certificate);
  }

  const canonical = signingFields(envelope.Type || "")
    .filter((field) => envelope[field as keyof SnsEnvelope] !== undefined)
    .map((field) => `${field}\n${envelope[field as keyof SnsEnvelope]}\n`)
    .join("");
  const verifier = createVerify(envelope.SignatureVersion === "2" ? "RSA-SHA256" : "RSA-SHA1");
  verifier.update(canonical, "utf8");
  verifier.end();

  return verifier.verify(certificate, Buffer.from(envelope.Signature, "base64"));
}

function eventDate(value: string | undefined) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function eventFailure(event: SesEvent) {
  if (event.eventType === "Bounce" || event.notificationType === "Bounce") {
    const diagnostic = event.bounce?.bouncedRecipients?.[0]?.diagnosticCode;
    return [event.bounce?.bounceType, event.bounce?.bounceSubType, diagnostic]
      .filter(Boolean)
      .join(" · ")
      .slice(0, 1_000);
  }

  if (event.eventType === "Complaint" || event.notificationType === "Complaint") {
    return `Queixa do destinatário${event.complaint?.complaintFeedbackType ? ` · ${event.complaint.complaintFeedbackType}` : ""}`;
  }

  return (event.reject?.reason || event.failure?.errorMessage || "O SES não entregou a mensagem.").slice(
    0,
    1_000
  );
}

async function processSesEvent(event: SesEvent) {
  const providerMessageId = event.mail?.messageId;
  const type = event.eventType || event.notificationType;
  if (!providerMessageId || !type || type === "Send") return;

  const delivery = await prisma.emailDelivery.findUnique({
    where: { providerMessageId },
    select: { id: true, sendId: true, email: true },
  });

  if (!delivery) {
    const archiveSend = await prisma.emailSend.findUnique({
      where: { archiveMessageId: providerMessageId },
      select: { id: true },
    });
    if (!archiveSend) return;

    if (type === "Delivery") {
      await prisma.emailSend.update({
        where: { id: archiveSend.id },
        data: {
          archiveStatus: "DELIVERED",
          archivedAt: eventDate(event.delivery?.timestamp),
          archiveError: null,
        },
      });
    } else if (type === "Bounce" || type === "Complaint") {
      await prisma.emailSend.update({
        where: { id: archiveSend.id },
        data: {
          archiveStatus: type === "Bounce" ? "BOUNCED" : "COMPLAINED",
          archivedAt: null,
          archiveError: eventFailure(event),
        },
      });
    } else if (type === "Reject" || type === "Rendering Failure") {
      await prisma.emailSend.update({
        where: { id: archiveSend.id },
        data: { archiveStatus: "FAILED", archiveError: eventFailure(event) },
      });
    }

    return;
  }

  if (type === "Delivery") {
    await prisma.emailDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "DELIVERED",
        deliveredAt: eventDate(event.delivery?.timestamp),
        error: null,
      },
    });
  } else if (type === "Bounce" || type === "Complaint") {
    const status = type === "Bounce" ? "BOUNCED" : "COMPLAINED";
    const timestamp =
      type === "Bounce" ? event.bounce?.timestamp : event.complaint?.timestamp;
    await prisma.$transaction([
      prisma.emailDelivery.update({
        where: { id: delivery.id },
        data: { status, deliveredAt: null, error: eventFailure(event) },
      }),
      prisma.newsletterSubscriber.updateMany({
        where: { email: { equals: delivery.email, mode: "insensitive" }, unsubscribedAt: null },
        data: { unsubscribedAt: eventDate(timestamp) },
      }),
    ]);
  } else if (type === "Reject" || type === "Rendering Failure") {
    await prisma.emailDelivery.update({
      where: { id: delivery.id },
      data: { status: "FAILED", error: eventFailure(event) },
    });
  } else {
    return;
  }

  await refreshEmailSendCounts(delivery.sendId);
}

export async function POST(request: NextRequest) {
  const envelope = (await request.json().catch(() => null)) as SnsEnvelope | null;
  if (!envelope || !(await verifySnsEnvelope(envelope))) {
    return NextResponse.json({ error: "Invalid SNS signature" }, { status: 403 });
  }

  if (envelope.Type === "SubscriptionConfirmation") {
    const subscribeUrl = trustedSubscribeUrl(envelope);
    if (!subscribeUrl) {
      return NextResponse.json({ error: "Invalid subscription URL" }, { status: 400 });
    }

    const response = await fetch(subscribeUrl, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "Subscription confirmation failed" }, { status: 502 });
    }

    return NextResponse.json({ confirmed: true });
  }

  if (envelope.Type === "Notification" && envelope.Message) {
    const event = JSON.parse(envelope.Message) as SesEvent;
    await processSesEvent(event);
  }

  return NextResponse.json({ ok: true });
}
