import { NextResponse } from "next/server";
import { dodoProvider } from "@/lib/payments/providers/dodo";
import { PaymentService } from "@/lib/payments/services/payment-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();

  const verified = await dodoProvider.verifyAndParseWebhook?.(
    request.headers,
    body,
  );

  if (!verified?.ok) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
  }

  const eventType = verified.eventType ?? "unknown";
  const data =
    verified.data && typeof verified.data === "object"
      ? (verified.data as Record<string, unknown>)
      : {};

  try {
    const result = await PaymentService.handleWebhookEvent(eventType, data);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    console.error("[dodo webhook]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook handler failed",
      },
      { status: 500 },
    );
  }
}
