import { createHash } from "crypto";
import type { EmailDraft } from "@prisma/client";
import { getAdminEmails } from "@/lib/admin";
import {
  EMAIL_AUDIENCE_SEGMENTS,
  type EmailAudienceSegment,
} from "@/lib/email-audiences";
import { prisma } from "@/lib/prisma";

export type ResolvedEmailRecipient = {
  email: string;
  name: string | null;
  segments: EmailAudienceSegment[];
  topicName: Exclude<EmailAudienceSegment, "ADMINS"> | null;
};

export type SendableEmailDraft = Pick<
  EmailDraft,
  | "id"
  | "name"
  | "subject"
  | "previewText"
  | "body"
  | "audienceSegments"
  | "recipientEmail"
  | "recipientSelections"
>;

const TOPIC_PRIORITY: Exclude<EmailAudienceSegment, "ADMINS">[] = [
  "NEWSLETTER",
  "PAYING_MEMBERS",
  "CONTEST_APPLICANTS",
];

function canonicalEmail(value: string) {
  return value.trim().toLowerCase();
}

function addRecipient(
  recipients: Map<string, Omit<ResolvedEmailRecipient, "topicName">>,
  emailValue: string,
  name: string | null,
  segment: EmailAudienceSegment
) {
  const email = canonicalEmail(emailValue);
  if (!email) return;

  const existing = recipients.get(email);
  if (existing) {
    if (!existing.name && name) existing.name = name;
    if (!existing.segments.includes(segment)) existing.segments.push(segment);
    return;
  }

  recipients.set(email, { email, name, segments: [segment] });
}

