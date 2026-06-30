import { getCachedValue, setCachedValue } from "@/lib/ai/cache";
import { getInFlightRequest, setInFlightRequest } from "@/lib/ai/in-flight";
import { mapGeminiAnalysisToFormFill } from "@/lib/ai/map-analysis";
import {
  analyzeToolWithGemini,
  buildToolAnalyzerPrompt,
  GeminiAnalysisError,
} from "@/lib/gemini/tool-analyzer";
import { uploadRemoteLogoToImageKit } from "@/lib/imagekit/upload-remote";
import { extractWebsiteContent } from "@/lib/scraper/extract";
import {
  fetchWebsiteHtml,
  WebsiteFetchError,
} from "@/lib/scraper/fetch-website";
import type { ToolAnalyzerFormFill } from "@/types/tool-analyzer";
import { normalizeToolUrl } from "@/validations/analyze-tool";

type AnalyzeToolOptions = {
  url: string;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
};

export class ToolAnalyzerError extends Error {
  constructor(
    message: string,
    readonly code:
      | "unreachable"
      | "timeout"
      | "unsupported"
      | "configuration"
      | "api"
      | "invalid",
  ) {
    super(message);
    this.name = "ToolAnalyzerError";
  }
}

async function analyzeToolInternal({
  url,
  categories,
  tags,
}: AnalyzeToolOptions): Promise<ToolAnalyzerFormFill> {
  const normalizedUrl = normalizeToolUrl(url);
  const html = await fetchWebsiteHtml(normalizedUrl);
  const scraped = extractWebsiteContent(html, normalizedUrl);

  const prompt = buildToolAnalyzerPrompt({
    websiteText: scraped.cleanedText,
    sourceUrl: normalizedUrl,
    categories: categories.map((category) => category.name),
    tags: tags.map((tag) => tag.name),
  });

  const analysis = await analyzeToolWithGemini(prompt);
  const logoCandidate =
    analysis.logoUrl.trim() ||
    scraped.logoCandidates[0] ||
    scraped.faviconUrl ||
    "";

  const uploadedLogoUrl = logoCandidate
    ? await uploadRemoteLogoToImageKit(logoCandidate, analysis.name || "tool")
    : null;

  const formFill = mapGeminiAnalysisToFormFill(analysis, {
    categories,
    tags,
    fallbackWebsiteUrl: normalizedUrl,
    uploadedLogoUrl,
  });

  if (!formFill.categoryId) {
    throw new ToolAnalyzerError(
      "Could not determine a category for this tool. Add categories first or fill the form manually.",
      "invalid",
    );
  }

  console.info("[tool-analyzer] analysis completed", {
    url: normalizedUrl,
    categoryId: formFill.categoryId,
    tagCount: formFill.tagIds.length,
    logoUploaded: Boolean(uploadedLogoUrl),
  });

  return formFill;
}

export async function analyzeToolFromWebsite(
  options: AnalyzeToolOptions,
): Promise<ToolAnalyzerFormFill> {
  const normalizedUrl = normalizeToolUrl(options.url);
  const cacheKey = `tool-analyzer:${normalizedUrl}`;

  const cached = getCachedValue<ToolAnalyzerFormFill>(cacheKey);
  if (cached) {
    return cached;
  }

  const inFlight = getInFlightRequest<ToolAnalyzerFormFill>(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const promise = analyzeToolInternal({
    ...options,
    url: normalizedUrl,
  })
    .then((result) => {
      setCachedValue(cacheKey, result);
      return result;
    })
    .catch((error) => {
      if (error instanceof WebsiteFetchError) {
        const code =
          error.code === "invalid_response" ? "unsupported" : error.code;
        throw new ToolAnalyzerError(error.message, code);
      }

      if (error instanceof GeminiAnalysisError) {
        throw new ToolAnalyzerError(
          error.message,
          error.code === "configuration" ? "configuration" : "api",
        );
      }

      if (error instanceof ToolAnalyzerError) {
        throw error;
      }

      throw new ToolAnalyzerError(
        "Tool analysis failed. Please try again.",
        "api",
      );
    });

  setInFlightRequest(cacheKey, promise);
  return promise;
}
