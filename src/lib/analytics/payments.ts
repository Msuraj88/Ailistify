"use client";

type GaEventName =
  | "begin_checkout"
  | "purchase"
  | "payment_failed"
  | "payment_cancelled"
  | "payment_retry";

type GaEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: GaEventParams,
    ) => void;
    dataLayer?: unknown[];
  }
}

export function trackPaymentEvent(
  eventName: GaEventName,
  params: GaEventParams = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
      return;
    }

    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  } catch {
    // Analytics must never break checkout.
  }
}
