import DodoPayments from "dodopayments";
import {
  getDodoApiKey,
  getDodoEnvironment,
  getDodoWebhookKey,
} from "@/lib/payments/config";
import type {
  CreateCheckoutInput,
  PaymentProvider,
  ProviderPayment,
} from "@/lib/payments/types";

let client: DodoPayments | null = null;

function getClient(): DodoPayments {
  if (!client) {
    client = new DodoPayments({
      bearerToken: getDodoApiKey(),
      environment: getDodoEnvironment(),
      webhookKey: getDodoWebhookKey() ?? undefined,
    });
  }
  return client;
}

function asMetadataRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v != null)
      .map(([k, v]) => [k, String(v)]),
  );
}

function minorUnitsToMajor(amount: number | null | undefined): number {
  if (amount == null || !Number.isFinite(amount)) {
    return 0;
  }
  return amount / 100;
}

export const dodoProvider: PaymentProvider = {
  id: "dodo",

  async createCheckoutSession(input: CreateCheckoutInput) {
    const dodo = getClient();
    const currency = (input.currency ?? "USD").toUpperCase();

    const session = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: input.productId,
          quantity: 1,
        },
      ],
      customer: input.payerEmail
        ? {
            email: input.payerEmail,
            name: input.payerName ?? undefined,
          }
        : undefined,
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        submissionId: input.submissionId,
        description: input.description.slice(0, 100),
        expectedAmount: String(input.amount),
        expectedCurrency: currency,
        ...(input.metadata ?? {}),
      },
      feature_flags: {
        redirect_immediately: true,
      },
    });

    if (!session.session_id || !session.checkout_url) {
      throw new Error("Dodo checkout session did not return a checkout URL.");
    }

    return {
      providerOrderId: session.session_id,
      approvalUrl: session.checkout_url,
      raw: session,
    };
  },

  async getPayment(providerPaymentId: string): Promise<ProviderPayment> {
    const dodo = getClient();
    const payment = await dodo.payments.retrieve(providerPaymentId);

    return {
      providerPaymentId: payment.payment_id,
      status: payment.status ?? "unknown",
      amount: minorUnitsToMajor(payment.total_amount),
      currency: String(payment.currency ?? "USD").toUpperCase(),
      payerEmail: payment.customer?.email ?? null,
      payerName: payment.customer?.name ?? null,
      country: payment.billing?.country ?? null,
      metadata: asMetadataRecord(payment.metadata),
      raw: {
        ...payment,
        checkout_session_id: payment.checkout_session_id ?? null,
      },
    };
  },

  async verifyAndParseWebhook(headers: Headers, body: string) {
    const webhookKey = getDodoWebhookKey();

    if (!webhookKey) {
      try {
        const parsed = JSON.parse(body) as { type?: string; data?: unknown };
        return { ok: true, eventType: parsed.type, data: parsed.data };
      } catch {
        return { ok: false };
      }
    }

    try {
      const dodo = getClient();
      const event = dodo.webhooks.unwrap(body, {
        headers: {
          "webhook-id": headers.get("webhook-id") ?? "",
          "webhook-signature": headers.get("webhook-signature") ?? "",
          "webhook-timestamp": headers.get("webhook-timestamp") ?? "",
        },
        key: webhookKey,
      });

      return {
        ok: true,
        eventType: event.type,
        data: "data" in event ? event.data : event,
      };
    } catch {
      return { ok: false };
    }
  },
};
