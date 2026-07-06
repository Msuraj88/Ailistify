import { prisma } from "@/lib/prisma";
import { normalizeWebsiteHost } from "@/validations/analyze-tool";

export async function findToolByWebsiteHost(
  url: string,
  excludeToolId?: string,
): Promise<{ id: string; name: string; slug: string } | null> {
  const host = normalizeWebsiteHost(url);

  const candidates = await prisma.tool.findMany({
    where: {
      ...(excludeToolId ? { NOT: { id: excludeToolId } } : {}),
      OR: [
        { websiteUrl: { contains: host, mode: "insensitive" } },
        { websiteUrl: { contains: `www.${host}`, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      websiteUrl: true,
    },
    take: 20,
  });

  const match = candidates.find(
    (tool) => normalizeWebsiteHost(tool.websiteUrl) === host,
  );

  if (!match) {
    return null;
  }

  return {
    id: match.id,
    name: match.name,
    slug: match.slug,
  };
}
