import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserEmail, isAdminEmail } from "@/lib/auth";
import {
  emailSendFingerprint,
  recipientSegmentCounts,
  resolveEmailRecipients,
} from "@/lib/email-recipients";
import { prisma } from "@/lib/prisma";
import { getSesDeliveryConfig } from "@/lib/ses";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const email = await getCurrentUserEmail(request);
  if (!email || !isAdminEmail(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const draftId = text(body && typeof body === "object" ? body.draftId : null);
  if (!draftId) {
    return NextResponse.json({ error: "Rascunho inválido." }, { status: 400 });
  }

  const draft = await prisma.emailDraft.findUnique({
    where: { id: draftId },
    include: { emailSend: { select: { id: true } } },
  });

  if (!draft) {
    return NextResponse.json({ error: "Rascunho não encontrado." }, { status: 404 });
  }

  if (draft.sentAt || draft.emailSend) {
    return NextResponse.json({ error: "Este rascunho já foi enviado." }, { status: 409 });
  }

  const recipients = await resolveEmailRecipients(draft);
  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "Os públicos escolhidos não têm destinatários disponíveis." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    preview: {
      draftId: draft.id,
      fingerprint: emailSendFingerprint(draft, recipients),
      count: recipients.length,
      segmentCounts: recipientSegmentCounts(recipients),
      sample: recipients.slice(0, 8).map(({ email: recipientEmail, name, segments }) => ({
        email: recipientEmail,
        name,
        segments,
      })),
      subject: draft.subject,
      recipientEmail: draft.recipientEmail,
      audienceSegments: draft.audienceSegments,
      delivery: getSesDeliveryConfig(),
    },
  });
}
