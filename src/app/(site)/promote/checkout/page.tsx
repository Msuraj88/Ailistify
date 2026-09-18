import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PromoteCheckoutPage } from "@/components/promote/promote-checkout-page";
import { getPromotePackageByPlan } from "@/content/promote";
import { PROMOTE_PLAN_LABELS } from "@/lib/constants/tools";
import { createNoIndexMetadata } from "@/lib/metadata";
import { getDodoCheckoutMode, isDodoConfigured } from "@/lib/payments/config";

const PLAN_VALUES = ["HOMEPAGE_SPONSOR", "FEATURED_LISTING"] as const;

type PromotePlan = (typeof PLAN_VALUES)[number];

type PromoteCheckoutRouteProps = {
  searchParams: Promise<{ plan?: string }>;
};

function isPromotePlan(value: string | undefined): value is PromotePlan {
  return PLAN_VALUES.includes(value as PromotePlan);
}

export async function generateMetadata({
  searchParams,
}: PromoteCheckoutRouteProps): Promise<Metadata> {
  const params = await searchParams;
  const plan = isPromotePlan(params.plan) ? params.plan : null;
  const label = plan ? PROMOTE_PLAN_LABELS[plan] : "Checkout";

  return createNoIndexMetadata({
    title: `${label} Checkout`,
    description: `Complete payment for the AIListify ${label} sponsorship package.`,
    path: "/promote/checkout",
  });
}

export default async function PromoteCheckoutRoute({
  searchParams,
}: PromoteCheckoutRouteProps) {
  const params = await searchParams;

  if (!isPromotePlan(params.plan)) {
    redirect("/promote");
  }

  const pkg = getPromotePackageByPlan(params.plan);
  if (!pkg) {
    notFound();
  }

  return (
    <PromoteCheckoutPage
      plan={pkg.plan}
      dodoMode={getDodoCheckoutMode()}
      paymentsConfigured={isDodoConfigured()}
    />
  );
}
