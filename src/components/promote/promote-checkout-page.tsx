"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  capturePromotionPayPalOrder,
  createPromotionPayPalOrder,
} from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PromotePackage } from "@/content/promote";
import { getPromotePackageByPlan } from "@/content/promote";
import {
  PROMOTE_PLAN_LABELS,
  PROMOTE_PLAN_PRICES,
} from "@/lib/constants/tools";
import { cn } from "@/lib/utils";
import { promoteCheckoutSchema } from "@/validations/promote";

export type PromoteCheckoutPlan = keyof typeof PROMOTE_PLAN_PRICES;

type PromoteCheckoutPageProps = {
  plan: PromoteCheckoutPlan;
  paypalClientId: string | null;
};

function parsePrice(value: string): number {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

export function PromoteCheckoutPage({
  plan,
  paypalClientId,
}: PromoteCheckoutPageProps) {
  const router = useRouter();
  const pkg = getPromotePackageByPlan(plan) as PromotePackage;
  const [contactEmail, setContactEmail] = useState("");
  const [toolUrl, setToolUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    contactEmail?: string;
    toolUrl?: string;
  }>({});
  const [isPaying, setIsPaying] = useState(false);

  const planLabel = PROMOTE_PLAN_LABELS[plan];
  const amount = PROMOTE_PLAN_PRICES[plan];
  const compareAt = pkg.compareAtPrice ? parsePrice(pkg.compareAtPrice) : null;
  const savings =
    compareAt != null && compareAt > amount
      ? Number((compareAt - amount).toFixed(2))
      : null;

  const validation = useMemo(() => {
    const parsed = promoteCheckoutSchema.safeParse({
      plan,
      contactEmail,
      toolUrl,
    });
    if (!parsed.success) {
      return { success: false as const, data: null };
    }
    return { success: true as const, data: parsed.data };
  }, [plan, contactEmail, toolUrl]);

  function syncFieldErrors() {
    const parsed = promoteCheckoutSchema.safeParse({
      plan,
      contactEmail,
      toolUrl,
    });
    if (parsed.success) {
      setFieldErrors({});
      return;
    }
    const next: { contactEmail?: string; toolUrl?: string } = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "contactEmail" || key === "toolUrl") {
        next[key] = issue.message;
      }
    }
    setFieldErrors(next);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Button
            asChild
            variant="ghost"
            className="mb-6 h-9 gap-1.5 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            <Link href="/promote">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to promote
            </Link>
          </Button>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-8">
            <aside className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)]">
              <div className="border-b bg-muted/20 p-4 sm:p-5">
                <div className="overflow-hidden rounded-xl border bg-background">
                  <Image
                    src={pkg.previewImage}
                    alt={pkg.previewAlt}
                    width={1200}
                    height={640}
                    className="h-auto w-full object-cover"
                    priority
                    unoptimized
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {pkg.previewDescription}
                </p>
              </div>

              <div className="space-y-5 p-6 sm:p-8">
                <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                  {planLabel}
                </span>

                <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                  {pkg.compareAtPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {pkg.compareAtPrice}
                    </span>
                  )}
                  <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    ${amount}
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">
                    USD / one-time
                  </span>
                </div>

                {savings != null && (
                  <p className="inline-flex rounded-md bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700">
                    Save ${savings.toFixed(2)} instantly
                  </p>
                )}

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pkg.description}
                </p>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    What&apos;s included
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-foreground"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-violet-600"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] sm:p-8">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Billing Details
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Fill out the details below to generate your invoice and
                  complete payment.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promote-contact-email">Contact Email *</Label>
                  <Input
                    id="promote-contact-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    onBlur={syncFieldErrors}
                    disabled={isPaying}
                    className="h-11"
                  />
                  {fieldErrors.contactEmail && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.contactEmail}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promote-tool-url">Tool URL *</Label>
                  <Input
                    id="promote-tool-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://yourtool.com"
                    value={toolUrl}
                    onChange={(event) => setToolUrl(event.target.value)}
                    onBlur={syncFieldErrors}
                    disabled={isPaying}
                    className="h-11"
                  />
                  {fieldErrors.toolUrl && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.toolUrl}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight">
                    Secure Payment
                  </h2>
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    SSL Encrypted
                  </p>
                </div>

                {!paypalClientId ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    PayPal checkout is temporarily unavailable.
                  </p>
                ) : !validation.success ? (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      className={cn(
                        "h-12 w-full rounded-lg bg-[#ffc439] text-base font-semibold text-[#003087] hover:bg-[#f5bb33]",
                      )}
                      disabled
                    >
                      Enter valid details to unlock PayPal
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      PayPal buttons unlock after Contact Email and Tool URL are
                      valid.
                    </p>
                  </div>
                ) : (
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                      currency: "USD",
                      intent: "capture",
                      enableFunding: "card",
                    }}
                  >
                    <PayPalButtons
                      key={`${plan}-${validation.data.contactEmail}-${validation.data.toolUrl}`}
                      style={{
                        layout: "vertical",
                        shape: "rect",
                        color: "gold",
                        label: "paypal",
                        height: 48,
                      }}
                      disabled={isPaying}
                      createOrder={async () => {
                        syncFieldErrors();
                        if (!validation.data) {
                          throw new Error(
                            "Complete the required fields first.",
                          );
                        }
                        const result = await createPromotionPayPalOrder(
                          validation.data,
                        );
                        if (!result.success) {
                          toast.error(result.error);
                          throw new Error(result.error);
                        }
                        return result.data.orderId;
                      }}
                      onApprove={async (data) => {
                        setIsPaying(true);
                        try {
                          const result = await capturePromotionPayPalOrder(
                            data.orderID,
                          );
                          if (!result.success) {
                            toast.error(result.error);
                            router.push(
                              `/payment/failed?reason=${encodeURIComponent(result.error)}`,
                            );
                            return;
                          }
                          toast.success("Payment successful.");
                          router.push(
                            `/payment/success?promotionId=${encodeURIComponent(result.data.referenceId)}&paymentId=${encodeURIComponent(result.data.paymentId)}`,
                          );
                        } finally {
                          setIsPaying(false);
                        }
                      }}
                      onCancel={() => {
                        toast.message("Payment cancelled.");
                      }}
                      onError={() => {
                        toast.error(
                          "PayPal checkout failed. Please try again.",
                        );
                      }}
                    />
                  </PayPalScriptProvider>
                )}

                <p className="pt-1 text-center text-xs text-muted-foreground">
                  Powered by <span className="font-semibold">PayPal</span>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
