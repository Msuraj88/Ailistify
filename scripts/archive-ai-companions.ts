import "dotenv/config";
import { ToolStatus } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

const CATEGORY_SLUG = "ai-companions";

async function main() {
  const category = await prisma.category.findUnique({
    where: { slug: CATEGORY_SLUG },
    select: { id: true, name: true },
  });

  if (!category) {
    console.error(`Category not found: ${CATEGORY_SLUG}`);
    process.exit(1);
  }

  const result = await prisma.tool.updateMany({
    where: {
      categoryId: category.id,
      status: { not: ToolStatus.ARCHIVED },
    },
    data: {
      status: ToolStatus.ARCHIVED,
      featured: false,
    },
  });

  console.log(
    `Archived ${result.count} tool(s) in category "${category.name}" (${CATEGORY_SLUG}).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
