"use client";

import { useEffect } from "react";
import { trackPaymentEvent } from "@/lib/analytics/payments";

export function PaymentSuccessTracker({
  submissionId,
  paymentId,
  plan,
  amount,
}: {
  submissionId?: string | null;
  paymentId?: string | null;
  plan?: string | null;
  amount?: number | null;
}) {
  useEffect(() => {
    trackPaymentEvent("purchase", {
      transaction_id: paymentId ?? submissionId ?? undefined,
      submission_id: submissionId ?? undefined,
      item_name: plan ?? undefined,
      value: amount ?? undefined,
      currency: "USD",
    });
  }, [amount, paymentId, plan, submissionId]);

  return null;
}

export function PaymentFailedTracker({
  submissionId,
  reason,
}: {
  submissionId?: string;
  reason?: string;
}) {
  useEffect(() => {
    trackPaymentEvent("payment_failed", {
      submission_id: submissionId,
      reason,
    });
  }, [reason, submissionId]);

  return null;
}

export function PaymentCancelledTracker({
  submissionId,
}: {
  submissionId?: string;
}) {
  useEffect(() => {
    trackPaymentEvent("payment_cancelled", {
      submission_id: submissionId,
    });
  }, [submissionId]);

  return null;
}
