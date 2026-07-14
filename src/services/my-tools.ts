import { ToolStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { FREE_QUEUE_STATS } from "@/lib/constants/tools";

export type MyToolListItem = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  shortDescription: string;
  status: ToolStatus;
  listingPlan: string;
  paymentStatus: string;
  submissionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  websiteUrl: string;
  category: { id: string; name: string } | null;
  queueLabel: string;
  estimatedReview: string;
  canEdit: boolean;
};

function getQueueMeta(status: ToolStatus, listingPlan: string) {
  if (status === ToolStatus.PUBLISHED) {
    return {
      queueLabel: "Published",
      estimatedReview: "Live on AIListify",
      canEdit: false,
    };
  }

  if (status === ToolStatus.REJECTED) {
    return {
      queueLabel: "Rejected",
      estimatedReview: "Update and resubmit for review",
      canEdit: true,
    };
  }

  if (status === ToolStatus.ARCHIVED) {
    return {
      queueLabel: "Archived",
      estimatedReview: "No longer in review",
      canEdit: false,
    };
  }

  if (listingPlan === "PRIORITY" || listingPlan === "FEATURED") {
    return {
      queueLabel: "Queue",
      estimatedReview: "Estimated publish: within 4-6 weeks",
      canEdit: true,
    };
  }

  return {
    queueLabel: "Queue",
    estimatedReview: `Estimated review: ${FREE_QUEUE_STATS.reviewDaysMin}–${FREE_QUEUE_STATS.reviewDaysMax} days (~${Math.ceil(FREE_QUEUE_STATS.reviewDaysMin / 7)}–${Math.ceil(FREE_QUEUE_STATS.reviewDaysMax / 7)} weeks)`,
    canEdit: true,
  };
}

export async function getMySubmittedTools(userId: string) {
  const tools = await prisma.tool.findMany({
    where: { submittedById: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      shortDescription: true,
      status: true,
      listingPlan: true,
      paymentStatus: true,
      submissionId: true,
      createdAt: true,
      updatedAt: true,
      websiteUrl: true,
      category: { select: { id: true, name: true } },
    },
  });

  return tools.map((tool) => {
    const meta = getQueueMeta(tool.status, tool.listingPlan);
    return {
      ...tool,
      listingPlan: tool.listingPlan,
      paymentStatus: tool.paymentStatus,
      ...meta,
    } satisfies MyToolListItem;
  });
}

export async function getMyToolById(userId: string, toolId: string) {
  const tool = await prisma.tool.findFirst({
    where: {
      id: toolId,
      submittedById: userId,
    },
    include: {
      category: { select: { id: true, name: true } },
      tags: { select: { tagId: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          imageUrl: true,
          altText: true,
          caption: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!tool) {
    return null;
  }

  return {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    websiteUrl: tool.websiteUrl,
    pricingUrl: tool.pricingUrl,
    logo: tool.logo,
    shortDescription: tool.shortDescription,
    fullDescription: tool.fullDescription,
    categoryId: tool.categoryId,
    tagIds: tool.tags.map((tag) => tag.tagId),
    pricingModel: tool.pricingModel,
    status: tool.status,
    listingPlan: tool.listingPlan,
    paymentStatus: tool.paymentStatus,
    submitterEmail: tool.submitterEmail,
    metaTitle: tool.metaTitle,
    metaDescription: tool.metaDescription,
    twitterUrl: tool.twitterUrl,
    linkedinUrl: tool.linkedinUrl,
    youtubeUrl: tool.youtubeUrl,
    discordUrl: tool.discordUrl,
    images: tool.images,
    submissionId: tool.submissionId,
  };
}
