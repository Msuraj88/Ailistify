import { prisma } from "@/lib/prisma";

export async function resolveUniqueToolSlug(
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.tool.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}
