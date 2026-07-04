"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { analyzeToolForSubmission } from "@/actions/analyze-tool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  SubmitDraft,
  SubmitDraftPricingModel,
} from "@/lib/submission/draft";
import { analyzeToolUrlSchema } from "@/validations/analyze-tool";

const aiFeatures = [
  "Detects logo",
  "Extracts screenshots",
  "Generates descriptions",
  "Detects pricing",
  "Suggests categories",
  "Suggests tags",
  "Generates SEO title",
  "Generates SEO description",
];

type SubmitAiImportCardProps = {
  onApply: (draft: Partial<SubmitDraft>) => void;
  disabled?: boolean;
};

export function SubmitAiImportCard({
  onApply,
  disabled = false,
}: SubmitAiImportCardProps) {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  async function handleAnalyze() {
    const parsed = analyzeToolUrlSchema.safeParse({ url });

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Please enter a valid URL.",
      );
      return;
    }

    setIsAnalyzing(true);
    setProgress("Analyzing website...");

    try {
      const result = await analyzeToolForSubmission({ url: parsed.data.url });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const data = result.data;
      const pricingModel = ["FREE", "FREEMIUM", "PAID"].includes(
        data.pricingModel,
      )
        ? (data.pricingModel as SubmitDraftPricingModel)
        : "FREE";

      onApply({
        websiteUrl: data.websiteUrl,
        name: data.name,
        categoryId: data.categoryId,
        pricingModel,
        tagIds: data.tagIds,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        logo: data.logo,
      });

      toast.success("AI analysis complete. Review the fields below.");
      setProgress("Done.");
    } catch {
      toast.error("Tool analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      window.setTimeout(() => setProgress(null), 1500);
    }
  }

  return (
    <div className="rounded-[20px] border border-violet-200/70 bg-gradient-to-br from-violet-50/80 via-white to-fuchsia-50/50 p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          ✨ AI-Powered Form Prefill
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Paste your website URL and let AI automatically analyze your product,
          extract metadata, descriptions, categories, tags, pricing information,
          logo, images and SEO.
        </p>
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="ai-import-url">Website URL</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="ai-import-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            disabled={disabled || isAnalyzing}
            onChange={(event) => setUrl(event.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            className="rounded-full bg-neutral-950 px-6 text-white hover:bg-neutral-800"
            disabled={disabled || isAnalyzing}
            onClick={handleAnalyze}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Analyzing...
              </>
            ) : (
              "Analyze with AI"
            )}
          </Button>
        </div>
        {progress && (
          <p className="text-sm text-muted-foreground" role="status">
            {progress}
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {aiFeatures.map((feature) => (
          <p key={feature} className="text-sm text-muted-foreground">
            ✓ {feature}
          </p>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Estimated analysis time: Usually 10–20 seconds
      </p>
    </div>
  );
}
