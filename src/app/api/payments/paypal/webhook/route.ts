import { NextResponse } from "next/server";
import { paypalProvider } from "@/lib/payments/providers/paypal";
import { PaymentService } from "@/lib/payments/services/payment-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();

  try {
    const verified = await paypalProvider.verifyWebhook?.(
      request.headers,
      body,
    );

    if (verified === false) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature." },
        { status: 401 },
      );
    }

    const event = JSON.parse(body) as {
      event_type?: string;
      resource?: Record<string, unknown>;
    };

    if (!event.event_type || !event.resource) {
      return NextResponse.json({ success: true, handled: false });
    }

    const result = await PaymentService.handleWebhookEvent(
      event.event_type,
      event.resource,
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[paypal:webhook]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Webhook failed",
      },
      { status: 500 },
    );
  }
}
