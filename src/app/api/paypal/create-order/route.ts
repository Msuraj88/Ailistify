import { NextResponse } from "next/server";
import { ListingPlan, PaymentStatus } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { SUBMIT_PLAN_PRICES } from "@/lib/constants/tools";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal/client";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";
import { z } from "zod";

const createOrderSchema = z.object({
  toolId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: "PayPal is not configured." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const tool = await prisma.tool.findUnique({
    where: { id: parsed.data.toolId },
    select: {
      id: true,
      name: true,
      submissionId: true,
      listingPlan: true,
      paymentStatus: true,
      submittedById: true,
    },
  });

  if (!tool || tool.submittedById !== session.user.id) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 },
    );
  }

  if (
    tool.listingPlan === ListingPlan.FREE ||
    tool.paymentStatus === PaymentStatus.PAID
  ) {
    return NextResponse.json(
      { error: "Payment not required." },
      { status: 400 },
    );
  }

  const amount =
    tool.listingPlan === ListingPlan.FEATURED
      ? SUBMIT_PLAN_PRICES.FEATURED
      : SUBMIT_PLAN_PRICES.PRIORITY;

  const description =
    tool.listingPlan === ListingPlan.FEATURED
      ? "Featured Listing — AIListify"
      : "Priority Listing — AIListify";

  try {
    const order = await createPayPalOrder({
      amount,
      description,
      customId: tool.id,
      returnUrl: absoluteUrl(
        `/payment/success?toolId=${tool.id}&submissionId=${tool.submissionId}`,
      ),
      cancelUrl: absoluteUrl("/submit?step=pricing&cancelled=1"),
    });

    await prisma.tool.update({
      where: { id: tool.id },
      data: { paypalOrderId: order.id },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("[paypal] create-order route failed", error);
    return NextResponse.json(
      { error: "Failed to create PayPal order." },
      { status: 500 },
    );
  }
}
