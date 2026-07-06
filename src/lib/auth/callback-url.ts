/**
 * Normalize OAuth/post-login callback URLs to safe relative paths on the
 * current origin. Prevents cross-environment redirects (e.g. preview → production).
 */
export function normalizeCallbackUrl(
  callbackUrl: string | null | undefined,
  origin?: string,
): string {
  const fallback = "/";

  if (!callbackUrl?.trim()) {
    return fallback;
  }

  const trimmed = callbackUrl.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const base =
      origin ??
      (typeof window !== "undefined" ? window.location.origin : undefined);

    if (!base) {
      return fallback;
    }

    const url = new URL(trimmed, base);

    if (url.origin !== base) {
      return url.pathname + url.search + url.hash || fallback;
    }

    return url.pathname + url.search + url.hash || fallback;
  } catch {
    return trimmed.startsWith("/") ? trimmed : fallback;
  }
}
