"use server";

import { revalidatePath } from "next/cache";
import { ToolStatus } from "@/generated/prisma/client";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import {
  sendSubmissionApprovedEmail,
  sendSubmissionRejectedEmail,
} from "@/lib/email/tool-submission";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import { rejectToolSubmissionSchema } from "@/validations/submit-tool";

const REVALIDATE_PATHS = ["/tools", "/admin/tools", "/submit-tool"];

function revalidateModerationPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

async function getPendingTool(toolId: string) {
  return prisma.tool.findUnique({
    where: { id: toolId },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      submitterEmail: true,
      submittedBy: { select: { email: true } },
    },
  });
}

function resolveSubmitterEmail(tool: {
  submitterEmail: string | null;
  submittedBy: { email: string } | null;
}) {
  return tool.submitterEmail ?? tool.submittedBy?.email ?? null;
}

export async function approveToolSubmission(
  toolId: string,
): Promise<ActionResult<{ id: string; status: ToolStatus }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const tool = await getPendingTool(toolId);

    if (!tool) {
      return { success: false, error: "Tool not found." };
    }

    if (tool.status !== ToolStatus.PENDING) {
      return {
        success: false,
        error: "Only pending submissions can be approved.",
      };
    }

    const updated = await prisma.tool.update({
      where: { id: toolId },
      data: {
        status: ToolStatus.PUBLISHED,
        rejectionReason: null,
      },
      select: { id: true, status: true, name: true, slug: true },
    });

    const submitterEmail = resolveSubmitterEmail(tool);
    if (submitterEmail) {
      await sendSubmissionApprovedEmail({
        submitterEmail,
        toolName: updated.name,
        toolSlug: updated.slug,
      });
    }

    revalidateModerationPaths();
    revalidatePath(`/admin/tools/${toolId}/edit`);
    revalidatePath(`/tools/${updated.slug}`);

    return { success: true, data: { id: updated.id, status: updated.status } };
  } catch {
    return {
      success: false,
      error: "Failed to approve submission. Please try again.",
    };
  }
}

export async function publishTool(
  toolId: string,
): Promise<ActionResult<{ id: string; status: ToolStatus }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      select: {
        id: true,
        status: true,
        name: true,
        slug: true,
        submitterEmail: true,
        submittedBy: { select: { email: true } },
      },
    });

    if (!tool) {
      return { success: false, error: "Tool not found." };
    }

    if (
      tool.status !== ToolStatus.PENDING &&
      tool.status !== ToolStatus.DRAFT &&
      tool.status !== ToolStatus.REJECTED
    ) {
      return {
        success: false,
        error: "This tool cannot be published from its current status.",
      };
    }

    const wasPending = tool.status === ToolStatus.PENDING;

    const updated = await prisma.tool.update({
      where: { id: toolId },
      data: {
        status: ToolStatus.PUBLISHED,
        rejectionReason: null,
      },
      select: { id: true, status: true, name: true, slug: true },
    });

    if (wasPending) {
      const submitterEmail = resolveSubmitterEmail(tool);
      if (submitterEmail) {
        await sendSubmissionApprovedEmail({
          submitterEmail,
          toolName: updated.name,
          toolSlug: updated.slug,
        });
      }
    }

    revalidateModerationPaths();
    revalidatePath(`/admin/tools/${toolId}/edit`);
    revalidatePath(`/tools/${updated.slug}`);

    return { success: true, data: { id: updated.id, status: updated.status } };
  } catch {
    return {
      success: false,
      error: "Failed to publish tool. Please try again.",
    };
  }
}

export async function rejectToolSubmission(input: {
  toolId: string;
  reason?: string;
}): Promise<ActionResult<{ id: string; status: ToolStatus }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = rejectToolSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { toolId, reason } = parsed.data;

  try {
    const tool = await getPendingTool(toolId);

    if (!tool) {
      return { success: false, error: "Tool not found." };
    }

    if (tool.status !== ToolStatus.PENDING) {
      return {
        success: false,
        error: "Only pending submissions can be rejected.",
      };
    }

    const normalizedReason = reason?.trim() ? reason.trim() : null;

    const updated = await prisma.tool.update({
      where: { id: toolId },
      data: {
        status: ToolStatus.REJECTED,
        rejectionReason: normalizedReason,
      },
      select: { id: true, status: true, name: true },
    });

    const submitterEmail = resolveSubmitterEmail(tool);
    if (submitterEmail) {
      await sendSubmissionRejectedEmail({
        submitterEmail,
        toolName: updated.name,
        reason: normalizedReason,
      });
    }

    revalidateModerationPaths();
    revalidatePath(`/admin/tools/${toolId}/edit`);

    return { success: true, data: { id: updated.id, status: updated.status } };
  } catch {
    return {
      success: false,
      error: "Failed to reject submission. Please try again.",
    };
  }
}
