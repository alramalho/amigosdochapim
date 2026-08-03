import {
  AlreadyExistsException,
  CreateContactCommand,
  SendEmailCommand,
  SESv2Client,
  UpdateContactCommand,
} from "@aws-sdk/client-sesv2";
import type { EmailAudienceSegment } from "@/lib/email-audiences";

const SES_REGION = process.env.SES_REGION || "eu-west-1";
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || "geral@amigosdochapim.org";
const SES_REPLY_TO_EMAIL = process.env.SES_REPLY_TO_EMAIL || SES_FROM_EMAIL;
const SES_ARCHIVE_BCC_EMAIL =
  process.env.SES_ARCHIVE_BCC_EMAIL || "geral@amigosdochapim.org";
const SES_CONTACT_LIST_NAME = process.env.SES_CONTACT_LIST_NAME || "amigos-do-chapim";
const SES_CONFIGURATION_SET_NAME =
  process.env.SES_CONFIGURATION_SET_NAME || "amigos-do-chapim";

let client: SESv2Client | null = null;

function credentials() {
  const accessKeyId = process.env.SES_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SES_AWS_SECRET_ACCESS_KEY;

  return accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined;
}

function getSesClient() {
  if (!client) {
    client = new SESv2Client({ region: SES_REGION, credentials: credentials() });
  }

  return client;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function messageHtml(body: string) {
  return escapeHtml(body)
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 18px;line-height:1.65">${paragraph.replaceAll("\n", "<br>")}</p>`
    )
    .join("");
}

function renderEmail({
  previewText,
  body,
  managedSubscription,
}: {
  previewText: string | null;
  body: string;
  managedSubscription: boolean;
}) {
  const unsubscribeText = managedSubscription
    ? "\n\nPreferências: {{amazonSESUnsubscribeUrl}}"
    : "";
  const unsubscribeHtml = managedSubscription
    ? '<p style="margin:18px 0 0;font-size:12px;color:#71695d"><a href="{{amazonSESUnsubscribeUrl}}" style="color:#71695d">Gerir preferências ou cancelar estas comunicações</a></p>'
    : "";
  const preheader = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(previewText)}</div>`
    : "";

  return {
    text: `${body}\n\n—\nAmigos do Chapim\nhttps://amigosdochapim.org${unsubscribeText}`,
    html: `<!doctype html>
<html lang="pt">
  <body style="margin:0;background:#f6f1e8;color:#2c281f;font-family:Georgia,Times New Roman,serif">
    ${preheader}
    <div style="max-width:640px;margin:0 auto;padding:36px 22px">
      <p style="margin:0 0 30px;color:#9d1820;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Amigos do Chapim</p>
      <div style="font-size:17px">${messageHtml(body)}</div>
      <div style="margin-top:36px;padding-top:22px;border-top:1px solid #d7cdbc;font-family:Arial,sans-serif;font-size:13px;color:#71695d">
        <p style="margin:0">Amigos do Chapim · <a href="https://amigosdochapim.org" style="color:#9d1820">amigosdochapim.org</a></p>
        ${unsubscribeHtml}
      </div>
    </div>
  </body>
</html>`,
  };
}

export function isSesConfigured() {
  return Boolean(SES_FROM_EMAIL && credentials());
}

export function getSesDeliveryConfig() {
  return {
    configured: isSesConfigured(),
    provider: "Amazon SES",
    region: SES_REGION,
    fromEmail: SES_FROM_EMAIL,
    archiveEmail: SES_ARCHIVE_BCC_EMAIL,
  };
}

export async function sendSesEmail({
  sendId,
  subject,
  previewText,
  body,
  email,
  topicName,
  segments,
}: {
  sendId: string;
  subject: string;
  previewText: string | null;
  body: string;
  email: string;
  topicName: Exclude<EmailAudienceSegment, "ADMINS"> | null;
  segments: string[];
}) {
  if (!isSesConfigured()) {
    throw new Error("Amazon SES não está configurado.");
  }

  const content = renderEmail({ previewText, body, managedSubscription: Boolean(topicName) });
  const result = await getSesClient().send(
    new SendEmailCommand({
      FromEmailAddress: `Amigos do Chapim <${SES_FROM_EMAIL}>`,
      ReplyToAddresses: [SES_REPLY_TO_EMAIL],
      Destination: { ToAddresses: [email] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: content.text, Charset: "UTF-8" },
            Html: { Data: content.html, Charset: "UTF-8" },
          },
        },
      },
      ConfigurationSetName: SES_CONFIGURATION_SET_NAME,
      EmailTags: [
        { Name: "email_send_id", Value: sendId },
        { Name: "audience", Value: topicName || (segments.includes("ADMINS") ? "ADMINS" : "INDIVIDUAL") },
      ],
      ...(topicName
        ? {
            ListManagementOptions: {
              ContactListName: SES_CONTACT_LIST_NAME,
              TopicName: topicName,
            },
          }
        : {}),
    })
  );

  if (!result.MessageId) throw new Error("O SES não devolveu um identificador da mensagem.");
  return result.MessageId;
}

export async function sendSesArchiveCopy({
  sendId,
  subject,
  previewText,
  body,
}: {
  sendId: string;
  subject: string;
  previewText: string | null;
  body: string;
}) {
  if (!isSesConfigured()) {
    throw new Error("Amazon SES não está configurado.");
  }

  const content = renderEmail({ previewText, body, managedSubscription: false });
  const result = await getSesClient().send(
    new SendEmailCommand({
      FromEmailAddress: `Amigos do Chapim <${SES_FROM_EMAIL}>`,
      ReplyToAddresses: [SES_REPLY_TO_EMAIL],
      Destination: { BccAddresses: [SES_ARCHIVE_BCC_EMAIL] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: content.text, Charset: "UTF-8" },
            Html: { Data: content.html, Charset: "UTF-8" },
          },
        },
      },
      ConfigurationSetName: SES_CONFIGURATION_SET_NAME,
      EmailTags: [
        { Name: "email_send_id", Value: sendId },
        { Name: "audience", Value: "ARCHIVE" },
      ],
    })
  );

  if (!result.MessageId) throw new Error("O SES não devolveu um identificador da cópia de arquivo.");
  return result.MessageId;
}

export async function syncNewsletterContact({
  email,
  name,
  source,
}: {
  email: string;
  name?: string | null;
  source: string;
}) {
  if (!isSesConfigured()) return { synced: false };

  const contact = {
    ContactListName: SES_CONTACT_LIST_NAME,
    EmailAddress: email,
    UnsubscribeAll: false,
    TopicPreferences: [{ TopicName: "NEWSLETTER", SubscriptionStatus: "OPT_IN" as const }],
    AttributesData: JSON.stringify({ name: name || null, source }),
  };

  try {
    await getSesClient().send(new CreateContactCommand(contact));
  } catch (error) {
    if (!(error instanceof AlreadyExistsException) && (error as { name?: string }).name !== "AlreadyExistsException") {
      throw error;
    }

    await getSesClient().send(new UpdateContactCommand(contact));
  }

  return { synced: true };
}

export function emailDeliveryError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 1_000);
  return "Falha desconhecida ao enviar pelo Amazon SES.";
}
