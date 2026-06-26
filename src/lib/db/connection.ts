function usesNeonHost(url: string): boolean {
  return url.includes(".neon.tech");
}

function normalizeSslParams(url: string): string {
  try {
    const parsed = new URL(url);
    const sslmode = parsed.searchParams.get("sslmode");

    if (
      sslmode === "require" ||
      sslmode === "prefer" ||
      sslmode === "verify-ca"
    ) {
      parsed.searchParams.set("uselibpqcompat", "true");
      parsed.searchParams.set("sslmode", "require");
      return parsed.toString();
    }

    if (!sslmode && usesNeonHost(url)) {
      parsed.searchParams.set("uselibpqcompat", "true");
      parsed.searchParams.set("sslmode", "require");
      return parsed.toString();
    }

    return url;
  } catch {
    return url;
  }
}

export function normalizeDatabaseUrl(url: string): string {
  let normalized = url;

  if (usesNeonHost(normalized) && !normalized.includes("-pooler.")) {
    normalized = normalized.replace(/(@ep-[^.]+)\./, "$1-pooler.");
  }

  return normalizeSslParams(normalized);
}

export function databaseUrlUsesSsl(url: string): boolean {
  return (
    usesNeonHost(url) ||
    /sslmode=(require|verify-full|verify-ca|prefer)/.test(url)
  );
}

export function getPgPoolOptions(connectionString: string) {
  const normalizedConnectionString = normalizeDatabaseUrl(connectionString);

  return {
    connectionString: normalizedConnectionString,
    ssl: databaseUrlUsesSsl(normalizedConnectionString)
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  };
}
