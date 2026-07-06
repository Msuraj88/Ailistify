/**
 * Ensures Auth.js uses the current deployment host on Vercel preview builds.
 *
 * On Vercel, AUTH_URL is often set for Production only — but if it is shared across
 * all environments, OAuth would redirect to production. Preview deployments must
 * override AUTH_URL with their unique VERCEL_URL.
 */
export function configureAuthUrl() {
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelEnv === "preview" && vercelUrl) {
    const previewUrl = vercelUrl.startsWith("http")
      ? vercelUrl
      : `https://${vercelUrl}`;

    process.env.AUTH_URL = previewUrl.replace(/\/$/, "");
    process.env.NEXTAUTH_URL = process.env.AUTH_URL;
    return;
  }

  if (vercelEnv === "production") {
    if (!process.env.AUTH_URL?.trim()) {
      process.env.AUTH_URL = "https://www.ailistify.com";
      process.env.NEXTAUTH_URL = process.env.AUTH_URL;
    }
    return;
  }

  if (!process.env.AUTH_URL?.trim()) {
    const port = process.env.PORT?.trim() || "3001";
    const localUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || `http://localhost:${port}`;
    process.env.AUTH_URL = localUrl.replace(/\/$/, "");
    process.env.NEXTAUTH_URL = process.env.AUTH_URL;
  }
}
