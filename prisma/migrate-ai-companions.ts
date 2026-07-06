import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  getPgPoolOptions,
  normalizeDatabaseUrl,
} from "../src/lib/db/connection";
import { slugify } from "./seed/helpers";

const CATEGORY = {
  name: "AI Companions",
  slug: slugify("AI Companions"),
  description:
    "AI girlfriend, boyfriend, character chat, and virtual companion platforms for romance, roleplay, and personal connection.",
};

const STRONG_PATTERNS = [
  /\bai girlfriend\b/i,
  /\bai boyfriend\b/i,
  /\bvirtual girlfriend\b/i,
  /\bvirtual boyfriend\b/i,
  /\bai companion(s)?\b/i,
  /\bai waifu\b/i,
  /\bai girl chat\b/i,
  /\bai boy chat\b/i,
  /\bgirlfriend app\b/i,
  /\bai dating\b/i,
  /\bromantic ai\b/i,
  /\bgirlfriend.*chat\b/i,
  /\bboyfriend.*chat\b/i,
  /\bchat with (your )?ai girlfriend\b/i,
  /\bcreate (your )?ai girlfriend\b/i,
  /\bcreate (your )?ai boyfriend\b/i,
  /\bpersonalized ai girlfriend\b/i,
  /\bpersonalized ai boyfriend\b/i,
];

const KNOWN_SLUGS = new Set([
  "herahaven",
  "charaverse",
  "rubii",
  "polybuzz",
  "replika",
  "crushon-ai",
  "kindroid",
  "nomi-ai",
  "anima-ai",
  "dreamgf",
  "fantasygf",
  "candy-ai",
  "chai",
  "chai-ai",
  "kajiwoto",
  "eviebot",
  "romantic-ai",
  "botify",
  "paradot",
  "genesia-ai",
  "lovecore-ai",
]);

const KNOWN_DOMAINS = [
  "herahaven.ai",
  "charaverse.chat",
  "rubii.ai",
  "polybuzz.ai",
  "replika.com",
  "crushon.ai",
  "kindroid.ai",
  "nomi.ai",
  "anima.ai",
  "dreamgf.ai",
  "fantasygf.ai",
  "candy.ai",
  "chai.ml",
  "kajiwoto.com",
  "eviebot.com",
];

const EXCLUDE_PATTERNS = [
  /\bcharacter animation\b/i,
  /\bcharacter generation\b/i,
  /\b3d (model|animation)\b/i,
  /\bmotion (graphics|design)\b/i,
  /\bvideo (generator|generation|production)\b/i,
  /\bimage (generator|generation)\b/i,
  /\bauto-?rigging\b/i,
  /\bstoryboard\b/i,
  /\btranslation\b/i,
  /\bcode review\b/i,
  /\bshopify\b/i,
  /\bad creation\b/i,
  /\bface swap\b/i,
];

type ToolRecord = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  websiteUrl: string;
  category: { name: string; slug: string };
};

function isCompanionTool(tool: ToolRecord): boolean {
  const text = [
    tool.name,
    tool.shortDescription,
    tool.fullDescription,
    tool.websiteUrl,
  ].join(" ");

  if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(text))) {
    const hasStrongCompanionSignal =
      STRONG_PATTERNS.some((pattern) => pattern.test(text)) ||
      KNOWN_SLUGS.has(tool.slug) ||
      KNOWN_DOMAINS.some((domain) => tool.websiteUrl.includes(domain));

    if (!hasStrongCompanionSignal) {
      return false;
    }
  }

  if (KNOWN_SLUGS.has(tool.slug)) {
    return true;
  }

  if (KNOWN_DOMAINS.some((domain) => tool.websiteUrl.includes(domain))) {
    return true;
  }

  return STRONG_PATTERNS.some((pattern) => pattern.test(text));
}

async function main() {
  const pool = new Pool(
    getPgPoolOptions(normalizeDatabaseUrl(process.env.DATABASE_URL ?? "")),
  );
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const category = await prisma.category.upsert({
    where: { slug: CATEGORY.slug },
    update: {
      name: CATEGORY.name,
      description: CATEGORY.description,
    },
    create: CATEGORY,
  });

  const tools = await prisma.tool.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      fullDescription: true,
      websiteUrl: true,
      category: { select: { name: true, slug: true } },
    },
  });

  const matches = tools.filter(isCompanionTool);
  const toUpdate = matches.filter((tool) => tool.category.slug !== category.slug);

  if (toUpdate.length > 0) {
    await prisma.tool.updateMany({
      where: { id: { in: toUpdate.map((tool) => tool.id) } },
      data: { categoryId: category.id },
    });
  }

  console.log(`Category: ${category.name} (${category.slug})`);
  console.log(`Matched tools: ${matches.length}`);
  console.log(`Updated tools: ${toUpdate.length}`);
  console.log(
    toUpdate.map((tool) => `- ${tool.name} (${tool.slug}) from ${tool.category.name}`).join("\n") ||
      "No tools needed updating.",
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