export async function resolveEmailRecipients(draft: SendableEmailDraft) {
  if (draft.recipientSelections.length) {
    const { audienceMembers } = await getEmailAudienceData();
    const recipients = new Map<string, Omit<ResolvedEmailRecipient, "topicName">>();

    for (const selection of draft.recipientSelections) {
      const separator = selection.indexOf("|");
      const segment = selection.slice(0, separator) as EmailAudienceSegment;
      const email = canonicalEmail(selection.slice(separator + 1));
      if (separator < 1 || !EMAIL_AUDIENCE_SEGMENTS.includes(segment)) continue;

      const person = audienceMembers[segment].find((member) => member.email === email);
      if (person) addRecipient(recipients, person.email, person.name, segment);
    }

    return Array.from(recipients.values())
      .map((recipient): ResolvedEmailRecipient => ({
        ...recipient,
        topicName:
          TOPIC_PRIORITY.find((segment) => recipient.segments.includes(segment)) || null,
      }))
      .sort((a, b) => a.email.localeCompare(b.email));
  }

  if (draft.recipientEmail) {
    const email = canonicalEmail(draft.recipientEmail);
    const [user, submission, subscriber] = await Promise.all([
      prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { name: true },
      }),
      prisma.submission.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { candidateName: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.newsletterSubscriber.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { name: true },
      }),
    ]);

    return [
      {
        email,
        name: user?.name || submission?.candidateName || subscriber?.name || null,
        segments: [],
        topicName: null,
      },
    ] satisfies ResolvedEmailRecipient[];
  }

  const selected = new Set(
    draft.audienceSegments.filter((segment): segment is EmailAudienceSegment =>
      EMAIL_AUDIENCE_SEGMENTS.includes(segment as EmailAudienceSegment)
    )
  );
  const now = new Date();
  const [newsletterSubscribers, payingMembers, applicants] = await Promise.all([
    selected.has("NEWSLETTER")
      ? prisma.newsletterSubscriber.findMany({
          where: { unsubscribedAt: null },
          select: { email: true, name: true },
        })
      : Promise.resolve([]),
    selected.has("PAYING_MEMBERS")
      ? prisma.subscription.findMany({
          where: { status: "ACTIVE", currentPeriodEnd: { gt: now } },
          select: { user: { select: { email: true, name: true } } },
        })
      : Promise.resolve([]),
    selected.has("CONTEST_APPLICANTS")
      ? prisma.submission.findMany({
          where: { status: { not: "DRAFT" } },
          select: { email: true, candidateName: true },
          distinct: ["email"],
        })
      : Promise.resolve([]),
  ]);

  const recipients = new Map<string, Omit<ResolvedEmailRecipient, "topicName">>();

  for (const subscriber of newsletterSubscribers) {
    addRecipient(recipients, subscriber.email, subscriber.name, "NEWSLETTER");
  }

  for (const member of payingMembers) {
    addRecipient(recipients, member.user.email, member.user.name, "PAYING_MEMBERS");
  }

  if (selected.has("ADMINS")) {
    for (const email of getAdminEmails(process.env.ADMIN_EMAILS)) {
      addRecipient(recipients, email, null, "ADMINS");
    }
  }

  for (const applicant of applicants) {
    addRecipient(recipients, applicant.email, applicant.candidateName, "CONTEST_APPLICANTS");
  }

  return Array.from(recipients.values())
    .map((recipient): ResolvedEmailRecipient => ({
      ...recipient,
      topicName: TOPIC_PRIORITY.find((segment) => recipient.segments.includes(segment)) || null,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export function emailSendFingerprint(
  draft: SendableEmailDraft,
  recipients: ResolvedEmailRecipient[]
) {
  const payload = {
    draft: {
      id: draft.id,
      name: draft.name,
      subject: draft.subject,
      previewText: draft.previewText,
      body: draft.body,
      audienceSegments: [...draft.audienceSegments].sort(),
      recipientEmail: draft.recipientEmail,
      recipientSelections: [...draft.recipientSelections].sort(),
    },
    recipients: recipients.map(({ email, segments, topicName }) => ({
      email,
      segments: [...segments].sort(),
      topicName,
    })),
  };

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function recipientSegmentCounts(recipients: ResolvedEmailRecipient[]) {
  return Object.fromEntries(
    EMAIL_AUDIENCE_SEGMENTS.map((segment) => [
      segment,
      recipients.filter((recipient) => recipient.segments.includes(segment)).length,
    ])
  ) as Record<EmailAudienceSegment, number>;
}

export async function getEmailAudienceData() {
  const now = new Date();
  const [newsletter, payingMembers, applicants, users] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: { unsubscribedAt: null },
      select: { email: true, name: true },
    }),
    prisma.subscription.findMany({
      where: { status: "ACTIVE", currentPeriodEnd: { gt: now } },
      select: { user: { select: { email: true, name: true } } },
    }),
    prisma.submission.findMany({
      where: { status: { not: "DRAFT" } },
      select: { email: true, candidateName: true },
      distinct: ["email"],
    }),
    prisma.user.findMany({
      select: { email: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const people = new Map<string, { email: string; name: string | null }>();
  const addPerson = (emailValue: string, name: string | null) => {
    const email = canonicalEmail(emailValue);
    const existing = people.get(email);
    people.set(email, { email, name: existing?.name || name });
  };

  for (const user of users) addPerson(user.email, user.name);
  for (const subscriber of newsletter) addPerson(subscriber.email, subscriber.name);
  for (const applicant of applicants) addPerson(applicant.email, applicant.candidateName);
  for (const email of getAdminEmails(process.env.ADMIN_EMAILS)) addPerson(email, null);

  const uniquePeople = (
    values: Array<{ email: string; name: string | null }>
  ) => {
    const result = new Map<string, { email: string; name: string | null }>();
    for (const value of values) {
      const email = canonicalEmail(value.email);
      const existing = result.get(email);
      result.set(email, { email, name: existing?.name || value.name });
    }
    return Array.from(result.values()).sort((a, b) =>
      (a.name || a.email).localeCompare(b.name || b.email, "pt")
    );
  };

  const audienceMembers = {
    NEWSLETTER: uniquePeople(newsletter),
    PAYING_MEMBERS: uniquePeople(
      payingMembers.map(({ user }) => ({ email: user.email, name: user.name }))
    ),
    ADMINS: uniquePeople(
      getAdminEmails(process.env.ADMIN_EMAILS).map((email) => ({
        email,
        name: people.get(canonicalEmail(email))?.name || null,
      }))
    ),
    CONTEST_APPLICANTS: uniquePeople(
      applicants.map(({ email, candidateName }) => ({ email, name: candidateName }))
    ),
  } satisfies Record<
    EmailAudienceSegment,
    Array<{ email: string; name: string | null }>
  >;

  return {
    audiences: {
      NEWSLETTER: { count: audienceMembers.NEWSLETTER.length },
      PAYING_MEMBERS: { count: audienceMembers.PAYING_MEMBERS.length },
      ADMINS: { count: audienceMembers.ADMINS.length },
      CONTEST_APPLICANTS: { count: audienceMembers.CONTEST_APPLICANTS.length },
    },
    audienceMembers,
    people: Array.from(people.values()).sort((a, b) =>
      (a.name || a.email).localeCompare(b.name || b.email, "pt")
    ),
  };
}
