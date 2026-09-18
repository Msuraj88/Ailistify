"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DodoPayments } from "dodopayments-checkout";
import { ArrowLeft, Check, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPromotionCheckout } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PromotePackage } from "@/content/promote";
import { getPromotePackageByPlan } from "@/content/promote";
import {
  PROMOTE_PLAN_LABELS,
  PROMOTE_PLAN_PRICES,
} from "@/lib/constants/tools";
import { promoteCheckoutSchema } from "@/validations/promote";

export type PromoteCheckoutPlan = keyof typeof PROMOTE_PLAN_PRICES;

type PromoteCheckoutPageProps = {
  plan: PromoteCheckoutPlan;
  dodoMode: "test" | "live";
  paymentsConfigured: boolean;
};

function parsePrice(value: string): number {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

export function PromoteCheckoutPage({
  plan,
  dodoMode,
  paymentsConfigured,
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
  const [sdkReady, setSdkReady] = useState(false);

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

  useEffect(() => {
    DodoPayments.Initialize({
      mode: dodoMode,
      displayType: "overlay",
      onEvent: (event) => {
        if (event.event_type === "checkout.error") {
          toast.error(
            event.data?.message
              ? String(event.data.message)
              : "Checkout failed. Please try again.",
          );
          setIsPaying(false);
        }
        if (event.event_type === "checkout.closed") {
          setIsPaying(false);
        }
      },
    });
    setSdkReady(true);
  }, [dodoMode]);

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

  async function handlePay() {
    syncFieldErrors();
    if (!validation.data) {
      toast.error("Enter a valid contact email and tool URL.");
      return;
    }

    setIsPaying(true);
    try {
      const result = await createPromotionCheckout(validation.data);
      if (!result.success) {
        toast.error(result.error);
        setIsPaying(false);
        return;
      }

      if (sdkReady) {
        DodoPayments.Checkout.open({
          checkoutUrl: result.data.checkoutUrl,
        });
      } else {
        window.location.assign(result.data.checkoutUrl);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start checkout.",
      );
      setIsPaying(false);
    }
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

                {!paymentsConfigured ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    Payments are temporarily unavailable.
                  </p>
                ) : (
                  <Button
                    type="button"
                    className="h-12 w-full rounded-lg text-base font-semibold"
                    disabled={!validation.success || isPaying}
                    onClick={() => void handlePay()}
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opening checkout…
                      </>
                    ) : validation.success ? (
                      `Pay $${amount} securely`
                    ) : (
                      "Enter valid details to unlock payment"
                    )}
                  </Button>
                )}

                <p className="pt-1 text-center text-xs text-muted-foreground">
                  Powered by{" "}
                  <span className="font-semibold">Dodo Payments</span>
                </p>
                <button
                  type="button"
                  className="mx-auto block text-xs text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() => router.push("/promote")}
                >
                  Cancel and go back
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
