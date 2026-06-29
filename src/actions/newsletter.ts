"use server";

import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { subscribeToBeehiivPublication } from "@/services/beehiiv";
import type { ActionResult } from "@/types";
import { newsletterSchema } from "@/validations/newsletter";

export async function subscribeToNewsletter(
  input: unknown,
): Promise<ActionResult<void>> {
  const parsed = newsletterSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please enter a valid email.",
    };
  }

  const email = parsed.data.email;
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip")?.trim() ??
    "unknown";

  if (!checkRateLimit(`newsletter:ip:${clientIp}`, 5, 60_000)) {
    return {
      success: false,
      error: "Too many requests. Please try again later.",
    };
  }

  if (!checkRateLimit(`newsletter:email:${email}`, 3, 60_000)) {
    return {
      success: false,
      error: "Too many requests. Please try again later.",
    };
  }

  const result = await subscribeToBeehiivPublication(email);

  if (result.success) {
    return { success: true, data: undefined };
  }

  return {
    success: false,
    error: result.message,
  };
}
