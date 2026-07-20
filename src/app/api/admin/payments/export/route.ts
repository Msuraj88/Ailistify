import { NextResponse } from "next/server";
import type {
  GatewayPaymentStatus,
  ListingPlan,
} from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth/roles";
import { getAdminPayments, paymentsToCsv } from "@/services/admin/payments";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const payments = await getAdminPayments({
    q: searchParams.get("q") ?? undefined,
    status:
      (searchParams.get("status") as GatewayPaymentStatus | "ALL") ?? "ALL",
    plan: (searchParams.get("plan") as ListingPlan | "ALL") ?? "ALL",
    range:
      (searchParams.get("range") as
        | "today"
        | "week"
        | "month"
        | "year"
        | "custom"
        | "all") ?? "all",
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const csv = paymentsToCsv(payments);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ailistify-payments.csv"`,
    },
  });
}
