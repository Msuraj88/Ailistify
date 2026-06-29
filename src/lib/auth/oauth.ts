export function isGoogleAuthEnabled(): boolean {
  return Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() &&
    process.env.AUTH_GOOGLE_SECRET?.trim(),
  );
}

export function isGitHubAuthEnabled(): boolean {
  return Boolean(
    process.env.AUTH_GITHUB_ID?.trim() &&
    process.env.AUTH_GITHUB_SECRET?.trim(),
  );
}
