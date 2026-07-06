export async function register() {
  const { configureAuthUrl } = await import("@/lib/auth/configure-auth-url");
  configureAuthUrl();
}
