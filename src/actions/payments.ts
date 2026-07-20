"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ListingPlan,
  PaymentStatus,
  ToolStatus,
} from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { PaymentService } from "@/lib/payments/services/payment-service";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import { promoteCheckoutSchema } from "@/validations/promote";

const paidPlanSchema = z.enum(["PRIORITY", "FEATURED"]);

function revalidatePaymentPaths(toolId?: string) {
  revalidatePath("/my-tools");
  revalidatePath("/admin/tools");
  revalidatePath("/admin/payments");
  if (toolId) {
    revalidatePath(`/my-tools/${toolId}/edit`);
  }
}

export async function startToolCheckout(
  toolId: string,
  listingPlan: "PRIORITY" | "FEATURED",
): Promise<ActionResult<{ approvalUrl: string; paymentId: string }>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const parsedPlan = paidPlanSchema.safeParse(listingPlan);
  if (!parsedPlan.success) {
    return { success: false, error: "Invalid listing plan." };
  }

  if (!PaymentService.isConfigured()) {
    return {
      success: false,
      error: "Payments are temporarily unavailable. Please try again later.",
    };
  }

  try {
    const tool = await prisma.tool.findFirst({
      where: { id: toolId, submittedById: session.user.id },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        submissionId: true,
      },
    });

    if (!tool?.submissionId) {
      return { success: false, error: "Tool submission not found." };
    }

    if (tool.paymentStatus === PaymentStatus.PAID) {
      return { success: false, error: "This submission is already paid." };
    }

    if (
      tool.status !== ToolStatus.PENDING &&
      tool.status !== ToolStatus.REJECTED &&
      tool.status !== ToolStatus.DRAFT
    ) {
      return {
        success: false,
        error: "Only queued submissions can start checkout.",
      };
    }

    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        listingPlan:
          parsedPlan.data === "FEATURED"
            ? ListingPlan.FEATURED
            : ListingPlan.PRIORITY,
        paymentStatus: PaymentStatus.PENDING,
        status: ToolStatus.PENDING,
      },
    });

    const checkout = await PaymentService.createCheckout({
      toolId: tool.id,
      listingPlan: parsedPlan.data,
    });

    revalidatePaymentPaths(tool.id);

    return {
      success: true,
      data: {
        approvalUrl: checkout.approvalUrl,
        paymentId: checkout.paymentId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to start PayPal checkout.",
    };
  }
}

export async function retryToolPayment(
  toolId: string,
): Promise<ActionResult<{ approvalUrl: string; paymentId: string }>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const tool = await prisma.tool.findFirst({
    where: { id: toolId, submittedById: session.user.id },
    select: {
      id: true,
      listingPlan: true,
      paymentStatus: true,
    },
  });

  if (!tool) {
    return { success: false, error: "Submission not found." };
  }

  if (
    tool.listingPlan !== ListingPlan.PRIORITY &&
    tool.listingPlan !== ListingPlan.FEATURED
  ) {
    return {
      success: false,
      error: "Choose Priority or Featured before retrying payment.",
    };
  }

  if (tool.paymentStatus === PaymentStatus.PAID) {
    return { success: false, error: "This submission is already paid." };
  }

  return startToolCheckout(tool.id, tool.listingPlan);
}

export async function adminMarkPaymentPaid(
  paymentId: string,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const payment = await PaymentService.adminMarkPaid(paymentId);
    revalidatePaymentPaths(payment.toolId ?? undefined);
    revalidatePath("/admin/payments");
    return { success: true, data: { id: payment.id } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark payment as paid.",
    };
  }
}

export async function createPromotionPayPalOrder(input: {
  plan: "HOMEPAGE_SPONSOR" | "FEATURED_LISTING";
  contactEmail: string;
  toolUrl: string;
}): Promise<
  ActionResult<{
    orderId: string;
    paymentId: string;
    promotionId: string;
    referenceId: string;
  }>
> {
  const parsed = promoteCheckoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid checkout details.",
    };
  }

  if (!PaymentService.isConfigured()) {
    return {
      success: false,
      error: "Payments are temporarily unavailable. Please try again later.",
    };
  }

  try {
    const checkout = await PaymentService.createPromotionCheckout(parsed.data);
    revalidatePath("/admin/payments");
    return {
      success: true,
      data: {
        orderId: checkout.providerOrderId,
        paymentId: checkout.paymentId,
        promotionId: checkout.promotionId,
        referenceId: checkout.referenceId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to start promotion checkout.",
    };
  }
}

export async function capturePromotionPayPalOrder(
  providerOrderId: string,
): Promise<
  ActionResult<{
    paymentId: string;
    promotionId: string | null;
    referenceId: string;
  }>
> {
  if (!providerOrderId.trim()) {
    return { success: false, error: "Missing PayPal order ID." };
  }

  try {
    const result = await PaymentService.captureCheckout(providerOrderId.trim());
    revalidatePath("/admin/payments");
    revalidatePath("/promote");
    return {
      success: true,
      data: {
        paymentId: result.paymentId,
        promotionId: result.promotionId,
        referenceId: result.submissionId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to capture promotion payment.",
    };
  }
}
