import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserEmail, isAdminEmail } from "@/lib/auth";
import {
  emailSendFingerprint,
  resolveEmailRecipients,
} from "@/lib/email-recipients";
import { prisma } from "@/lib/prisma";
import { getSesDeliveryConfig, isSesConfigured } from "@/lib/ses";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const adminEmail = await getCurrentUserEmail(request);
  if (!adminEmail || !isAdminEmail(adminEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isSesConfigured()) {
    return NextResponse.json(
      { error: "O Amazon SES ainda não está configurado no ambiente do site." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const draftId = text(body && typeof body === "object" ? body.draftId : null);
  const fingerprint = text(body && typeof body === "object" ? body.fingerprint : null);
  const confirmation = text(body && typeof body === "object" ? body.confirmation : null);

  if (!draftId || !fingerprint || confirmation !== "ENVIAR") {
    return NextResponse.json(
      { error: "A confirmação de envio é inválida." },
      { status: 400 }
    );
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
      { error: "Os públicos escolhidos já não têm destinatários disponíveis." },
      { status: 400 }
    );
  }

  if (emailSendFingerprint(draft, recipients) !== fingerprint) {
    return NextResponse.json(
      { error: "O rascunho ou a lista de destinatários mudou. Confirma novamente o envio." },
      { status: 409 }
    );
  }

  const delivery = getSesDeliveryConfig();
  const createdAt = new Date();

  try {
    const send = await prisma.$transaction(async (transaction) => {
      const locked = await transaction.emailDraft.updateMany({
        where: { id: draft.id, sentAt: null },
        data: { sentAt: createdAt, sentByEmail: adminEmail },
      });

      if (locked.count !== 1) throw new Error("DRAFT_ALREADY_SENT");

      return transaction.emailSend.create({
        data: {
          draftId: draft.id,
          name: draft.name,
          subject: draft.subject,
          previewText: draft.previewText,
          body: draft.body,
          audienceSegments: draft.audienceSegments,
          recipientEmail: draft.recipientEmail,
          fromEmail: delivery.fromEmail,
          recipientCount: recipients.length,
          createdByEmail: adminEmail,
          deliveries: {
            create: recipients.map((recipient) => ({
              email: recipient.email,
              name: recipient.name,
              audienceSegments: recipient.segments,
              topicName: recipient.topicName,
            })),
          },
        },
      });
    });

    return NextResponse.json({ send }, { status: 201 });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "P2002" || (error as Error).message === "DRAFT_ALREADY_SENT") {
      return NextResponse.json({ error: "Este rascunho já foi enviado." }, { status: 409 });
    }

    console.error("Failed to create email send:", error);
    return NextResponse.json(
      { error: "Não foi possível preparar o envio." },
      { status: 500 }
    );
  }
}
