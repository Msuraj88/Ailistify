import {
  GatewayPaymentStatus,
  ListingPlan,
  PaymentMethodType,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  PromotionPlan,
  PromotionStatus,
} from "@/generated/prisma/client";
import {
  buildPaymentCancelUrl,
  buildPaymentReturnUrl,
  buildPromotionCancelUrl,
  buildPromotionReturnUrl,
  getPlanAmount,
  getPlanLabel,
  getPromotePlanAmount,
  getPromotePlanLabel,
  isPayPalConfigured,
} from "@/lib/payments/config";
import { paypalProvider } from "@/lib/payments/providers/paypal";
import type {
  CaptureCheckoutResult,
  CreateCheckoutResult,
  PaidListingPlan,
  PaymentEventType,
  PaymentProvider as PaymentProviderAdapter,
  PromotePlan,
} from "@/lib/payments/types";
import { prisma } from "@/lib/prisma";
import { generatePromotionReferenceId } from "@/lib/promotion/id";
import {
  sendPaymentCancelledEmail,
  sendPaymentFailedEmail,
  sendPaymentSuccessEmail,
} from "@/lib/email/payments";

const providers: Record<string, PaymentProviderAdapter> = {
  paypal: paypalProvider,
};

function getProvider(id: string = "paypal"): PaymentProviderAdapter {
  const provider = providers[id];
  if (!provider) {
    throw new Error(`Payment provider "${id}" is not registered.`);
  }
  return provider;
}

async function recordEvent(
  paymentId: string,
  type: PaymentEventType,
  message?: string,
  payload?: unknown,
) {
  await prisma.paymentEvent.create({
    data: {
      paymentId,
      type,
      message: message ?? null,
      payload:
        payload === undefined ? undefined : (payload as Prisma.InputJsonValue),
    },
  });
}

function toNumber(value: Prisma.Decimal | number | string): number {
  return typeof value === "number" ? value : Number(value);
}

async function markToolPaid(input: {
  toolId: string;
  providerOrderId: string;
  listingPlan: ListingPlan;
}) {
  const featuredUntil =
    input.listingPlan === ListingPlan.FEATURED
      ? new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
      : null;

  await prisma.tool.update({
    where: { id: input.toolId },
    data: {
      paymentStatus: PaymentStatus.PAID,
      paypalOrderId: input.providerOrderId,
      featured: input.listingPlan === ListingPlan.FEATURED,
      featuredUntil,
      status: "PENDING",
    },
  });
}

