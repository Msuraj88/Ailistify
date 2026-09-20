"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { analyzeToolForSubmission } from "@/actions/analyze-tool";
import {
  checkSubmitToolWebsiteExists,
  submitTool,
  updateMyTool,
  upgradeMyToolListing,
} from "@/actions/submit-tool";
import { UserToolLogoUpload } from "@/components/submit-tool/user-tool-logo-upload";
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
import { trackPaymentEvent } from "@/lib/analytics/payments";
import {
  ADMIN_TOOL_PRICING_MODELS,
  SUBMIT_PLAN_PRICES,
} from "@/lib/constants/tools";
import { cn } from "@/lib/utils";
import { analyzeToolUrlSchema } from "@/validations/analyze-tool";
import {
  submitToolSchema,
  type SubmitToolInput,
} from "@/validations/submit-tool";

type FormOptions = {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
};

type UserToolFormProps = {
  mode: "create" | "edit";
  options: FormOptions;
  toolId?: string;
  defaultValues?: Partial<SubmitToolInput>;
};

type WebsiteUrlCheckState =
  | "idle"
  | "checking"
  | "available"
  | "exists"
  | "invalid";

const emptyDefaults: SubmitToolInput = {
  name: "",
  websiteUrl: "",
  submitterEmail: "",
  categoryId: "",
  pricingModel: "FREE",
  tagIds: [],
  shortDescription: "",
  fullDescription: "",
  logo: "",
  images: [],
  metaTitle: "",
  metaDescription: "",
  twitterUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  discordUrl: "",
  pricingUrl: "",
  listingPlan: "FREE",
};

