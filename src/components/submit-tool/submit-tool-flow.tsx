"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { submitTool } from "@/actions/submit-tool";
import { SubmitAiImportCard } from "@/components/submit-tool/submit-ai-import-card";
import { SubmitBenefitsSidebar } from "@/components/submit-tool/submit-benefits-sidebar";
import { SubmitToolGalleryUpload } from "@/components/submit-tool/submit-tool-gallery-upload";
import { SubmitToolLogoUpload } from "@/components/submit-tool/submit-tool-logo-upload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ADMIN_TOOL_PRICING_MODELS,
  FREE_QUEUE_STATS,
  SUBMIT_PLAN_PRICES,
} from "@/lib/constants/tools";
import {
  clearSubmitDraft,
  EMPTY_SUBMIT_DRAFT,
  readSubmitDraft,
  writeSubmitDraft,
  type SubmitDraft,
} from "@/lib/submission/draft";
import { cn } from "@/lib/utils";
import {
  submitToolSchema,
  type SubmitToolInput,
} from "@/validations/submit-tool";

type SubmitToolFlowProps = {
  options: {
    categories: { id: string; name: string }[];
    tags: { id: string; name: string }[];
  };
  defaultEmail?: string;
  paypalClientId?: string;
};

type PendingPayment = {
  toolId: string;
  submissionId: string;
  listingPlan: "PRIORITY" | "FEATURED";
};

const FORM_ID = "submit-tool-form";

