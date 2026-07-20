import { sendEmail, getAdminNotificationEmail } from "@/lib/email/client";
import type { ListingPlan } from "@/generated/prisma/client";
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

function formatListingPlan(plan: ListingPlan) {
  switch (plan) {
    case "PRIORITY":
      return "Priority Listing";
    case "FEATURED":
      return "Featured Listing";
    default:
      return "Free Listing";
  }
}

export async function sendPaymentSuccessEmail(input: {
  submitterEmail: string;
  toolName: string;
  submissionId: string;
  listingPlan: ListingPlan;
  amount: number;
  currency: string;
  paymentId: string;
}) {
  await sendEmail({
    to: input.submitterEmail,
    subject: "Payment successful — Your AI tool is in priority review",
    html: emailLayout(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Payment received</h1>
      <p style="line-height: 1.6; color: #334155;">
        Thank you! Your payment for <strong>${input.toolName}</strong> was successful.
      </p>
      <ul style="line-height: 1.8; color: #334155; padding-left: 18px;">
        <li>Submission ID: <strong>${input.submissionId}</strong></li>
        <li>Payment ID: <strong>${input.paymentId}</strong></li>
        <li>Plan: <strong>${formatListingPlan(input.listingPlan)}</strong></li>
        <li>Amount: <strong>${input.currency} ${input.amount.toFixed(2)}</strong></li>
      </ul>
      <p style="line-height: 1.6; color: #334155;">
        Our team will review and publish your listing within 24 hours.
      </p>
      <p>
        <a href="${absoluteUrl("/my-tools")}" style="color: #4f46e5;">View my submissions</a>
      </p>
    `),
  });

  const adminEmail = getAdminNotificationEmail();
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `Paid submission: ${input.toolName}`,
      html: emailLayout(`
        <h1 style="font-size: 22px; margin: 0 0 12px;">Payment captured</h1>
        <p style="line-height: 1.6; color: #334155;">
          <strong>${input.toolName}</strong> (${input.submissionId}) paid for
          ${formatListingPlan(input.listingPlan)} — ${input.currency} ${input.amount.toFixed(2)}.
        </p>
        <p>
          <a href="${absoluteUrl("/admin/payments")}" style="color: #4f46e5;">Open payments</a>
        </p>
      `),
    });
  }
}

export async function sendPaymentFailedEmail(input: {
  submitterEmail: string;
  toolName: string;
  submissionId: string;
  reason?: string;
}) {
  await sendEmail({
    to: input.submitterEmail,
    subject: "Payment failed — Complete your AIListify submission",
    html: emailLayout(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Payment failed</h1>
      <p style="line-height: 1.6; color: #334155;">
        We could not complete payment for <strong>${input.toolName}</strong>
        (${input.submissionId}).
      </p>
      ${
        input.reason
          ? `<p style="line-height: 1.6; color: #334155;">Reason: ${input.reason}</p>`
          : ""
      }
      <p style="line-height: 1.6; color: #334155;">
        Your submission was saved. You can retry payment anytime from My Tools.
      </p>
      <p>
        <a href="${absoluteUrl("/my-tools")}" style="color: #4f46e5;">Retry payment</a>
      </p>
    `),
  });
}

export async function sendPaymentCancelledEmail(input: {
  submitterEmail: string;
  toolName: string;
  submissionId: string;
}) {
  await sendEmail({
    to: input.submitterEmail,
    subject: "Payment cancelled — Your submission is saved",
    html: emailLayout(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Payment cancelled</h1>
      <p style="line-height: 1.6; color: #334155;">
        You cancelled checkout for <strong>${input.toolName}</strong>
        (${input.submissionId}). Your submission is still saved.
      </p>
      <p style="line-height: 1.6; color: #334155;">
        Complete payment later from My Tools to enter priority review.
      </p>
      <p>
        <a href="${absoluteUrl("/my-tools")}" style="color: #4f46e5;">Complete payment</a>
      </p>
    `),
  });
}
