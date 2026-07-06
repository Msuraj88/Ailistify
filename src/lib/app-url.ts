/**
 * Resolve the app base URL for the current deployment (build/runtime env).
 * Safe to import from client and server bundles.
 */
export function resolveStaticAppUrl(): string {
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelEnv === "preview" && vercelUrl) {
    return vercelUrl.startsWith("http")
      ? vercelUrl.replace(/\/$/, "")
      : `https://${vercelUrl}`;
  }

  if (vercelEnv === "production") {
    return (
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      process.env.AUTH_URL?.replace(/\/$/, "") ??
      "https://www.ailistify.com"
    );
  }

  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    "http://localhost:3001"
  );
}

export function absoluteUrl(path: string, baseUrl?: string) {
  const base = (baseUrl ?? resolveStaticAppUrl()).replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
