import { NextResponse } from "next/server";
import { PaymentService } from "@/lib/payments/services/payment-service";
import { absoluteUrl } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("payment_id") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const submissionId = searchParams.get("submissionId") ?? undefined;
  const promotionId = searchParams.get("promotionId") ?? undefined;

  if (!paymentId) {
    const failUrl = absoluteUrl(
      `/payment/failed?reason=${encodeURIComponent("Missing Dodo payment id.")}${
        submissionId ? `&submissionId=${encodeURIComponent(submissionId)}` : ""
      }`,
    );
    return NextResponse.redirect(failUrl);
  }

  if (status && status.toLowerCase() !== "succeeded") {
    if (
      status.toLowerCase() === "cancelled" ||
      status.toLowerCase() === "canceled"
    ) {
      const cancelQs = new URLSearchParams();
      if (submissionId) cancelQs.set("submissionId", submissionId);
      if (promotionId) cancelQs.set("promotionId", promotionId);
      return NextResponse.redirect(
        absoluteUrl(`/payment/cancel?${cancelQs.toString()}`),
      );
    }

    const failUrl = absoluteUrl(
      `/payment/failed?reason=${encodeURIComponent(`Payment status: ${status}`)}${
        submissionId ? `&submissionId=${encodeURIComponent(submissionId)}` : ""
      }`,
    );
    return NextResponse.redirect(failUrl);
  }

  try {
    const result = await PaymentService.completeCheckout(paymentId);

    if (result.promotionId || promotionId) {
      const successUrl = absoluteUrl(
        `/payment/success?promotionId=${encodeURIComponent(result.submissionId)}&paymentId=${encodeURIComponent(result.paymentId)}&paid=1`,
      );
      return NextResponse.redirect(successUrl);
    }

    const successUrl = absoluteUrl(
      `/payment/success?submissionId=${encodeURIComponent(result.submissionId)}&paymentId=${encodeURIComponent(result.paymentId)}&paid=1`,
    );
    return NextResponse.redirect(successUrl);
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Payment verification failed.";
    const failUrl = absoluteUrl(
      `/payment/failed?reason=${encodeURIComponent(reason)}${
        submissionId ? `&submissionId=${encodeURIComponent(submissionId)}` : ""
      }`,
    );
    return NextResponse.redirect(failUrl);
  }
}
