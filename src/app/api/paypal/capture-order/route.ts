import { NextResponse } from "next/server";
import { ListingPlan, PaymentStatus } from "@/generated/prisma/client";
import { finalizePaidSubmission } from "@/actions/submit-tool";
import { sendPaidSubmissionReceivedEmail } from "@/lib/email/tool-submission";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal/client";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrderSchema } from "@/validations/submit-tool";

export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: "PayPal is not configured." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = capturePayPalOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const capture = await capturePayPalOrder(parsed.data.orderId);

    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment was not completed." },
        { status: 400 },
      );
    }

    const result = await finalizePaidSubmission({
      toolId: parsed.data.toolId,
      orderId: parsed.data.orderId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const tool = await prisma.tool.findUnique({
      where: { id: parsed.data.toolId },
      select: {
        name: true,
        submissionId: true,
        listingPlan: true,
        submitterEmail: true,
        paymentStatus: true,
      },
    });

    if (
      tool?.submitterEmail &&
      tool.paymentStatus === PaymentStatus.PAID &&
      tool.submissionId
    ) {
      await sendPaidSubmissionReceivedEmail({
        submitterEmail: tool.submitterEmail,
        toolName: tool.name,
        submissionId: tool.submissionId,
        listingPlan: tool.listingPlan as ListingPlan,
      });
    }

    return NextResponse.json({
      submissionId: result.data.submissionId,
    });
  } catch (error) {
    console.error("[paypal] capture-order route failed", error);
    return NextResponse.json(
      { error: "Failed to capture PayPal payment." },
      { status: 500 },
    );
  }
}
