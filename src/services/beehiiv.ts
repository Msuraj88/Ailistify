import { getBeehiivConfig } from "@/lib/beehiiv/config";
import {
  logNewsletterAlreadySubscribed,
  logNewsletterFailure,
  logNewsletterSuccess,
} from "@/lib/newsletter/logger";

const BEEHIIV_API_BASE = "https://api.beehiiv.com/v2";

type BeehiivErrorResponse = {
  status?: number;
  message?: string;
  errors?: Array<{ message?: string; code?: string }>;
};

type BeehiivSubscriptionResponse = {
  data?: {
    status?: string;
  };
};

export type BeehiivSubscribeResult =
  | { success: true; alreadySubscribed: false }
  | { success: false; code: "already_subscribed"; message: string }
  | { success: false; code: "invalid_email"; message: string }
  | { success: false; code: "configuration_error"; message: string }
  | { success: false; code: "rate_limited"; message: string }
  | { success: false; code: "api_error"; message: string }
  | { success: false; code: "network_error"; message: string };

function extractErrorMessage(body: BeehiivErrorResponse | null): string {
  if (!body) {
    return "";
  }

  const messages = [
    body.message,
    ...(body.errors?.map((error) => error.message).filter(Boolean) ?? []),
  ].filter(Boolean);

  return messages.join(" ").toLowerCase();
}

function isAlreadySubscribedMessage(message: string): boolean {
  return /already|exist|duplicate|subscribed/.test(message);
}

function isInvalidEmailMessage(message: string): boolean {
  return /invalid|email|format/.test(message);
}

function isActiveSubscription(status: string | undefined): boolean {
  return (
    status === "active" ||
    status === "pending" ||
    status === "validating" ||
    status === "needs_attention"
  );
}

async function getSubscriptionByEmail(
  email: string,
  config: NonNullable<ReturnType<typeof getBeehiivConfig>>,
): Promise<BeehiivSubscriptionResponse | null> {
  const response = await fetch(
    `${BEEHIIV_API_BASE}/publications/${config.publicationId}/subscriptions/by_email/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as BeehiivSubscriptionResponse;
}

export async function subscribeToBeehiivPublication(
  email: string,
): Promise<BeehiivSubscribeResult> {
  const config = getBeehiivConfig();

  if (!config) {
    logNewsletterFailure(email, { reason: "missing_configuration" });
    return {
      success: false,
      code: "configuration_error",
      message: "Newsletter signup is temporarily unavailable.",
    };
  }

  try {
    const response = await fetch(
      `${BEEHIIV_API_BASE}/publications/${config.publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: "ailistify",
          utm_medium: "website",
        }),
        cache: "no-store",
      },
    );

    if (response.ok) {
      logNewsletterSuccess(email);
      return { success: true, alreadySubscribed: false };
    }

    const body = (await response
      .json()
      .catch(() => null)) as BeehiivErrorResponse | null;
    const errorMessage = extractErrorMessage(body);

    if (response.status === 429) {
      logNewsletterFailure(email, { status: response.status, errorMessage });
      return {
        success: false,
        code: "rate_limited",
        message: "Too many requests. Please try again later.",
      };
    }

    if (response.status === 404) {
      logNewsletterFailure(email, { status: response.status, errorMessage });
      return {
        success: false,
        code: "configuration_error",
        message: "Newsletter signup is temporarily unavailable.",
      };
    }

    const existingSubscription = await getSubscriptionByEmail(email, config);

    if (isActiveSubscription(existingSubscription?.data?.status)) {
      logNewsletterAlreadySubscribed(email);
      return {
        success: false,
        code: "already_subscribed",
        message: "You're already subscribed.",
      };
    }

    if (
      response.status === 400 &&
      (isAlreadySubscribedMessage(errorMessage) || existingSubscription?.data)
    ) {
      logNewsletterAlreadySubscribed(email);
      return {
        success: false,
        code: "already_subscribed",
        message: "You're already subscribed.",
      };
    }

    if (response.status === 400 && isInvalidEmailMessage(errorMessage)) {
      logNewsletterFailure(email, { status: response.status, errorMessage });
      return {
        success: false,
        code: "invalid_email",
        message: "Please enter a valid email.",
      };
    }

    if (
      response.status === 400 &&
      /invalid_pattern|publicationid/.test(errorMessage)
    ) {
      logNewsletterFailure(email, {
        status: response.status,
        errorMessage,
        reason: "invalid_publication_id",
      });
      return {
        success: false,
        code: "configuration_error",
        message: "Newsletter signup is temporarily unavailable.",
      };
    }

    logNewsletterFailure(email, {
      status: response.status,
      errorMessage,
      body,
    });
    return {
      success: false,
      code: "api_error",
      message: "Failed to subscribe. Please try again later.",
    };
  } catch (error) {
    logNewsletterFailure(email, {
      reason: "network_error",
      error: error instanceof Error ? error.message : "unknown_error",
    });

    return {
      success: false,
      code: "network_error",
      message: "Failed to subscribe. Please try again later.",
    };
  }
}
