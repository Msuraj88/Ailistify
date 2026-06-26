import { prisma } from "@/lib/prisma";

export async function expireStaleMonetizationListings(now = new Date()) {
  const [expiredFeatured, expiredSponsored] = await Promise.all([
    prisma.tool.updateMany({
      where: {
        featured: true,
        featuredUntil: { lt: now },
      },
      data: {
        featured: false,
        featuredUntil: null,
      },
    }),
    prisma.tool.updateMany({
      where: {
        sponsored: true,
        sponsoredUntil: { lt: now },
      },
      data: {
        sponsored: false,
        sponsoredUntil: null,
      },
    }),
  ]);

  return {
    expiredFeatured: expiredFeatured.count,
    expiredSponsored: expiredSponsored.count,
  };
}
