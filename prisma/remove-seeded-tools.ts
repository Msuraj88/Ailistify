import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  getPgPoolOptions,
  normalizeDatabaseUrl,
} from "../src/lib/db/connection";

const KEEP_TOOL_SLUGS = new Set(["piclumen", "airmusicv25", "windsurf"]);

async function main() {
  const pool = new Pool(
    getPgPoolOptions(normalizeDatabaseUrl(process.env.DATABASE_URL ?? "")),
  );
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const kept = await prisma.tool.findMany({
      where: { slug: { in: Array.from(KEEP_TOOL_SLUGS) } },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    });

    const missing = Array.from(KEEP_TOOL_SLUGS).filter(
      (slug) => !kept.some((tool) => tool.slug === slug),
    );

    if (missing.length > 0) {
      throw new Error(
        `Expected tools not found in database: ${missing.join(", ")}`,
      );
    }

    const result = await prisma.tool.deleteMany({
      where: { slug: { notIn: Array.from(KEEP_TOOL_SLUGS) } },
    });

    console.log(`Removed ${result.count} seeded tools.`);
    console.log("Kept:");
    for (const tool of kept) {
      console.log(`  - ${tool.name} (${tool.slug})`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exit(1);
});
