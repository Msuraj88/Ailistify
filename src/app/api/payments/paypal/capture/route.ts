import { NextResponse } from "next/server";
import { PaymentService } from "@/lib/payments/services/payment-service";
import { absoluteUrl } from "@/lib/utils";

export const runtime = "nodejs";

type CaptureSearchParams = {
  token?: string;
  submissionId?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? undefined;
  const submissionId = searchParams.get("submissionId") ?? undefined;

  if (!token) {
    const failUrl = absoluteUrl(
      `/payment/failed?reason=${encodeURIComponent("Missing PayPal order token.")}${
        submissionId ? `&submissionId=${encodeURIComponent(submissionId)}` : ""
      }`,
    );
    return NextResponse.redirect(failUrl);
  }

  try {
    const result = await PaymentService.captureCheckout(token);
    const successUrl = absoluteUrl(
      `/payment/success?submissionId=${encodeURIComponent(result.submissionId)}&paymentId=${encodeURIComponent(result.paymentId)}&paid=1`,
    );
    return NextResponse.redirect(successUrl);
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Payment capture failed.";
    const failUrl = absoluteUrl(
      `/payment/failed?reason=${encodeURIComponent(reason)}${
        submissionId ? `&submissionId=${encodeURIComponent(submissionId)}` : ""
      }`,
    );
    return NextResponse.redirect(failUrl);
  }
}

// Keep TypeScript happy for unused type in some tooling.
void (null as unknown as CaptureSearchParams);
