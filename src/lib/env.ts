import { normalizeDatabaseUrl } from "@/lib/db/connection";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file.`,
    );
  }

  return value;
}

export function getDatabaseUrl(): string {
  const pooledUrl = process.env.DATABASE_URL_POOLED?.trim();
  const url = pooledUrl ?? requireEnv("DATABASE_URL");

  return normalizeDatabaseUrl(url);
}

export function isDatabaseUrlConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
