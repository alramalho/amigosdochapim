const LOOPS_API_URL = "https://app.loops.so/api/v1";

if (!process.env.LOOPS_API_KEY) {
  console.warn("LOOPS_API_KEY is not set - emails will not be sent");
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
  if (!process.env.LOOPS_API_KEY) {
    console.log("Skipping email - LOOPS_API_KEY not set");
    return;
  }

  const payload = {
    transactionalId: process.env.LOOPS_WELCOME_EMAIL_ID,
    email,
    dataVariables: {
      name: name || "Amigo",
      tier: tier === "AMIGO" ? "Amigo" : "Apoiante",
      magicLink,
    },
  };

  console.log("Sending welcome email with payload:", JSON.stringify(payload, null, 2));

  const response = await fetch(`${LOOPS_API_URL}/transactional`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to send welcome email:", error);
    throw new Error(`Failed to send welcome email: ${error}`);
  }

  return response.json();
}

// Add contact to Loops for future campaigns
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

  const response = await fetch(`${LOOPS_API_URL}/contacts/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      firstName: name,
      subscribed: true,
      userGroup: tier,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    // "Email is already in your audience" is fine, not an error
    if (data.message?.includes("already")) {
      console.log(`Contact ${email} already exists in Loops`);
      return data;
    }
    console.error("Failed to add contact to Loops:", data);
  }

  return data;
}
