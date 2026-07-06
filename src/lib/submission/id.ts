import { prisma } from "@/lib/prisma";

export async function generateSubmissionId(): Promise<string> {
  const tools = await prisma.tool.findMany({
    where: { submissionId: { not: null } },
    select: { submissionId: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  let maxNumber = 0;

  for (const tool of tools) {
    if (!tool.submissionId) {
      continue;
    }

    const match = tool.submissionId.match(/^AL-(\d+)$/);
    if (match) {
      maxNumber = Math.max(maxNumber, Number.parseInt(match[1], 10));
    }
  }

  const nextNumber = maxNumber + 1;
  return `AL-${String(nextNumber).padStart(6, "0")}`;
}
