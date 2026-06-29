function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return "[invalid-email]";
  }

  const visible = localPart.slice(0, 1);
  return `${visible}***@${domain}`;
}

export function logNewsletterSuccess(email: string) {
  console.info("[newsletter] subscription successful", {
    email: maskEmail(email),
  });
}

export function logNewsletterAlreadySubscribed(email: string) {
  console.info("[newsletter] subscription already exists", {
    email: maskEmail(email),
  });
}

export function logNewsletterFailure(
  email: string,
  details: Record<string, unknown>,
) {
  console.error("[newsletter] subscription failed", {
    email: maskEmail(email),
    ...details,
  });
}
