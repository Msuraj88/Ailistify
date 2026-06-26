import { resetPrismaClient } from "@/lib/prisma";

const TRANSIENT_DB_ERROR_PATTERN =
  /connection terminated|connection closed|econnreset|econnrefused|timeout expired|client has encountered a connection error|can't reach database server/i;

export function isTransientDbError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const message =
    error instanceof Error
      ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}`
      : String(error);

  return TRANSIENT_DB_ERROR_PATTERN.test(message);
}

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  retries = 2,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isTransientDbError(error) || attempt === retries) {
        throw error;
      }

      await resetPrismaClient();
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
    }
  }

  throw lastError;
}
