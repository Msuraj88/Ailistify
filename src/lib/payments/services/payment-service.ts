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
  getDodoProductIdForListingPlan,
  getDodoProductIdForPromotePlan,
  getPlanAmount,
  getPlanLabel,
  getPromotePlanAmount,
  getPromotePlanLabel,
  isDodoConfigured,
} from "@/lib/payments/config";
import { dodoProvider } from "@/lib/payments/providers/dodo";
import type {
  CaptureCheckoutResult,
  CreateCheckoutResult,
  PaidListingPlan,
  PaymentEventType,
  PaymentProvider as PaymentProviderAdapter,
  PromotePlan,
  ProviderPayment,
} from "@/lib/payments/types";
import { prisma } from "@/lib/prisma";
import { generatePromotionReferenceId } from "@/lib/promotion/id";
import {
  sendPaymentCancelledEmail,
  sendPaymentFailedEmail,
  sendPaymentSuccessEmail,
} from "@/lib/email/payments";

const providers: Record<string, PaymentProviderAdapter> = {
  dodo: dodoProvider,
};

function getProvider(id: string = "dodo"): PaymentProviderAdapter {
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

function isSucceededStatus(status: string): boolean {
  return status.toLowerCase() === "succeeded";
}

async function findPaymentForProviderPayment(providerPayment: ProviderPayment) {
  const internalPaymentId = providerPayment.metadata.internalPaymentId;
  if (internalPaymentId) {
    const byId = await prisma.payment.findUnique({
      where: { id: internalPaymentId },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            listingPlan: true,
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
    if (byId) return byId;
  }

  const sessionId = (
    providerPayment.raw as { checkout_session_id?: string | null }
  )?.checkout_session_id;

  if (sessionId) {
    const bySession = await prisma.payment.findUnique({
      where: { providerOrderId: sessionId },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            listingPlan: true,
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
    if (bySession) return bySession;
  }

  const submissionId = providerPayment.metadata.submissionId;
  if (submissionId) {
    return prisma.payment.findFirst({
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
            listingPlan: true,
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
  }

  return null;
}

async function finalizePaidPayment(
  payment: NonNullable<
    Awaited<ReturnType<typeof findPaymentForProviderPayment>>
  >,
  providerPayment: ProviderPayment,
): Promise<CaptureCheckoutResult> {
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

  if (!isSucceededStatus(providerPayment.status)) {
    throw new Error(
      `Dodo payment status was ${providerPayment.status}, expected succeeded.`,
    );
  }

  const expectedAmount = toNumber(payment.amount);
  const expectedFromMeta = Number(providerPayment.metadata.expectedAmount);
  const compareAgainst = Number.isFinite(expectedFromMeta)
    ? expectedFromMeta
    : expectedAmount;

  // Allow tax/FX variance while still catching wrong product checkouts.
  if (
    compareAgainst > 0 &&
    Math.abs(providerPayment.amount - compareAgainst) >
      Math.max(1, compareAgainst * 0.35)
  ) {
    await recordEvent(
      payment.id,
      "PAYMENT_FAILED",
      `Amount mismatch. Expected ~${compareAgainst} ${payment.currency}, got ${providerPayment.amount} ${providerPayment.currency}`,
      providerPayment.raw,
    );
    throw new Error("Payment amount could not be verified.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: GatewayPaymentStatus.PAID,
        providerCaptureId: providerPayment.providerPaymentId,
        payerEmail: providerPayment.payerEmail ?? payment.payerEmail,
        payerName: providerPayment.payerName,
        country: providerPayment.country,
        paymentMethod: PaymentMethodType.DODO,
        gatewayResponse: providerPayment.raw as Prisma.InputJsonValue,
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
          paypalOrderId:
            payment.providerOrderId ?? providerPayment.providerPaymentId,
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
        message: "Dodo payment completed successfully",
        payload: providerPayment.raw as Prisma.InputJsonValue,
      },
    });
  });

  const email =
    providerPayment.payerEmail ??
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
    providerOrderId: payment.providerOrderId!,
    providerCaptureId: providerPayment.providerPaymentId,
    amount: expectedAmount,
    currency: payment.currency,
    status: "PAID",
    payerEmail: providerPayment.payerEmail,
    payerName: providerPayment.payerName,
    country: providerPayment.country,
    alreadyCaptured: false,
  };
}

export const PaymentService = {
  isConfigured() {
    return isDodoConfigured();
  },

  async createCheckout(input: {
    toolId: string;
    listingPlan: PaidListingPlan;
    provider?: string;
  }): Promise<CreateCheckoutResult> {
    const provider = getProvider(input.provider ?? "dodo");

    const tool = await prisma.tool.findUnique({
      where: { id: input.toolId },
      select: {
        id: true,
        name: true,
        submissionId: true,
        paymentStatus: true,
        listingPlan: true,
        submitterEmail: true,
        submittedBy: { select: { email: true, name: true } },
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
    const productId = getDodoProductIdForListingPlan(input.listingPlan);
    const payerEmail = tool.submitterEmail ?? tool.submittedBy?.email ?? null;

    const paymentDraft = await prisma.payment.create({
      data: {
        submissionId: tool.submissionId,
        toolId: tool.id,
        provider: PaymentProvider.DODO,
        amount,
        currency: "USD",
        status: GatewayPaymentStatus.CREATED,
        paymentMethod: PaymentMethodType.DODO,
        payerEmail,
      },
    });

    try {
      const created = await provider.createCheckoutSession({
        toolId: tool.id,
        submissionId: tool.submissionId,
        productId,
        amount,
        currency: "USD",
        description,
        returnUrl: buildPaymentReturnUrl(tool.submissionId),
        cancelUrl: buildPaymentCancelUrl(tool.submissionId),
        payerEmail,
        payerName: tool.submittedBy?.name ?? null,
        metadata: {
          internalPaymentId: paymentDraft.id,
          kind: "tool_listing",
          listingPlan: input.listingPlan,
        },
      });

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentDraft.id },
          data: {
            providerOrderId: created.providerOrderId,
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
            paymentId: paymentDraft.id,
            type: "PAYMENT_STARTED",
            message: "Dodo checkout session created",
            payload: created.raw as Prisma.InputJsonValue,
          },
        });
      });

      return {
        paymentId: paymentDraft.id,
        providerOrderId: created.providerOrderId,
        approvalUrl: created.approvalUrl,
      };
    } catch (error) {
      await prisma.payment.update({
        where: { id: paymentDraft.id },
        data: {
          status: GatewayPaymentStatus.FAILED,
          gatewayResponse: {
            error: error instanceof Error ? error.message : "checkout_failed",
          } as Prisma.InputJsonValue,
        },
      });
      throw error;
    }
  },

  async createPromotionCheckout(input: {
    plan: PromotePlan;
    contactEmail: string;
    toolUrl: string;
    provider?: string;
  }): Promise<
    CreateCheckoutResult & { promotionId: string; referenceId: string }
  > {
    const provider = getProvider(input.provider ?? "dodo");
    const amount = getPromotePlanAmount(input.plan);
    const planLabel = getPromotePlanLabel(input.plan);
    const referenceId = await generatePromotionReferenceId();
    const productId = getDodoProductIdForPromotePlan(input.plan);
    const description = `AIListify ${planLabel} — ${input.toolUrl}`.slice(
      0,
      127,
    );

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
          provider: PaymentProvider.DODO,
          amount,
          currency: "USD",
          status: GatewayPaymentStatus.CREATED,
          paymentMethod: PaymentMethodType.DODO,
          payerEmail: input.contactEmail,
        },
      });

      return { payment: paymentRow, promotion: promotionRow };
    });

    try {
      const created = await provider.createCheckoutSession({
        submissionId: referenceId,
        productId,
        amount,
        currency: "USD",
        description,
        returnUrl: buildPromotionReturnUrl(referenceId),
        cancelUrl: buildPromotionCancelUrl(referenceId),
        payerEmail: input.contactEmail,
        metadata: {
          internalPaymentId: payment.id,
          kind: "promotion",
          promotionPlan: input.plan,
          toolUrl: input.toolUrl,
        },
      });

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            providerOrderId: created.providerOrderId,
            gatewayResponse: created.raw as Prisma.InputJsonValue,
          },
        });

        await tx.paymentEvent.create({
          data: {
            paymentId: payment.id,
            type: "PAYMENT_STARTED",
            message: "Promotion Dodo checkout session created",
            payload: created.raw as Prisma.InputJsonValue,
          },
        });
      });

      return {
        paymentId: payment.id,
        providerOrderId: created.providerOrderId,
        approvalUrl: created.approvalUrl,
        promotionId: promotion.id,
        referenceId,
      };
    } catch (error) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: GatewayPaymentStatus.FAILED,
            gatewayResponse: {
              error: error instanceof Error ? error.message : "checkout_failed",
            } as Prisma.InputJsonValue,
          },
        });
        await tx.promotion.update({
          where: { id: promotion.id },
          data: { status: PromotionStatus.FAILED },
        });
      });
      throw error;
    }
  },

  /**
   * Complete a Dodo payment after return URL or webhook using the Dodo payment_id.
   */
  async completeCheckout(
    providerPaymentId: string,
  ): Promise<CaptureCheckoutResult> {
    const provider = getProvider("dodo");
    const providerPayment = await provider.getPayment(providerPaymentId);
    const payment = await findPaymentForProviderPayment(providerPayment);

    if (!payment) {
      throw new Error("Payment record not found for this Dodo payment.");
    }

    try {
      return await finalizePaidPayment(payment, providerPayment);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("expected succeeded")
      ) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: GatewayPaymentStatus.FAILED,
              gatewayResponse: providerPayment.raw as Prisma.InputJsonValue,
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
              message: error.message,
            },
          });
        });

        const email =
          payment.tool?.submitterEmail ??
          payment.tool?.submittedBy?.email ??
          payment.payerEmail;
        if (email && payment.tool) {
          await sendPaymentFailedEmail({
            submitterEmail: email,
            toolName: payment.tool.name,
            submissionId: payment.submissionId,
            reason: error.message,
          }).catch(() => undefined);
        }
      }
      throw error;
    }
  },

  /** @deprecated Prefer completeCheckout — kept for call-site compatibility. */
  async captureCheckout(
    providerPaymentId: string,
  ): Promise<CaptureCheckoutResult> {
    return this.completeCheckout(providerPaymentId);
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
        promotion: { select: { id: true } },
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
      if (payment.promotionId) {
        await tx.promotion.update({
          where: { id: payment.promotionId },
          data: { status: PromotionStatus.CANCELLED },
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
    const paymentId =
      (resource.payment_id as string | undefined) ??
      (typeof resource.data === "object" &&
      resource.data &&
      "payment_id" in (resource.data as object)
        ? String((resource.data as { payment_id?: string }).payment_id)
        : undefined);

    if (!paymentId) {
      return { handled: false };
    }

    if (eventType === "payment.succeeded") {
      await this.completeCheckout(paymentId);
      return { handled: true };
    }

    if (eventType === "payment.failed" || eventType === "payment.cancelled") {
      const providerPayment = await getProvider("dodo").getPayment(paymentId);
      const payment = await findPaymentForProviderPayment(providerPayment);
      if (!payment || payment.status === GatewayPaymentStatus.PAID) {
        return { handled: Boolean(payment) };
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status:
              eventType === "payment.cancelled"
                ? GatewayPaymentStatus.CANCELLED
                : GatewayPaymentStatus.FAILED,
            gatewayResponse: providerPayment.raw as Prisma.InputJsonValue,
          },
        });
        if (payment.toolId) {
          await tx.tool.update({
            where: { id: payment.toolId },
            data: {
              paymentStatus:
                eventType === "payment.cancelled"
                  ? PaymentStatus.CANCELLED
                  : PaymentStatus.FAILED,
            },
          });
        }
        if (payment.promotionId) {
          await tx.promotion.update({
            where: { id: payment.promotionId },
            data: {
              status:
                eventType === "payment.cancelled"
                  ? PromotionStatus.CANCELLED
                  : PromotionStatus.FAILED,
            },
          });
        }
        await tx.paymentEvent.create({
          data: {
            paymentId: payment.id,
            type:
              eventType === "payment.cancelled"
                ? "PAYMENT_CANCELLED"
                : "PAYMENT_FAILED",
            message: `Synced from ${eventType}`,
            payload: providerPayment.raw as Prisma.InputJsonValue,
          },
        });
      });
      return { handled: true };
    }

    if (eventType === "refund.succeeded") {
      const payment = await prisma.payment.findFirst({
        where: { providerCaptureId: paymentId },
      });
      if (!payment) {
        return { handled: false };
      }
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: GatewayPaymentStatus.REFUNDED,
            refundAt: new Date(),
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
