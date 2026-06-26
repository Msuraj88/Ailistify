import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getPgPoolOptions } from "@/lib/db/connection";
import { getDatabaseUrl } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPool(connectionString: string) {
  const pool = new Pool(getPgPoolOptions(connectionString));

  pool.on("error", (error) => {
    console.error("[pg] Unexpected idle client error:", error.message);
  });

  return pool;
}

function createPrismaClient() {
  const connectionString = getDatabaseUrl();
  const pool = createPool(connectionString);
  globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export async function resetPrismaClient() {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect().catch(() => undefined);
  }

  if (globalForPrisma.pool) {
    await globalForPrisma.pool.end().catch(() => undefined);
  }

  globalForPrisma.prisma = undefined;
  globalForPrisma.pool = undefined;
}

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
