import "server-only";

import { headers } from "next/headers";
import { resolveStaticAppUrl } from "@/lib/app-url";

/**
 * Resolve the app base URL from the incoming request when available.
 */
export async function resolveRequestAppUrl(): Promise<string> {
  try {
    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
    const protocol = headerStore.get("x-forwarded-proto") ?? "https";

    if (host) {
      return `${protocol}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // headers() unavailable outside request context
  }

  return resolveStaticAppUrl();
}
