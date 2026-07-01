import { getAdminEmails } from "@/lib/admin";

const LOOPS_API_URL = "https://app.loops.so/api/v1";
const NEWSLETTER_LIST_ID = process.env.LOOPS_NEWSLETTER_LIST_ID;

if (!process.env.LOOPS_API_KEY) {
  console.warn("LOOPS_API_KEY is not set - emails will not be sent");
}

async function sendTransactionalEmail({
  transactionalId,
  email,
  dataVariables,
  description,
}: {
  transactionalId?: string;
  email: string;
  dataVariables: Record<string, string | number | boolean | null>;
  description: string;
}) {
  if (!process.env.LOOPS_API_KEY) {
    console.log(`Skipping ${description} email - LOOPS_API_KEY not set`);
    return;
  }

  if (!transactionalId) {
    console.log(`Skipping ${description} email - transactional ID not set`);
    return;
  }

  const response = await fetch(`${LOOPS_API_URL}/transactional`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transactionalId,
      email,
      dataVariables,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to send ${description} email:`, error);
    throw new Error(`Failed to send ${description} email: ${error}`);
  }

  return response.json();
}

interface SendWelcomeEmailParams {
  email: string;
  name?: string;
  tier: "APOIANTE" | "AMIGO";
  magicLink: string;
}

export async function sendWelcomeEmail({
  email,
  name,
  tier,
  magicLink,
}: SendWelcomeEmailParams) {
  return sendTransactionalEmail({
    transactionalId: process.env.LOOPS_WELCOME_EMAIL_ID,
    email,
    description: "welcome",
    dataVariables: {
      name: name || "Amigo",
      tier: tier === "AMIGO" ? "Amigo" : "Apoiante",
      magicLink,
    },
  });
}

type SubmissionEmailParams = {
  submissionId: string;
  candidateName: string;
  email: string;
  phone: string;
  age: number;
  synopsis: string;
  contestTitle: string;
  submittedAt: Date;
  isUpdate: boolean;
};

type ContactHelpEmailParams = {
  requesterName: string;
  requesterEmail: string;
  subject: string;
  message: string;
  context: string;
  pageUrl: string;
  userAgent: string;
  submittedAt: Date;
};

type NewsletterSignupParams = {
  email: string;
  source: string;
  pagePath?: string;
};

export async function sendSubmissionConfirmationEmail({
  candidateName,
  email,
  contestTitle,
  submittedAt,
  isUpdate,
}: SubmissionEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3027";

  return sendTransactionalEmail({
    transactionalId: process.env.LOOPS_SUBMISSION_CONFIRMATION_EMAIL_ID,
    email,
    description: "submission confirmation",
    dataVariables: {
      candidateName,
      contestTitle,
      submittedAt: submittedAt.toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" }),
      submissionAction: isUpdate ? "updated" : "created",
      loginUrl: `${appUrl}/entrar`,
      panelUrl: `${appUrl}/painel/candidatura`,
    },
  });
}

export async function sendSubmissionAdminEmails({
  submissionId,
  candidateName,
  email,
  phone,
  age,
  synopsis,
  contestTitle,
  submittedAt,
  isUpdate,
}: SubmissionEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3027";
  const adminEmails = getAdminEmails(process.env.ADMIN_NOTIFICATION_EMAILS || process.env.ADMIN_EMAILS);

  return Promise.all(
    adminEmails.map((adminEmail) =>
      sendTransactionalEmail({
        transactionalId: process.env.LOOPS_ADMIN_SUBMISSION_EMAIL_ID,
        email: adminEmail,
        description: "admin submission notification",
        dataVariables: {
          submissionId,
          candidateName,
          candidateEmail: email,
          phone,
          age,
          synopsis,
          contestTitle,
          submittedAt: submittedAt.toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" }),
          submissionAction: isUpdate ? "updated" : "created",
          adminUrl: `${appUrl}/admin/candidaturas`,
        },
      })
    )
  );
}

export function isContactHelpEmailConfigured() {
  return Boolean(process.env.LOOPS_API_KEY && process.env.LOOPS_CONTACT_HELP_EMAIL_ID);
}

export async function sendContactHelpAdminEmails({
  requesterName,
  requesterEmail,
  subject,
  message,
  context,
  pageUrl,
  userAgent,
  submittedAt,
}: ContactHelpEmailParams) {
  if (!isContactHelpEmailConfigured()) {
    return { sent: false, recipients: [] };
  }

  const adminEmails = getAdminEmails(process.env.ADMIN_NOTIFICATION_EMAILS || process.env.ADMIN_EMAILS);

  await Promise.all(
    adminEmails.map((adminEmail) =>
      sendTransactionalEmail({
        transactionalId: process.env.LOOPS_CONTACT_HELP_EMAIL_ID,
        email: adminEmail,
        description: "contact help request",
        dataVariables: {
          requesterName,
          requesterEmail,
          subject,
          message,
          context,
          pageUrl,
          userAgent,
          submittedAt: submittedAt.toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" }),
        },
      })
    )
  );

  return { sent: true, recipients: adminEmails };
}

export function isNewsletterConfigured() {
  return Boolean(process.env.LOOPS_API_KEY && NEWSLETTER_LIST_ID);
}

export async function subscribeToNewsletter({
  email,
  source,
  pagePath,
}: NewsletterSignupParams) {
  if (!process.env.LOOPS_API_KEY) {
    throw new Error("LOOPS_API_KEY is not set");
  }

  if (!NEWSLETTER_LIST_ID) {
    throw new Error("LOOPS_NEWSLETTER_LIST_ID is not set");
  }

  const response = await fetch(`${LOOPS_API_URL}/contacts/update`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      subscribed: true,
      mailingLists: {
        [NEWSLETTER_LIST_ID]: true,
      },
      newsletterSource: source,
      newsletterSignupPath: pagePath || null,
      newsletterSignupAt: new Date().toISOString(),
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Failed to subscribe contact to newsletter:", data);
    throw new Error("Failed to subscribe contact to newsletter");
  }

  return data;
}

// Add or update contact in Loops for future campaigns
export async function addContactToLoops({
  email,
  name,
  tier,
}: {
  email: string;
  name?: string;
  tier: "APOIANTE" | "AMIGO";
}) {
  if (!process.env.LOOPS_API_KEY) {
    console.log("Skipping contact creation - LOOPS_API_KEY not set");
    return;
  }

  const response = await fetch(`${LOOPS_API_URL}/contacts/update`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      firstName: name,
      subscribed: true,
      userGroup: tier,
      ...(NEWSLETTER_LIST_ID
        ? {
            mailingLists: {
              [NEWSLETTER_LIST_ID]: true,
            },
          }
        : {}),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to add contact to Loops:", data);
  }

  return data;
}
