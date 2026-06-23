import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  PrismaClient,
  ToolStatus,
  UserRole,
} from "../src/generated/prisma/client";
import { categories } from "./seed/data/categories";
import { tags } from "./seed/data/tags";
import { tools } from "./seed/data/tools";
import { logoUrl } from "./seed/helpers";

const ADMIN_EMAIL = "admin@ailistify.com";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Check your .env file.");
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

async function seedAdmin(prisma: PrismaClient) {
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Admin",
      role: UserRole.ADMIN,
    },
    create: {
      name: "Admin",
      email: ADMIN_EMAIL,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log(`✓ Admin user: ${admin.email}`);
  return admin;
}

async function seedCategories(prisma: PrismaClient) {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    });
  }

  console.log(`✓ Categories: ${categories.length}`);
}

async function seedTags(prisma: PrismaClient) {
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {
        name: tag.name,
        description: tag.description,
        metaTitle: `${tag.name} AI Tools | AIListify`,
        metaDescription: tag.description.slice(0, 160),
      },
      create: {
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        metaTitle: `${tag.name} AI Tools | AIListify`,
        metaDescription: tag.description.slice(0, 160),
      },
    });
  }

  console.log(`✓ Tags: ${tags.length}`);
}

async function seedTools(prisma: PrismaClient, adminId: string) {
  const [categoryRecords, tagRecords] = await Promise.all([
    prisma.category.findMany(),
    prisma.tag.findMany(),
  ]);

  const categoryBySlug = new Map(
    categoryRecords.map((category) => [category.slug, category.id]),
  );
  const tagBySlug = new Map(tagRecords.map((tag) => [tag.slug, tag.id]));

  for (const [index, toolSeed] of tools.entries()) {
    const categoryId = categoryBySlug.get(toolSeed.categorySlug);

    if (!categoryId) {
      throw new Error(
        `Missing category slug "${toolSeed.categorySlug}" for tool "${toolSeed.name}"`,
      );
    }

    const tagIds = toolSeed.tagSlugs
      .map((slug) => tagBySlug.get(slug))
      .filter((id): id is string => Boolean(id));

    const featuredUntil = toolSeed.featured
      ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * (1 + (index % 3)))
      : null;

    const tool = await prisma.tool.upsert({
      where: { slug: toolSeed.slug },
      update: {
        name: toolSeed.name,
        websiteUrl: toolSeed.websiteUrl,
        logo: logoUrl(toolSeed.name, toolSeed.slug),
        pricingModel: toolSeed.pricingModel,
        shortDescription: toolSeed.shortDescription,
        fullDescription: toolSeed.fullDescription,
        metaTitle: `${toolSeed.name} — AI Tool Review | AIListify`,
        metaDescription: toolSeed.shortDescription.slice(0, 160),
        featured: toolSeed.featured,
        featuredUntil,
        verified: toolSeed.verified,
        status: ToolStatus.PUBLISHED,
        views: 500 + index * 137,
        clicks: 50 + index * 17,
        categoryId,
        submittedById: adminId,
      },
      create: {
        name: toolSeed.name,
        slug: toolSeed.slug,
        websiteUrl: toolSeed.websiteUrl,
        logo: logoUrl(toolSeed.name, toolSeed.slug),
        pricingModel: toolSeed.pricingModel,
        shortDescription: toolSeed.shortDescription,
        fullDescription: toolSeed.fullDescription,
        metaTitle: `${toolSeed.name} — AI Tool Review | AIListify`,
        metaDescription: toolSeed.shortDescription.slice(0, 160),
        featured: toolSeed.featured,
        featuredUntil,
        verified: toolSeed.verified,
        status: ToolStatus.PUBLISHED,
        views: 500 + index * 137,
        clicks: 50 + index * 17,
        categoryId,
        submittedById: adminId,
      },
    });

    await prisma.toolTag.deleteMany({ where: { toolId: tool.id } });

    if (tagIds.length > 0) {
      await prisma.toolTag.createMany({
        data: tagIds.map((tagId) => ({ toolId: tool.id, tagId })),
        skipDuplicates: true,
      });
    }
  }

  console.log(`✓ Tools: ${tools.length}`);
}

async function main() {
  const prisma = createPrismaClient();

  try {
    console.log("🌱 Seeding AIListify database...\n");

    const admin = await seedAdmin(prisma);
    await seedCategories(prisma);
    await seedTags(prisma);
    await seedTools(prisma, admin.id);

    console.log("\n✅ Seed completed successfully.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("\n❌ Seed failed:", error);
  process.exit(1);
});
