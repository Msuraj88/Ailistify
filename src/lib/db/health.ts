import { prisma } from "@/lib/prisma";
import { getDatabaseUrl, isDatabaseUrlConfigured } from "@/lib/env";

export type DatabaseHealthStatus = {
  status: "healthy" | "unhealthy";
  connected: boolean;
  databaseUrlConfigured: boolean;
  latencyMs?: number;
  timestamp: string;
  error?: string;
};

export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const timestamp = new Date().toISOString();
  const databaseUrlConfigured = isDatabaseUrlConfigured();

  if (!databaseUrlConfigured) {
    return {
      status: "unhealthy",
      connected: false,
      databaseUrlConfigured: false,
      timestamp,
      error: "DATABASE_URL is not configured",
    };
  }

  // Validate URL format early without exposing the value
  try {
    getDatabaseUrl();
  } catch (error) {
    return {
      status: "unhealthy",
      connected: false,
      databaseUrlConfigured: false,
      timestamp,
      error: error instanceof Error ? error.message : "Invalid DATABASE_URL",
    };
  }

  const start = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);

    return {
      status: "healthy",
      connected: true,
      databaseUrlConfigured: true,
      latencyMs,
      timestamp,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      connected: false,
      databaseUrlConfigured: true,
      timestamp,
      error:
        error instanceof Error ? error.message : "Database connection failed",
    };
  }
}
