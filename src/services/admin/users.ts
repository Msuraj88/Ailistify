import type { Prisma, ToolStatus } from "@/generated/prisma/client";
import { ToolStatus as ToolStatusEnum } from "@/generated/prisma/client";
import { FREE_QUEUE_STATS } from "@/lib/constants/tools";
import { prisma } from "@/lib/prisma";
import type {
  AdminFounderProfile,
  AdminFounderSubmittedTool,
  AdminUserListItem,
} from "@/types/admin-users";
import type { UserListFilters } from "@/validations/admin-users";

function buildWhere(filters: UserListFilters): Prisma.UserWhereInput {
  if (!filters.q?.trim()) {
    return {};
  }

  const q = filters.q.trim();
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ],
  };
}

function getSubmissionStage(
  status: ToolStatus,
  listingPlan: string,
): { stageLabel: string; stageDetail: string } {
  if (status === ToolStatusEnum.PUBLISHED) {
    return {
      stageLabel: "Published",
      stageDetail: "Live on the public directory",
    };
  }

  if (status === ToolStatusEnum.REJECTED) {
    return {
      stageLabel: "Rejected",
      stageDetail: "Stopped at review — awaiting resubmit",
    };
  }

  if (status === ToolStatusEnum.ARCHIVED) {
    return {
      stageLabel: "Archived",
      stageDetail: "Hidden from the website",
    };
  }

  if (status === ToolStatusEnum.DRAFT) {
    return {
      stageLabel: "Draft",
      stageDetail: "Not submitted for review yet",
    };
  }

  if (listingPlan === "PRIORITY" || listingPlan === "FEATURED") {
    return {
      stageLabel: "In queue",
      stageDetail: "Estimated publish: within 4-6 weeks",
    };
  }

  return {
    stageLabel: "In queue",
    stageDetail: `Estimated review: ${FREE_QUEUE_STATS.reviewDaysMin}–${FREE_QUEUE_STATS.reviewDaysMax} days`,
  };
}

export async function getAdminUsers(
  filters: UserListFilters = {},
): Promise<AdminUserListItem[]> {
  const users = await prisma.user.findMany({
    where: buildWhere(filters),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      _count: { select: { submittedTools: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    createdAt: user.createdAt,
    submittedToolCount: user._count.submittedTools,
    isFounder: user._count.submittedTools > 0,
  }));
}

export async function getAdminFounderProfile(
  userId: string,
): Promise<AdminFounderProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      submittedTools: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          websiteUrl: true,
          shortDescription: true,
          pricingModel: true,
          status: true,
          listingPlan: true,
          paymentStatus: true,
          submissionId: true,
          submitterEmail: true,
          rejectionReason: true,
          featured: true,
          verified: true,
          views: true,
          clicks: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const tools: AdminFounderSubmittedTool[] = user.submittedTools.map((tool) => {
    const stage = getSubmissionStage(tool.status, tool.listingPlan);
    return {
      ...tool,
      ...stage,
    };
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isFounder: tools.length > 0,
    submittedToolCount: tools.length,
    tools,
  };
}
