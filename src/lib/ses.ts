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

function renderEmail({
  body,
  managedSubscription,
}: {
  body: string;
  managedSubscription: boolean;
}) {
  const unsubscribeText = managedSubscription
    ? "\n\nGerir preferências ou cancelar: {{amazonSESUnsubscribeUrl}}"
    : "";

  return `${body}${unsubscribeText}`;
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
  body,
  email,
  topicName,
  segments,
}: {
  sendId: string;
  subject: string;
  body: string;
  email: string;
  topicName: Exclude<EmailAudienceSegment, "ADMINS"> | null;
  segments: string[];
}) {
  if (!isSesConfigured()) {
    throw new Error("Amazon SES não está configurado.");
  }

  const content = renderEmail({ body, managedSubscription: Boolean(topicName) });
  const result = await getSesClient().send(
    new SendEmailCommand({
      FromEmailAddress: `Amigos do Chapim <${SES_FROM_EMAIL}>`,
      ReplyToAddresses: [SES_REPLY_TO_EMAIL],
      Destination: { ToAddresses: [email] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: content, Charset: "UTF-8" },
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
  body,
}: {
  sendId: string;
  subject: string;
  body: string;
}) {
  if (!isSesConfigured()) {
    throw new Error("Amazon SES não está configurado.");
  }

  const content = renderEmail({ body, managedSubscription: false });
  const result = await getSesClient().send(
    new SendEmailCommand({
      FromEmailAddress: `Amigos do Chapim <${SES_FROM_EMAIL}>`,
      ReplyToAddresses: [SES_REPLY_TO_EMAIL],
      Destination: { BccAddresses: [SES_ARCHIVE_BCC_EMAIL] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: content, Charset: "UTF-8" },
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