export const PaymentService = {
  isConfigured() {
    return isPayPalConfigured();
  },

  async createCheckout(input: {
    toolId: string;
    listingPlan: PaidListingPlan;
    provider?: string;
  }): Promise<CreateCheckoutResult> {
    const provider = getProvider(input.provider ?? "paypal");

    const tool = await prisma.tool.findUnique({
      where: { id: input.toolId },
      select: {
        id: true,
        name: true,
        submissionId: true,
        paymentStatus: true,
        listingPlan: true,
        submitterEmail: true,
        submittedBy: { select: { email: true } },
      },
    });

    if (!tool?.submissionId) {
      throw new Error("Tool submission not found.");
    }

    if (tool.paymentStatus === PaymentStatus.PAID) {
      throw new Error("This submission is already paid.");
    }

    const amount = getPlanAmount(input.listingPlan);
    const description = `AIListify ${getPlanLabel(input.listingPlan)} — ${tool.name}`;

    // Prevent duplicate open checkouts for the same submission + plan.
    const existingOpen = await prisma.payment.findFirst({
      where: {
        toolId: tool.id,
        submissionId: tool.submissionId,
        status: {
          in: [GatewayPaymentStatus.CREATED, GatewayPaymentStatus.APPROVED],
        },
        amount,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingOpen?.providerOrderId) {
      const order = await provider.getOrder(existingOpen.providerOrderId);
      const approval =
        (
          order.raw as { links?: Array<{ rel?: string; href?: string }> }
        )?.links?.find(
          (link) => link.rel === "approve" || link.rel === "payer-action",
        )?.href ?? null;

      if (
        approval &&
        order.status !== "COMPLETED" &&
        order.status !== "VOIDED"
      ) {
        return {
          paymentId: existingOpen.id,
          providerOrderId: existingOpen.providerOrderId,
          approvalUrl: approval,
        };
      }
    }

    const created = await provider.createOrder({
      toolId: tool.id,
      submissionId: tool.submissionId,
      listingPlan: input.listingPlan,
      amount,
      currency: "USD",
      description,
      returnUrl: buildPaymentReturnUrl(tool.submissionId),
      cancelUrl: buildPaymentCancelUrl(tool.submissionId),
      payerEmail: tool.submitterEmail ?? tool.submittedBy?.email,
    });

    const payment = await prisma.$transaction(async (tx) => {
      const row = await tx.payment.create({
        data: {
          submissionId: tool.submissionId!,
          toolId: tool.id,
          provider: PaymentProvider.PAYPAL,
          providerOrderId: created.providerOrderId,
          amount,
          currency: "USD",
          status: GatewayPaymentStatus.CREATED,
          paymentMethod: PaymentMethodType.PAYPAL,
          gatewayResponse: created.raw as Prisma.InputJsonValue,
        },
      });

      await tx.tool.update({
        where: { id: tool.id },
        data: {
          listingPlan:
            input.listingPlan === "FEATURED"
              ? ListingPlan.FEATURED
              : ListingPlan.PRIORITY,
          paymentStatus: PaymentStatus.PENDING,
          paypalOrderId: created.providerOrderId,
        },
      });

      await tx.paymentEvent.create({
        data: {
          paymentId: row.id,
          type: "PAYMENT_STARTED",
          message: "PayPal checkout started",
          payload: created.raw as Prisma.InputJsonValue,
        },
      });

      return row;
    });

    return {
      paymentId: payment.id,
      providerOrderId: created.providerOrderId,
      approvalUrl: created.approvalUrl,
    };
  },

  async createPromotionCheckout(input: {
    plan: PromotePlan;
    contactEmail: string;
    toolUrl: string;
    provider?: string;
  }): Promise<
    CreateCheckoutResult & { promotionId: string; referenceId: string }
  > {
    const provider = getProvider(input.provider ?? "paypal");
    const amount = getPromotePlanAmount(input.plan);
    const planLabel = getPromotePlanLabel(input.plan);
    const referenceId = await generatePromotionReferenceId();

    const description = `AIListify ${planLabel} — ${input.toolUrl}`.slice(
      0,
      127,
    );

    const created = await provider.createOrder({
      submissionId: referenceId,
      amount,
      currency: "USD",
      description,
      returnUrl: buildPromotionReturnUrl(referenceId),
      cancelUrl: buildPromotionCancelUrl(referenceId),
      payerEmail: input.contactEmail,
    });

    const { payment, promotion } = await prisma.$transaction(async (tx) => {
      const promotionRow = await tx.promotion.create({
        data: {
          referenceId,
          plan: input.plan as PromotionPlan,
          contactEmail: input.contactEmail,
          toolUrl: input.toolUrl,
          status: PromotionStatus.PENDING_PAYMENT,
          amount,
          currency: "USD",
        },
      });

      const paymentRow = await tx.payment.create({
        data: {
          submissionId: referenceId,
          promotionId: promotionRow.id,
          provider: PaymentProvider.PAYPAL,
          providerOrderId: created.providerOrderId,
          amount,
          currency: "USD",
          status: GatewayPaymentStatus.CREATED,
          paymentMethod: PaymentMethodType.PAYPAL,
          payerEmail: input.contactEmail,
          gatewayResponse: created.raw as Prisma.InputJsonValue,
        },
      });

      await tx.paymentEvent.create({
        data: {
          paymentId: paymentRow.id,
          type: "PAYMENT_STARTED",
          message: "Promotion PayPal checkout started",
          payload: created.raw as Prisma.InputJsonValue,
        },
      });

      return { payment: paymentRow, promotion: promotionRow };
    });

    return {
      paymentId: payment.id,
      providerOrderId: created.providerOrderId,
      approvalUrl: created.approvalUrl,
      promotionId: promotion.id,
      referenceId,
    };
  },

  async captureCheckout(
    providerOrderId: string,
  ): Promise<CaptureCheckoutResult> {
    const provider = getProvider("paypal");

    const payment = await prisma.payment.findUnique({
      where: { providerOrderId },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            listingPlan: true,
            paymentStatus: true,
            submissionId: true,
            submitterEmail: true,
            submittedBy: { select: { email: true } },
          },
        },
        promotion: {
          select: {
            id: true,
            referenceId: true,
            plan: true,
            contactEmail: true,
            toolUrl: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error("Payment record not found for this PayPal order.");
    }

    if (payment.status === GatewayPaymentStatus.PAID) {
      return {
        paymentId: payment.id,
        submissionId: payment.submissionId,
        toolId: payment.toolId,
        promotionId: payment.promotionId,
        providerOrderId: payment.providerOrderId!,
        providerCaptureId: payment.providerCaptureId,
        amount: toNumber(payment.amount),
        currency: payment.currency,
        status: "PAID",
        payerEmail: payment.payerEmail,
        payerName: payment.payerName,
        country: payment.country,
        alreadyCaptured: true,
      };
    }

    const expectedAmount = toNumber(payment.amount);
    let capture;

    try {
      capture = await provider.captureOrder(providerOrderId);
    } catch (error) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: GatewayPaymentStatus.FAILED,
            gatewayResponse: {
              error: error instanceof Error ? error.message : "capture_failed",
            } as Prisma.InputJsonValue,
          },
        });
        if (payment.toolId) {
          await tx.tool.update({
            where: { id: payment.toolId },
            data: { paymentStatus: PaymentStatus.FAILED },
          });
        }
        if (payment.promotionId) {
          await tx.promotion.update({
            where: { id: payment.promotionId },
            data: { status: PromotionStatus.FAILED },
          });
        }
        await tx.paymentEvent.create({
          data: {
            paymentId: payment.id,
            type: "PAYMENT_FAILED",
            message: error instanceof Error ? error.message : "Capture failed",
          },
        });
      });

      const email =
        payment.tool?.submitterEmail ??
        payment.tool?.submittedBy?.email ??
        payment.promotion?.contactEmail ??
        payment.payerEmail;
      if (email && payment.tool) {
        await sendPaymentFailedEmail({
          submitterEmail: email,
          toolName: payment.tool.name,
          submissionId: payment.submissionId,
          reason: error instanceof Error ? error.message : "Payment failed",
        }).catch(() => undefined);
      }

      throw error;
    }

    const capturedOk =
      capture.status === "COMPLETED" ||
      capture.status === "PENDING" ||
      capture.status === "APPROVED";

    if (!capturedOk) {
      await recordEvent(
        payment.id,
        "PAYMENT_FAILED",
        `Unexpected capture status: ${capture.status}`,
        capture.raw,
      );
      throw new Error(`PayPal capture status was ${capture.status}.`);
    }

    if (
      Math.abs(capture.amount - expectedAmount) > 0.01 ||
      capture.currency.toUpperCase() !== payment.currency.toUpperCase()
    ) {
      await recordEvent(
        payment.id,
        "PAYMENT_FAILED",
        `Amount/currency mismatch. Expected ${expectedAmount} ${payment.currency}, got ${capture.amount} ${capture.currency}`,
        capture.raw,
      );
      throw new Error("Payment amount or currency could not be verified.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: GatewayPaymentStatus.PAID,
          providerCaptureId: capture.providerCaptureId,
          payerEmail: capture.payerEmail ?? payment.payerEmail,
          payerName: capture.payerName,
          country: capture.country,
          paymentMethod: PaymentMethodType.PAYPAL,
          gatewayResponse: capture.raw as Prisma.InputJsonValue,
          paidAt: new Date(),
        },
      });

      if (payment.toolId && payment.tool) {
        const featuredUntil =
          payment.tool.listingPlan === ListingPlan.FEATURED
            ? new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
            : null;

        await tx.tool.update({
          where: { id: payment.toolId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            paypalOrderId: capture.providerOrderId,
            featured: payment.tool.listingPlan === ListingPlan.FEATURED,
            featuredUntil,
            status: "PENDING",
          },
        });
      }

      if (payment.promotionId) {
        await tx.promotion.update({
          where: { id: payment.promotionId },
          data: {
            status: PromotionStatus.PAID,
            paidAt: new Date(),
          },
        });
      }

      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          type: "PAYMENT_CAPTURED",
          message: "PayPal order captured successfully",
          payload: capture.raw as Prisma.InputJsonValue,
        },
      });
    });

    const email =
      capture.payerEmail ??
      payment.tool?.submitterEmail ??
      payment.tool?.submittedBy?.email;

    if (email && payment.tool) {
      await sendPaymentSuccessEmail({
        submitterEmail: email,
        toolName: payment.tool.name,
        submissionId: payment.submissionId,
        listingPlan: payment.tool.listingPlan,
        amount: expectedAmount,
        currency: payment.currency,
        paymentId: payment.id,
      }).catch(() => undefined);
    }

    return {
      paymentId: payment.id,
      submissionId: payment.submissionId,
      toolId: payment.toolId,
      promotionId: payment.promotionId,
      providerOrderId: capture.providerOrderId,
      providerCaptureId: capture.providerCaptureId,
      amount: expectedAmount,
      currency: payment.currency,
      status: "PAID",
      payerEmail: capture.payerEmail,
      payerName: capture.payerName,
      country: capture.country,
      alreadyCaptured: false,
    };
  },

  async markCancelled(submissionId: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        submissionId,
        status: {
          in: [GatewayPaymentStatus.CREATED, GatewayPaymentStatus.APPROVED],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            submitterEmail: true,
            submittedBy: { select: { email: true } },
          },
        },
      },
    });

    if (!payment) {
      return null;
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: GatewayPaymentStatus.CANCELLED },
      });
      if (payment.toolId) {
        await tx.tool.update({
          where: { id: payment.toolId },
          data: { paymentStatus: PaymentStatus.CANCELLED },
        });
      }
      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          type: "PAYMENT_CANCELLED",
          message: "Checkout cancelled by user",
        },
      });
    });

    const email =
      payment.tool?.submitterEmail ?? payment.tool?.submittedBy?.email;
    if (email && payment.tool) {
      await sendPaymentCancelledEmail({
        submitterEmail: email,
        toolName: payment.tool.name,
        submissionId: payment.submissionId,
      }).catch(() => undefined);
    }

    return payment;
  },

  async handleWebhookEvent(
    eventType: string,
    resource: Record<string, unknown>,
  ) {
    const orderId =
      (resource.id as string | undefined) ??
      ((resource.supplementary_data as { related_ids?: { order_id?: string } })
        ?.related_ids?.order_id as string | undefined);

    if (!orderId) {
      return { handled: false };
    }

    const payment = await prisma.payment.findUnique({
      where: { providerOrderId: orderId },
    });

    if (!payment) {
      return { handled: false };
    }

    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status:
            payment.status === GatewayPaymentStatus.PAID
              ? GatewayPaymentStatus.PAID
              : GatewayPaymentStatus.APPROVED,
          gatewayResponse: resource as Prisma.InputJsonValue,
        },
      });
      await recordEvent(
        payment.id,
        "PAYMENT_APPROVED",
        "PayPal order approved",
        resource,
      );
      return { handled: true };
    }

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      if (payment.status !== GatewayPaymentStatus.PAID) {
        await this.captureCheckout(orderId).catch(async () => {
          // If capture already completed on PayPal, sync DB from webhook payload.
          const captureId =
            (resource.id as string | undefined) ?? payment.providerCaptureId;
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: GatewayPaymentStatus.PAID,
                providerCaptureId: captureId,
                paidAt: new Date(),
                gatewayResponse: resource as Prisma.InputJsonValue,
              },
            });
            if (payment.toolId) {
              const tool = await tx.tool.findUnique({
                where: { id: payment.toolId },
                select: { listingPlan: true },
              });
              if (tool) {
                await markToolPaid({
                  toolId: payment.toolId,
                  providerOrderId: orderId,
                  listingPlan: tool.listingPlan,
                });
              }
            }
            if (payment.promotionId) {
              await tx.promotion.update({
                where: { id: payment.promotionId },
                data: {
                  status: PromotionStatus.PAID,
                  paidAt: new Date(),
                },
              });
            }
            await tx.paymentEvent.create({
              data: {
                paymentId: payment.id,
                type: "PAYMENT_CAPTURED",
                message: "Synced from PAYMENT.CAPTURE.COMPLETED webhook",
                payload: resource as Prisma.InputJsonValue,
              },
            });
          });
        });
      }
      return { handled: true };
    }

    if (eventType === "PAYMENT.CAPTURE.DENIED") {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: GatewayPaymentStatus.FAILED,
            gatewayResponse: resource as Prisma.InputJsonValue,
          },
        });
        if (payment.toolId) {
          await tx.tool.update({
            where: { id: payment.toolId },
            data: { paymentStatus: PaymentStatus.FAILED },
          });
        }
        if (payment.promotionId) {
          await tx.promotion.update({
            where: { id: payment.promotionId },
            data: { status: PromotionStatus.FAILED },
          });
        }
        await tx.paymentEvent.create({
          data: {
            paymentId: payment.id,
            type: "PAYMENT_FAILED",
            message: "Capture denied by PayPal",
            payload: resource as Prisma.InputJsonValue,
          },
        });
      });
      return { handled: true };
    }

    if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: GatewayPaymentStatus.REFUNDED,
            refundAt: new Date(),
            gatewayResponse: resource as Prisma.InputJsonValue,
          },
        });
        await tx.paymentEvent.create({
          data: {
            paymentId: payment.id,
            type: "PAYMENT_REFUNDED",
            message: "Payment refunded",
            payload: resource as Prisma.InputJsonValue,
          },
        });
      });
      return { handled: true };
    }

    return { handled: false };
  },

  async adminMarkPaid(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { tool: { select: { listingPlan: true, name: true } } },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.status === GatewayPaymentStatus.PAID) {
      return payment;
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: GatewayPaymentStatus.PAID,
          paidAt: new Date(),
        },
      });
      if (payment.toolId && payment.tool) {
        await markToolPaid({
          toolId: payment.toolId,
          providerOrderId: payment.providerOrderId ?? `admin-${payment.id}`,
          listingPlan: payment.tool.listingPlan,
        });
      }
      if (payment.promotionId) {
        await tx.promotion.update({
          where: { id: payment.promotionId },
          data: {
            status: PromotionStatus.PAID,
            paidAt: new Date(),
          },
        });
      }
      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          type: "PAYMENT_CAPTURED",
          message: "Marked paid by admin",
        },
      });
    });

    return payment;
  },
};
