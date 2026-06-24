type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
};

type SendEmailResult = { success: true } | { success: false; error: string };

function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() ?? "AIListify <onboarding@resend.dev>";
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.info("[email:dev]", {
      to: input.to,
      subject: input.subject,
    });
    return { success: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getEmailFrom(),
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        success: false,
        error: payload?.message ?? "Failed to send email.",
      };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to send email." };
  }
}

export function getAdminNotificationEmail(): string | null {
  const email = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  return email ?? null;
}
