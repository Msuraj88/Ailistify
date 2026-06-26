import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, UserRole } from "../src/generated/prisma/client";
import {
  getPgPoolOptions,
  normalizeDatabaseUrl,
} from "../src/lib/db/connection";

const ADMIN_EMAIL = "admin@ailistify.com";
const password = process.argv[2] ?? process.env.ADMIN_PASSWORD ?? "Admin123!";

async function main() {
  const connectionString = normalizeDatabaseUrl(
    process.env.DATABASE_URL ?? "",
  );

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const pool = new Pool(getPgPoolOptions(connectionString));

  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Admin",
      role: UserRole.ADMIN,
      password: hashedPassword,
      emailVerified: new Date(),
    },
    create: {
      name: "Admin",
      email: ADMIN_EMAIL,
      role: UserRole.ADMIN,
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log(`✓ Admin password set for ${admin.email}`);
  console.log("  Use this password to sign in at /login");

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
