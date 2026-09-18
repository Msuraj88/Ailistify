import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getPgPoolOptions } from "@/lib/db/connection";
import { getDatabaseUrl } from "@/lib/env";

/**
 * Bump this when adding Prisma models so Next.js does not reuse a stale
 * global PrismaClient from before `prisma generate`.
 */
const PRISMA_GLOBAL_KEY = "__ailistify_prisma_v5_dodo__" as const;

type PrismaGlobalStore = {
  client?: PrismaClient;
  pool?: Pool;
};

function getGlobalStore(): PrismaGlobalStore {
  const root = globalThis as unknown as Record<
    string,
    PrismaGlobalStore | undefined
  >;
  if (!root[PRISMA_GLOBAL_KEY]) {
    root[PRISMA_GLOBAL_KEY] = {};
  }
  return root[PRISMA_GLOBAL_KEY]!;
}

function createPool(connectionString: string) {
  const pool = new Pool(getPgPoolOptions(connectionString));

  pool.on("error", (error) => {
    console.error("[pg] Unexpected idle client error:", error.message);
  });

  return pool;
}

function createPrismaClient() {
  const store = getGlobalStore();
  const connectionString = getDatabaseUrl();
  const pool = createPool(connectionString);
  store.pool = pool;

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

/**
 * Detect stale HMR clients from before Payment/Promotion were generated.
 * Prisma 7 exposes models as getters — only check for delegate presence.
 */
function hasCurrentModels(client: PrismaClient): boolean {
  const delegates = client as unknown as {
    payment?: unknown;
    promotion?: unknown;
  };
  return delegates.payment != null && delegates.promotion != null;
}

export async function resetPrismaClient() {
  const store = getGlobalStore();

  if (store.client) {
    await store.client.$disconnect().catch(() => undefined);
  }

  if (store.pool) {
    await store.pool.end().catch(() => undefined);
  }

  store.client = undefined;
  store.pool = undefined;
}

function getPrismaClient(): PrismaClient {
  const store = getGlobalStore();
  const existing = store.client;

  if (existing && hasCurrentModels(existing)) {
    return existing;
  }

  if (existing) {
    void existing.$disconnect().catch(() => undefined);
    if (store.pool) {
      void store.pool.end().catch(() => undefined);
    }
    store.client = undefined;
    store.pool = undefined;
  }

  const client = createPrismaClient();
  store.client = client;
  return client;
}

/**
 * Lazy proxy so each access uses the current Prisma client (avoids freezing a
 * stale instance after schema changes during Next.js HMR).
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
