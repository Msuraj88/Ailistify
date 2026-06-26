"use server";

import { revalidatePath } from "next/cache";
import { ToolStatus } from "@/generated/prisma/client";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import {
  expireStaleMonetizationListings,
  resolveFeaturedListingInput,
  resolveSponsoredListingInput,
} from "@/lib/monetization/listings";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import {
  featuredListingSchema,
  sponsoredListingSchema,
} from "@/validations/monetization";

const REVALIDATE_PATHS = ["/admin", "/admin/tools", "/tools", "/"];

function revalidateMonetizationPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

export async function expireMonetizationListingsAction(): Promise<
  ActionResult<{ expiredFeatured: number; expiredSponsored: number }>
> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const result = await expireStaleMonetizationListings();
    revalidateMonetizationPaths();
    return { success: true, data: result };
  } catch {
    return {
      success: false,
      error: "Failed to expire listings. Please try again.",
    };
  }
}

export async function setFeaturedListing(
  toolId: string,
  input: { featured: boolean; featuredUntil?: string },
): Promise<ActionResult<{ featured: boolean; featuredUntil: Date | null }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = featuredListingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const listing = resolveFeaturedListingInput(parsed.data);
  const featuredUntil = listing.featuredUntil;

  if (listing.featured && featuredUntil && featuredUntil <= new Date()) {
    return {
      success: false,
      error: "Featured end date must be in the future.",
    };
  }

  try {
    const existing = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { id: true, status: true },
    });

    if (!existing) {
      return { success: false, error: "Tool not found." };
    }

    if (existing.status === ToolStatus.ARCHIVED && listing.featured) {
      return {
        success: false,
        error: "Archived tools cannot be featured.",
      };
    }

    const updated = await prisma.tool.update({
      where: { id: toolId },
      data: {
        featured: listing.featured,
        featuredUntil,
      },
      select: { featured: true, featuredUntil: true },
    });

    revalidateMonetizationPaths();
    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: "Failed to update featured listing.",
    };
  }
}

export async function setSponsoredListing(
  toolId: string,
  input: { sponsored: boolean; sponsoredUntil?: string },
): Promise<ActionResult<{ sponsored: boolean; sponsoredUntil: Date | null }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = sponsoredListingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const listing = resolveSponsoredListingInput(parsed.data);
  const sponsoredUntil = listing.sponsoredUntil;

  if (listing.sponsored && sponsoredUntil && sponsoredUntil <= new Date()) {
    return {
      success: false,
      error: "Sponsored end date must be in the future.",
    };
  }

  try {
    const existing = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { id: true, status: true },
    });

    if (!existing) {
      return { success: false, error: "Tool not found." };
    }

    if (existing.status !== ToolStatus.PUBLISHED && listing.sponsored) {
      return {
        success: false,
        error: "Only published tools can be sponsored.",
      };
    }

    const updated = await prisma.tool.update({
      where: { id: toolId },
      data: {
        sponsored: listing.sponsored,
        sponsoredUntil,
      },
      select: { sponsored: true, sponsoredUntil: true },
    });

    revalidateMonetizationPaths();
    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: "Failed to update sponsored listing.",
    };
  }
}

export async function setListingSchedule(
  toolId: string,
  input: {
    featured: boolean;
    featuredUntil?: string;
    sponsored: boolean;
    sponsoredUntil?: string;
  },
): Promise<ActionResult<void>> {
  const featuredResult = await setFeaturedListing(toolId, {
    featured: input.featured,
    featuredUntil: input.featuredUntil,
  });

  if (!featuredResult.success) {
    return featuredResult;
  }

  const sponsoredResult = await setSponsoredListing(toolId, {
    sponsored: input.sponsored,
    sponsoredUntil: input.sponsoredUntil,
  });

  if (!sponsoredResult.success) {
    return sponsoredResult;
  }

  return { success: true, data: undefined };
}
