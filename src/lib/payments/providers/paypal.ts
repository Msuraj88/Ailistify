import { getPayPalApiBase, getPayPalCredentials } from "@/lib/payments/config";
import type {
  CreateCheckoutInput,
  PaymentProvider,
} from "@/lib/payments/types";

type PayPalTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
};

type PayPalLink = {
  href?: string;
  rel?: string;
  method?: string;
};

type PayPalOrderResponse = {
  id?: string;
  status?: string;
  links?: PayPalLink[];
  purchase_units?: Array<{
    amount?: { currency_code?: string; value?: string };
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
    address?: { country_code?: string };
  };
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const { clientId, clientSecret } = getPayPalCredentials();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`PayPal auth failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as PayPalTokenResponse;
  if (!data.access_token) {
    throw new Error("PayPal auth response missing access_token.");
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 300) * 1000,
  };

  return data.access_token;
}

async function paypalFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${getPayPalApiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const rawText = await response.text();
  let json: unknown = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = { raw: rawText };
  }

  if (!response.ok) {
    throw new Error(
      `PayPal API ${path} failed (${response.status}): ${rawText.slice(0, 500)}`,
    );
  }

  return json as T;
}

function findApprovalUrl(links: PayPalLink[] | undefined): string | null {
  const link = links?.find(
    (item) => item.rel === "approve" || item.rel === "payer-action",
  );
  return link?.href ?? null;
}

function parseAmount(value: string | undefined): number {
  const amount = Number.parseFloat(value ?? "0");
  return Number.isFinite(amount) ? amount : 0;
}

export const paypalProvider: PaymentProvider = {
  id: "paypal",

  async createOrder(input: CreateCheckoutInput) {
    const currency = (input.currency ?? "USD").toUpperCase();
    const value = input.amount.toFixed(2);

    const order = await paypalFetch<PayPalOrderResponse>(
      "/v2/checkout/orders",
      {
        method: "POST",
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: input.submissionId,
              custom_id: input.submissionId,
              description: input.description.slice(0, 127),
              amount: {
                currency_code: currency,
                value,
              },
            },
          ],
          application_context: {
            brand_name: "AIListify",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
            shipping_preference: "NO_SHIPPING",
          },
        }),
      },
    );

    if (!order.id) {
      throw new Error("PayPal create order did not return an order id.");
    }

    const approvalUrl = findApprovalUrl(order.links);
    if (!approvalUrl) {
      throw new Error("PayPal create order did not return an approval URL.");
    }

    return {
      providerOrderId: order.id,
      approvalUrl,
      raw: order,
    };
  },

  async captureOrder(providerOrderId: string) {
    const order = await paypalFetch<PayPalOrderResponse>(
      `/v2/checkout/orders/${encodeURIComponent(providerOrderId)}/capture`,
      { method: "POST", body: "{}" },
    );

    const capture = order.purchase_units?.[0]?.payments?.captures?.[0];
    const amountValue =
      capture?.amount?.value ?? order.purchase_units?.[0]?.amount?.value;
    const currency =
      capture?.amount?.currency_code ??
      order.purchase_units?.[0]?.amount?.currency_code ??
      "USD";

    const given = order.payer?.name?.given_name?.trim() ?? "";
    const surname = order.payer?.name?.surname?.trim() ?? "";
    const payerName = `${given} ${surname}`.trim() || null;

    return {
      providerOrderId: order.id ?? providerOrderId,
      providerCaptureId: capture?.id ?? null,
      status: capture?.status ?? order.status ?? "UNKNOWN",
      amount: parseAmount(amountValue),
      currency,
      payerEmail: order.payer?.email_address ?? null,
      payerName,
      country: order.payer?.address?.country_code ?? null,
      raw: order,
    };
  },

  async getOrder(providerOrderId: string) {
    const order = await paypalFetch<PayPalOrderResponse>(
      `/v2/checkout/orders/${encodeURIComponent(providerOrderId)}`,
      { method: "GET" },
    );

    return {
      providerOrderId: order.id ?? providerOrderId,
      status: order.status ?? "UNKNOWN",
      amount: parseAmount(order.purchase_units?.[0]?.amount?.value),
      currency: order.purchase_units?.[0]?.amount?.currency_code ?? null,
      raw: order,
    };
  },

  async verifyWebhook(headers: Headers, body: string) {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
    if (!webhookId) {
      // Allow processing in sandbox without webhook verification configured.
      return getPayPalCredentials() != null;
    }

    const transmissionId = headers.get("paypal-transmission-id");
    const transmissionTime = headers.get("paypal-transmission-time");
    const certUrl = headers.get("paypal-cert-url");
    const authAlgo = headers.get("paypal-auth-algo");
    const transmissionSig = headers.get("paypal-transmission-sig");

    if (
      !transmissionId ||
      !transmissionTime ||
      !certUrl ||
      !authAlgo ||
      !transmissionSig
    ) {
      return false;
    }

    let webhookEvent: unknown;
    try {
      webhookEvent = JSON.parse(body);
    } catch {
      return false;
    }

    const result = await paypalFetch<{ verification_status?: string }>(
      "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        body: JSON.stringify({
          transmission_id: transmissionId,
          transmission_time: transmissionTime,
          cert_url: certUrl,
          auth_algo: authAlgo,
          transmission_sig: transmissionSig,
          webhook_id: webhookId,
          webhook_event: webhookEvent,
        }),
      },
    );

    return result.verification_status === "SUCCESS";
  },
};