export function UserToolForm({
  mode,
  options,
  toolId,
  defaultValues,
}: UserToolFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<
    "PRIORITY" | "FEATURED" | null
  >(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const [websiteUrlCheckState, setWebsiteUrlCheckState] =
    useState<WebsiteUrlCheckState>("idle");
  const [existingToolName, setExistingToolName] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubmitToolInput>({
    resolver: zodResolver(submitToolSchema),
    defaultValues: {
      ...emptyDefaults,
      submitterEmail: session?.user?.email ?? "",
      ...defaultValues,
      listingPlan: defaultValues?.listingPlan ?? "FREE",
    },
  });

  const websiteUrlValue = watch("websiteUrl");
  const formDisabled = isSubmitting || isAnalyzing || isContinuing;
  const canAnalyze =
    (websiteUrlCheckState === "available" || mode === "edit") && !formDisabled;

  useEffect(() => {
    if (session?.user?.email) {
      setValue("submitterEmail", session.user.email);
    }
  }, [session?.user?.email, setValue]);

  useEffect(() => {
    const trimmed = websiteUrlValue.trim();

    if (!trimmed) {
      setWebsiteUrlCheckState("idle");
      setExistingToolName(null);
      return;
    }

    const parsed = analyzeToolUrlSchema.safeParse({ url: trimmed });
    if (!parsed.success) {
      setWebsiteUrlCheckState("invalid");
      setExistingToolName(null);
      return;
    }

    setWebsiteUrlCheckState("checking");
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        const result = await checkSubmitToolWebsiteExists(
          { url: parsed.data.url },
          toolId,
        );

        if (cancelled) {
          return;
        }

        if (!result.success) {
          setWebsiteUrlCheckState("available");
          setExistingToolName(null);
          return;
        }

        if (result.data.exists && result.data.tool) {
          setWebsiteUrlCheckState("exists");
          setExistingToolName(result.data.tool.name);
          return;
        }

        setWebsiteUrlCheckState("available");
        setExistingToolName(null);
      } catch {
        if (!cancelled) {
          setWebsiteUrlCheckState("available");
          setExistingToolName(null);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [websiteUrlValue, toolId]);

  async function onSubmit(data: SubmitToolInput) {
    setServerError(null);

    if (mode === "create") {
      return;
    }

    if (!toolId) {
      setServerError("Missing tool id.");
      return;
    }

    const result = await updateMyTool(toolId, {
      name: data.name,
      websiteUrl: data.websiteUrl,
      submitterEmail: data.submitterEmail,
      categoryId: data.categoryId,
      pricingModel: data.pricingModel,
      tagIds: data.tagIds,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      logo: data.logo,
      images: data.images,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      twitterUrl: data.twitterUrl,
      linkedinUrl: data.linkedinUrl,
      youtubeUrl: data.youtubeUrl,
      discordUrl: data.discordUrl,
      pricingUrl: data.pricingUrl,
    });

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Tool updated and returned to the review queue.");
    router.push("/my-tools");
    router.refresh();
  }

  async function onContinueToCheckout() {
    if (!selectedPlan) {
      toast.error("Select a listing plan to continue.");
      return;
    }

    setServerError(null);
    setIsContinuing(true);

    try {
      let redirected = false;

      await handleSubmit(async (data) => {
        trackPaymentEvent("begin_checkout", {
          item_name: selectedPlan,
          value: SUBMIT_PLAN_PRICES[selectedPlan],
          currency: "USD",
        });

        const result = await submitTool({
          ...data,
          listingPlan: selectedPlan,
        });

        if (!result.success) {
          setServerError(result.error);
          toast.error(result.error);
          return;
        }

        const checkout = await upgradeMyToolListing(
          result.data.toolId,
          selectedPlan,
        );
        if (!checkout.success) {
          setServerError(checkout.error);
          toast.error(checkout.error);
          router.push("/my-tools");
          router.refresh();
          return;
        }

        redirected = true;
        toast.success("Redirecting to secure checkout...");
        window.location.assign(checkout.data.paymentUrl);
      })();

      if (!redirected) {
        setIsContinuing(false);
      }
    } catch {
      setIsContinuing(false);
      toast.error("Could not start checkout. Please try again.");
    }
  }

  async function handleAnalyze() {
    const websiteUrl = watch("websiteUrl");
    const parsed = analyzeToolUrlSchema.safeParse({ url: websiteUrl });

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Please enter a valid URL.",
      );
      return;
    }

    setServerError(null);
    setIsAnalyzing(true);

    const progressSteps = [
      "Analyzing...",
      "Reading homepage...",
      "Generating content...",
      "Finding logo...",
    ];
    let stepIndex = 0;
    setAnalyzeProgress(progressSteps[0]);

    const progressInterval = window.setInterval(() => {
      stepIndex = (stepIndex + 1) % progressSteps.length;
      setAnalyzeProgress(progressSteps[stepIndex]);
    }, 2000);

    try {
      const result = await analyzeToolForSubmission({ url: parsed.data.url });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const data = result.data;
      setValue("websiteUrl", data.websiteUrl);
      setValue("name", data.name);
      setValue("categoryId", data.categoryId);
      setValue(
        "pricingModel",
        ADMIN_TOOL_PRICING_MODELS.includes(
          data.pricingModel as (typeof ADMIN_TOOL_PRICING_MODELS)[number],
        )
          ? (data.pricingModel as (typeof ADMIN_TOOL_PRICING_MODELS)[number])
          : "FREE",
      );
      setValue("tagIds", data.tagIds);
      setValue("shortDescription", data.shortDescription);
      setValue("fullDescription", data.fullDescription);
      setValue("metaTitle", data.metaTitle);
      setValue("metaDescription", data.metaDescription);
      setValue("logo", data.logo);

      setAnalyzeProgress("Done.");
      toast.success("Tool details generated. Review and edit before saving.");
    } catch {
      toast.error("Tool analysis failed. Please try again.");
    } finally {
      window.clearInterval(progressInterval);
      setIsAnalyzing(false);
      window.setTimeout(() => setAnalyzeProgress(null), 1500);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <input type="hidden" {...register("listingPlan")} />

      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Tool details</h2>
          <p className="text-sm text-muted-foreground">
            Paste your website URL and use AI Analyze, or fill everything in
            manually.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Tool URL</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://example.com"
              disabled={formDisabled}
              className="flex-1"
              {...register("websiteUrl")}
            />
            <Button
              type="button"
              variant="outline"
              className="sm:shrink-0"
              disabled={!canAnalyze || websiteUrlCheckState === "exists"}
              onClick={() => void handleAnalyze()}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <span aria-hidden="true">✨</span>
              )}
              Analyze
            </Button>
          </div>
          {websiteUrlCheckState === "checking" && (
            <p className="text-sm text-muted-foreground" role="status">
              Checking if this website is already listed...
            </p>
          )}
          {websiteUrlCheckState === "exists" && existingToolName && (
            <p className="text-sm text-destructive" role="alert">
              This website is already listed as {existingToolName}.
            </p>
          )}
          {analyzeProgress && (
            <p className="text-sm text-muted-foreground" role="status">
              {analyzeProgress}
            </p>
          )}
          {errors.websiteUrl && (
            <p className="text-sm text-destructive">
              {errors.websiteUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Tool name</Label>
          <Input id="name" disabled={formDisabled} {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="submitterEmail">Contact email</Label>
          <Input
            id="submitterEmail"
            type="email"
            disabled={formDisabled}
            {...register("submitterEmail")}
          />
          {errors.submitterEmail && (
            <p className="text-sm text-destructive">
              {errors.submitterEmail.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={formDisabled}
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
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Pricing model</Label>
            <Controller
              name="pricingModel"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={formDisabled}
                >
                  <SelectTrigger>
                    <SelectValue />
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
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short description</Label>
          <Textarea
            id="shortDescription"
            rows={3}
            disabled={formDisabled}
            {...register("shortDescription")}
          />
          {errors.shortDescription && (
            <p className="text-sm text-destructive">
              {errors.shortDescription.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullDescription">Full description</Label>
          <Textarea
            id="fullDescription"
            rows={8}
            disabled={formDisabled}
            {...register("fullDescription")}
          />
          {errors.fullDescription && (
            <p className="text-sm text-destructive">
              {errors.fullDescription.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <Controller
            name="tagIds"
            control={control}
            render={({ field }) => (
              <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-3">
                {options.tags.map((tag) => {
                  const checked = field.value?.includes(tag.id);
                  return (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={formDisabled}
                        onCheckedChange={(value) => {
                          const next = new Set(field.value ?? []);
                          if (value) {
                            next.add(tag.id);
                          } else {
                            next.delete(tag.id);
                          }
                          field.onChange(Array.from(next));
                        }}
                      />
                      {tag.name}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </div>

        <Controller
          name="logo"
          control={control}
          render={({ field }) => (
            <UserToolLogoUpload
              value={field.value}
              disabled={formDisabled}
              onChange={field.onChange}
            />
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="pricingUrl">Pricing URL (optional)</Label>
          <Input
            id="pricingUrl"
            type="url"
            disabled={formDisabled}
            {...register("pricingUrl")}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">SEO (optional)</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta title</Label>
          <Input
            id="metaTitle"
            disabled={formDisabled}
            {...register("metaTitle")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta description</Label>
          <Textarea
            id="metaDescription"
            rows={3}
            disabled={formDisabled}
            {...register("metaDescription")}
          />
        </div>
      </section>

      {mode === "create" ? (
        <div className="space-y-4">
          <div
            className="grid gap-3 sm:grid-cols-2"
            role="radiogroup"
            aria-label="Listing plan"
          >
            {(
              [
                {
                  id: "PRIORITY" as const,
                  title: `Priority Listing $${SUBMIT_PLAN_PRICES.PRIORITY}`,
                  description:
                    "Published within 24 hours with priority review.",
                },
                {
                  id: "FEATURED" as const,
                  title: `Listing + Featured $${SUBMIT_PLAN_PRICES.FEATURED}`,
                  description:
                    "Priority review plus homepage featured placement for 4 weeks.",
                },
              ] as const
            ).map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={formDisabled}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setValue("listingPlan", plan.id, { shouldValidate: true });
                  }}
                  className={cn(
                    "flex h-auto flex-col items-start gap-1 rounded-lg border bg-background px-4 py-3 text-left transition-colors",
                    "hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    isSelected
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-input",
                  )}
                >
                  <span className="text-sm font-semibold text-foreground">
                    {plan.title}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {plan.description}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedPlan ? (
            <Button
              type="button"
              disabled={formDisabled}
              onClick={() => void onContinueToCheckout()}
            >
              {isContinuing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting checkout...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          ) : null}
        </div>
      ) : (
        <Button type="submit" disabled={formDisabled}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Update Submission"
          )}
        </Button>
      )}
    </form>
  );
}
