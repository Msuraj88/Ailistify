import { prisma } from "@/lib/prisma";

export async function generatePromotionReferenceId(): Promise<string> {
  const promotions = await prisma.promotion.findMany({
    select: { referenceId: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  let maxNumber = 0;

  for (const promotion of promotions) {
    const match = promotion.referenceId.match(/^PR-(\d+)$/);
    if (match) {
      maxNumber = Math.max(maxNumber, Number.parseInt(match[1], 10));
    }
  }

  return `PR-${String(maxNumber + 1).padStart(6, "0")}`;
}
