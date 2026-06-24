import { sendEmail, getAdminNotificationEmail } from "@/lib/email/client";
import { siteConfig } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

function emailLayout(content: string) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
      <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">${siteConfig.name}</p>
      ${content}
      <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">
        <a href="${siteConfig.url}" style="color: #64748b;">${siteConfig.url}</a>
      </p>
    </div>
  `;
}

export async function sendSubmissionReceivedEmail(input: {
  submitterEmail: string;
  toolName: string;
}) {
  await sendEmail({
    to: input.submitterEmail,
    subject: `We received your submission: ${input.toolName}`,
    html: emailLayout(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Thanks for submitting ${input.toolName}</h1>
      <p style="line-height: 1.6; color: #334155;">
        Your tool has been received and is pending review. Our team will review your
        submission and email you once it has been approved or if we need more information.
      </p>
      <p style="line-height: 1.6; color: #334155;">
        Review usually takes 1–3 business days.
      </p>
    `),
  });

  const adminEmail = getAdminNotificationEmail();
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `New tool submission: ${input.toolName}`,
      html: emailLayout(`
        <h1 style="font-size: 22px; margin: 0 0 12px;">New submission</h1>
        <p style="line-height: 1.6; color: #334155;">
          <strong>${input.toolName}</strong> was submitted by ${input.submitterEmail}.
        </p>
        <p>
          <a href="${absoluteUrl("/admin/tools?status=PENDING")}" style="color: #4f46e5;">
            Review pending submissions
          </a>
        </p>
      `),
    });
  }
}

export async function sendSubmissionApprovedEmail(input: {
  submitterEmail: string;
  toolName: string;
  toolSlug: string;
}) {
  await sendEmail({
    to: input.submitterEmail,
    subject: `Your tool was approved: ${input.toolName}`,
    html: emailLayout(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">${input.toolName} is now live</h1>
      <p style="line-height: 1.6; color: #334155;">
        Great news — your submission has been approved and published on ${siteConfig.name}.
      </p>
      <p>
        <a href="${absoluteUrl(`/tools/${input.toolSlug}`)}" style="color: #4f46e5;">
          View your listing
        </a>
      </p>
    `),
  });
}

export async function sendSubmissionRejectedEmail(input: {
  submitterEmail: string;
  toolName: string;
  reason?: string | null;
}) {
  const reasonBlock = input.reason?.trim()
    ? `<p style="line-height: 1.6; color: #334155;"><strong>Reason:</strong> ${input.reason.trim()}</p>`
    : "";

  await sendEmail({
    to: input.submitterEmail,
    subject: `Update on your submission: ${input.toolName}`,
    html: emailLayout(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Submission not approved</h1>
      <p style="line-height: 1.6; color: #334155;">
        Thank you for submitting <strong>${input.toolName}</strong>. After review, we are
        unable to publish this listing at this time.
      </p>
      ${reasonBlock}
      <p style="line-height: 1.6; color: #334155;">
        You can update your submission and try again, or contact us if you have questions.
      </p>
      <p>
        <a href="${absoluteUrl("/submit-tool")}" style="color: #4f46e5;">
          Submit again
        </a>
      </p>
    `),
  });
}