export function SubmitToolFlow({
  options,
  defaultEmail,
  paypalClientId,
}: SubmitToolFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = searchParams.get("step") === "pricing" ? 2 : 1;

  const [step, setStep] = useState<1 | 2>(initialStep);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null,
  );
  const [savedDraft, setSavedDraft] = useState<SubmitDraft | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<Omit<SubmitToolInput, "listingPlan">>({
    resolver: zodResolver(submitToolSchema.omit({ listingPlan: true })),
    defaultValues: {
      ...EMPTY_SUBMIT_DRAFT,
      submitterEmail: defaultEmail ?? "",
    },
  });

  useEffect(() => {
    const draft = readSubmitDraft();
    if (draft) {
      for (const [key, value] of Object.entries(draft)) {
        setValue(
          key as keyof Omit<SubmitToolInput, "listingPlan">,
          value as never,
        );
      }
      setSavedDraft(draft);
    }
  }, [setValue]);

  useEffect(() => {
    const subscription = watch((values) => {
      writeSubmitDraft(values as SubmitDraft);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  function applyAiDraft(partial: Partial<SubmitDraft>) {
    for (const [key, value] of Object.entries(partial)) {
      if (value !== undefined) {
        setValue(
          key as keyof Omit<SubmitToolInput, "listingPlan">,
          value as never,
        );
      }
    }
  }

  function goToPricing(data: Omit<SubmitToolInput, "listingPlan">) {
    writeSubmitDraft(data as SubmitDraft);
    setSavedDraft(data as SubmitDraft);
    setServerError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function completeSubmission(
    listingPlan: SubmitToolInput["listingPlan"],
  ) {
    setServerError(null);
    setIsSubmitting(true);

    const values = getValues();
    const payload = submitToolSchema.parse({
      ...values,
      listingPlan,
    });

    const result = await submitTool(payload);

    if (!result.success) {
      setServerError(result.error);
      setIsSubmitting(false);
      return;
    }

    clearSubmitDraft();

    if (listingPlan === "FREE") {
      router.push(
        `/submission/success?submissionId=${result.data.submissionId}`,
      );
      return;
    }

    setPendingPayment({
      toolId: result.data.toolId,
      submissionId: result.data.submissionId,
      listingPlan: listingPlan as "PRIORITY" | "FEATURED",
    });
    setIsSubmitting(false);
  }

  const paypalOptions = useMemo(
    () =>
      paypalClientId
        ? {
            clientId: paypalClientId,
            currency: "USD",
            intent: "capture" as const,
          }
        : null,
    [paypalClientId],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="min-w-0 space-y-8">
        {step === 1 ? (
          <>
            <header className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Submit Your AI Tool
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Launch your AI product in front of thousands of founders,
                developers, marketers and AI enthusiasts. Our AI can
                automatically import your product information so you can publish
                in minutes instead of filling long forms manually.
              </p>
            </header>

            <SubmitAiImportCard
              onApply={applyAiDraft}
              disabled={isSubmitting}
            />

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                OR
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              Fill Everything Manually
            </p>

            {serverError && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {serverError}
              </div>
            )}

            <form
              id={FORM_ID}
              onSubmit={handleSubmit(goToPricing)}
              className="space-y-8"
            >
              <ToolDetailsSections
                register={register}
                control={control}
                errors={errors}
                options={options}
                disabled={isSubmitting}
              />
            </form>

            <div className="flex justify-end">
              <Button
                type="submit"
                form={FORM_ID}
                className="h-11 rounded-full bg-neutral-950 px-8 text-white hover:bg-neutral-800"
              >
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </>
        ) : (
          <PricingStep
            savedDraft={savedDraft}
            serverError={serverError}
            isSubmitting={isSubmitting}
            pendingPayment={pendingPayment}
            paypalOptions={paypalOptions}
            onBack={() => setStep(1)}
            onSelectPlan={completeSubmission}
            onPaymentComplete={(submissionId) => {
              clearSubmitDraft();
              router.push(
                `/payment/success?submissionId=${submissionId}&paid=1`,
              );
            }}
          />
        )}
      </div>

      <SubmitBenefitsSidebar />
    </div>
  );
}

function ToolDetailsSections({
  register,
  control,
  errors,
  options,
  disabled,
}: {
  register: ReturnType<
    typeof useForm<Omit<SubmitToolInput, "listingPlan">>
  >["register"];
  control: ReturnType<
    typeof useForm<Omit<SubmitToolInput, "listingPlan">>
  >["control"];
  errors: ReturnType<
    typeof useForm<Omit<SubmitToolInput, "listingPlan">>
  >["formState"]["errors"];
  options: SubmitToolFlowProps["options"];
  disabled: boolean;
}) {
  return (
    <>
      <section className="space-y-4 rounded-[20px] border border-gray-200/80 bg-white p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-semibold">Tool details</h2>
          <p className="text-sm text-muted-foreground">
            Core information shown on your AIListify listing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tool name" error={errors.name?.message}>
            <Input id="name" disabled={disabled} {...register("name")} />
          </Field>
          <Field label="Website URL" error={errors.websiteUrl?.message}>
            <Input
              id="websiteUrl"
              type="url"
              disabled={disabled}
              {...register("websiteUrl")}
            />
          </Field>
          <Field label="Contact email" error={errors.submitterEmail?.message}>
            <Input
              id="submitterEmail"
              type="email"
              disabled={disabled}
              {...register("submitterEmail")}
            />
          </Field>
          <Field label="Category" error={errors.categoryId?.message}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Pricing model" error={errors.pricingModel?.message}>
            <Controller
              name="pricingModel"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing model" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_TOOL_PRICING_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Pricing page URL">
            <Input
              id="pricingUrl"
              type="url"
              disabled={disabled}
              {...register("pricingUrl")}
            />
          </Field>
        </div>

        <Field
          label="Short description"
          error={errors.shortDescription?.message}
        >
          <Textarea
            id="shortDescription"
            rows={3}
            disabled={disabled}
            {...register("shortDescription")}
          />
        </Field>

        <Field label="Full description" error={errors.fullDescription?.message}>
          <Textarea
            id="fullDescription"
            rows={8}
            disabled={disabled}
            {...register("fullDescription")}
          />
        </Field>

        <Field label="Tags">
          <Controller
            name="tagIds"
            control={control}
            render={({ field }) => (
              <div className="grid max-h-48 gap-3 overflow-y-auto rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3">
                {options.tags.map((tag) => {
                  const checked = field.value?.includes(tag.id) ?? false;
                  return (
                    <label
                      key={tag.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(value) => {
                          const next = new Set(field.value ?? []);
                          if (value) next.add(tag.id);
                          else next.delete(tag.id);
                          field.onChange(Array.from(next));
                        }}
                      />
                      <span>{tag.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </Field>

        <Controller
          name="logo"
          control={control}
          render={({ field }) => (
            <SubmitToolLogoUpload
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
            />
          )}
        />

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <SubmitToolGalleryUpload
              value={field.value ?? []}
              onChange={field.onChange}
              disabled={disabled}
            />
          )}
        />
      </section>

      <section className="space-y-4 rounded-[20px] border border-gray-200/80 bg-white p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-semibold">SEO</h2>
        </div>
        <Field label="SEO title">
          <Input
            id="metaTitle"
            disabled={disabled}
            {...register("metaTitle")}
          />
        </Field>
        <Field label="SEO description">
          <Textarea
            id="metaDescription"
            rows={3}
            disabled={disabled}
            {...register("metaDescription")}
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-[20px] border border-gray-200/80 bg-white p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-semibold">Social links</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Twitter / X">
            <Input
              id="twitterUrl"
              type="url"
              disabled={disabled}
              {...register("twitterUrl")}
            />
          </Field>
          <Field label="LinkedIn">
            <Input
              id="linkedinUrl"
              type="url"
              disabled={disabled}
              {...register("linkedinUrl")}
            />
          </Field>
          <Field label="YouTube">
            <Input
              id="youtubeUrl"
              type="url"
              disabled={disabled}
              {...register("youtubeUrl")}
            />
          </Field>
          <Field label="Discord">
            <Input
              id="discordUrl"
              type="url"
              disabled={disabled}
              {...register("discordUrl")}
            />
          </Field>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function PricingStep({
  savedDraft,
  serverError,
  isSubmitting,
  pendingPayment,
  paypalOptions,
  onBack,
  onSelectPlan,
  onPaymentComplete,
}: {
  savedDraft: SubmitDraft | null;
  serverError: string | null;
  isSubmitting: boolean;
  pendingPayment: PendingPayment | null;
  paypalOptions: {
    clientId: string;
    currency: string;
    intent: "capture";
  } | null;
  onBack: () => void;
  onSelectPlan: (plan: SubmitToolInput["listingPlan"]) => void;
  onPaymentComplete: (submissionId: string) => void;
}) {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          ← Back to form
        </Button>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Choose Your Listing
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Every AI tool receives a permanent listing on AIListify. Need faster
          approval and greater visibility? Skip the queue with one of our
          premium options.
        </p>
        {savedDraft?.name && (
          <p className="text-sm text-muted-foreground">
            Submitting:{" "}
            <span className="font-medium text-foreground">
              {savedDraft.name}
            </span>
          </p>
        )}
      </header>

      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <PricingCard
          badge="⭐ Most Popular"
          title="Priority Listing"
          price={`$${SUBMIT_PLAN_PRICES.PRIORITY}`}
          priceLabel="One-Time Payment"
          features={[
            "Published within 24 hours",
            "Priority review",
            "Permanent AIListify listing",
            "SEO indexed",
            "AI search optimized",
            "Priority support",
            "Included in our upcoming newsletter",
          ]}
          buttonLabel="Continue with PayPal"
          highlighted
          disabled={isSubmitting || Boolean(pendingPayment)}
          onSelect={() => onSelectPlan("PRIORITY")}
        />

        <PricingCard
          badge="🚀 Best Value"
          title="Featured Listing"
          price={`$${SUBMIT_PLAN_PRICES.FEATURED}`}
          priceLabel="Featured for 4 Weeks"
          features={[
            "Everything in Priority Listing",
            "Homepage Featured Placement",
            "Featured Badge",
            "Category Featured Placement",
            "Social Media Promotion",
            "Newsletter Spotlight",
            "Higher Search Visibility",
            "Only one homepage featured sponsor at a time",
          ]}
          buttonLabel="Get Featured"
          premium
          disabled={isSubmitting || Boolean(pendingPayment)}
          onSelect={() => onSelectPlan("FEATURED")}
        />
      </div>

      {pendingPayment && paypalOptions && (
        <div className="rounded-[20px] border border-gray-200/80 bg-white p-6">
          <h2 className="text-lg font-semibold">Complete your payment</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Submission ID: {pendingPayment.submissionId}
          </p>
          <div className="mt-4 max-w-md">
            <PayPalScriptProvider options={paypalOptions}>
              <PayPalButtons
                style={{ layout: "vertical", shape: "pill" }}
                createOrder={async () => {
                  const response = await fetch("/api/paypal/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ toolId: pendingPayment.toolId }),
                  });
                  const data = await response.json();
                  if (!response.ok) {
                    throw new Error(data.error ?? "Failed to create order.");
                  }
                  return data.orderId;
                }}
                onApprove={async (data) => {
                  const response = await fetch("/api/paypal/capture-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderId: data.orderID,
                      toolId: pendingPayment.toolId,
                    }),
                  });
                  const result = await response.json();
                  if (!response.ok) {
                    toast.error(result.error ?? "Payment failed.");
                    return;
                  }
                  onPaymentComplete(result.submissionId);
                }}
                onError={() => {
                  toast.error("PayPal checkout failed. Please try again.");
                }}
              />
            </PayPalScriptProvider>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="rounded-[20px] border border-dashed border-gray-300 bg-gray-50/80 p-6">
          <h2 className="text-lg font-semibold">Not in a hurry?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join our free review queue.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Queue Status
              </p>
              <p className="mt-1 text-lg font-semibold">
                {FREE_QUEUE_STATS.waitingCount}+ tools currently waiting
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Estimated Review Time
              </p>
              <p className="mt-1 text-lg font-semibold">
                {FREE_QUEUE_STATS.reviewDaysMin}–
                {FREE_QUEUE_STATS.reviewDaysMax} Days
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["Permanent Listing", "SEO Indexed", "Standard Review"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {item}
                </li>
              ),
            )}
          </ul>
          <Button
            type="button"
            variant="outline"
            className="mt-5 rounded-full"
            disabled={isSubmitting || Boolean(pendingPayment)}
            onClick={() => onSelectPlan("FREE")}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Join Free Queue"
            )}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Free submissions are reviewed manually in the order they are
            received.
          </p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  badge,
  title,
  price,
  priceLabel,
  features,
  buttonLabel,
  highlighted = false,
  premium = false,
  disabled,
  onSelect,
}: {
  badge: string;
  title: string;
  price: string;
  priceLabel: string;
  features: string[];
  buttonLabel: string;
  highlighted?: boolean;
  premium?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={cn(
        "rounded-[20px] border bg-white p-6 transition-transform hover:scale-[1.01] hover:shadow-lg sm:p-8",
        premium
          ? "border-transparent bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-amber-400/20 p-[1px]"
          : "border-gray-200/80",
      )}
    >
      <div
        className={cn(
          "h-full rounded-[19px] bg-white p-6 sm:p-7",
          premium && "rounded-[19px]",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {badge}
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="text-right">
            <p className="text-3xl font-bold">{price}</p>
            <p className="text-xs text-muted-foreground">{priceLabel}</p>
          </div>
        </div>
        <ul className="mt-5 space-y-2.5">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          type="button"
          className={cn(
            "mt-6 h-10 w-full rounded-full",
            highlighted || premium
              ? "bg-neutral-950 text-white hover:bg-neutral-800"
              : "",
          )}
          disabled={disabled}
          onClick={onSelect}
        >
          {buttonLabel}
        </Button>
      </div>
    </article>
  );
}
