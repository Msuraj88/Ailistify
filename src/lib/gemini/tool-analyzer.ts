import { z } from "zod";
import {
  GEMINI_API_BASE,
  GEMINI_MODEL,
  GEMINI_REQUEST_TIMEOUT_MS,
  GEMINI_TEMPERATURE,
  getGeminiApiKey,
} from "@/lib/gemini/config";
import type { GeminiToolAnalysisResult } from "@/types/tool-analyzer";

export class GeminiAnalysisError extends Error {
  constructor(
    message: string,
    readonly code: "configuration" | "timeout" | "invalid_response" | "api",
  ) {
    super(message);
    this.name = "GeminiAnalysisError";
  }
}

const geminiToolAnalysisSchema = z.object({
  name: z.string(),
  websiteUrl: z.string(),
  pricingModel: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  shortDescription: z.string(),
  fullDescription: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  logoUrl: z.string(),
  verified: z.boolean(),
  featured: z.boolean(),
});

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    websiteUrl: { type: "string" },
    pricingModel: { type: "string" },
    category: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    shortDescription: { type: "string" },
    fullDescription: { type: "string" },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    logoUrl: { type: "string" },
    verified: { type: "boolean" },
    featured: { type: "boolean" },
  },
  required: [
    "name",
    "websiteUrl",
    "pricingModel",
    "category",
    "tags",
    "shortDescription",
    "fullDescription",
    "metaTitle",
    "metaDescription",
    "logoUrl",
    "verified",
    "featured",
  ],
};

type AnalyzeToolPromptInput = {
  websiteText: string;
  sourceUrl: string;
  categories: string[];
  tags: string[];
};

export function buildToolAnalyzerPrompt({
  websiteText,
  sourceUrl,
  categories,
  tags,
}: AnalyzeToolPromptInput): string {
  return `You are an expert AI tools directory editor for AIListify.

Analyze the cleaned website content for the tool at ${sourceUrl}.

Choose the best matching category from this exact list only:
${categories.map((category) => `- ${category}`).join("\n")}

Suggest tags only from this exact list when relevant (return an empty array if none apply):
${tags.map((tag) => `- ${tag}`).join("\n")}

Pricing model must be one of: FREE, FREEMIUM, PAID, SUBSCRIPTION, CONTACT.

Write professional marketing copy suitable for an AI tools directory.
Short description: 20-300 characters.
Full description: detailed, helpful, at least 120 characters.
Meta title: max 70 characters.
Meta description: max 160 characters.

Detect the most likely logo URL from the provided logo candidates or OpenGraph image.
If uncertain, return an empty string for logoUrl.

Set verified=true only for well-known, established products with clear brand presence.
Set featured=false unless the content strongly indicates a flagship mainstream AI product.

Return strict JSON only. No markdown. No explanations.

Cleaned website content:
${websiteText}`;
}

export async function analyzeToolWithGemini(
  prompt: string,
): Promise<GeminiToolAnalysisResult> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new GeminiAnalysisError(
      "Gemini is not configured on the server.",
      "configuration",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    GEMINI_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: GEMINI_TEMPERATURE,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new GeminiAnalysisError(
        "AI analysis failed. Please try again.",
        "api",
      );
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new GeminiAnalysisError(
        "AI returned an invalid response. Please try again.",
        "invalid_response",
      );
    }

    const parsed = geminiToolAnalysisSchema.safeParse(JSON.parse(text));

    if (!parsed.success) {
      throw new GeminiAnalysisError(
        "AI returned an invalid response. Please try again.",
        "invalid_response",
      );
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof GeminiAnalysisError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new GeminiAnalysisError(
        "AI analysis timed out. Please try again.",
        "timeout",
      );
    }

    if (error instanceof SyntaxError) {
      throw new GeminiAnalysisError(
        "AI returned an invalid response. Please try again.",
        "invalid_response",
      );
    }

    throw new GeminiAnalysisError(
      "AI analysis failed. Please try again.",
      "api",
    );
  } finally {
    clearTimeout(timeout);
  }
}
