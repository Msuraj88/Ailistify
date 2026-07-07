import { z } from "zod";
import { assembleGeneratedBlogContent } from "@/lib/blog/content";
import { BLOG_FIELD_LIMITS, truncateBlogField } from "@/lib/constants/blog";
import {
  GEMINI_API_BASE,
  GEMINI_MODEL,
  GEMINI_REQUEST_TIMEOUT_MS,
  GEMINI_TEMPERATURE,
  getGeminiApiKey,
} from "@/lib/gemini/config";
import {
  formatToolsForBlogPrompt,
  getPublishedToolsForBlogContext,
} from "@/services/blog/tools-context";
import type { GeneratedBlogContent } from "@/types/blog";

export class BlogGeneratorError extends Error {
  constructor(
    message: string,
    readonly code: "configuration" | "timeout" | "invalid_response" | "api",
  ) {
    super(message);
    this.name = "BlogGeneratorError";
  }
}

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const generatedBlogSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  focusKeyword: z.string(),
  content: z.string(),
  faq: z.array(faqSchema),
  conclusion: z.string(),
  cta: z.string(),
  categoryName: z.string(),
  linkedToolSlugs: z.array(z.string()),
});

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    excerpt: { type: "string" },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    focusKeyword: { type: "string" },
    content: { type: "string" },
    faq: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
    },
    conclusion: { type: "string" },
    cta: { type: "string" },
    categoryName: { type: "string" },
    linkedToolSlugs: { type: "array", items: { type: "string" } },
  },
  required: [
    "title",
    "slug",
    "excerpt",
    "metaTitle",
    "metaDescription",
    "focusKeyword",
    "content",
    "faq",
    "conclusion",
    "cta",
    "categoryName",
    "linkedToolSlugs",
  ],
};

function buildBlogGeneratorPrompt(
  prompt: string,
  toolsText: string,
  blogCategories: string[],
): string {
  return `You are an expert SEO content writer for AIListify, a curated AI tools directory.

Write a complete, accurate, SEO-optimized blog article based on this request:
"${prompt}"

CRITICAL RULES:
1. Use ONLY tool information from the PUBLISHED TOOLS DATABASE below when mentioning AI tools.
2. NEVER invent tool names, features, pricing, or URLs if a matching tool exists in the database.
3. When mentioning a tool from the database, link to it using: <a href="/tools/{slug}" target="_blank" rel="noopener noreferrer">{Tool Name}</a>
4. Generate polished, publication-ready HTML (NOT markdown). Every paragraph MUST be wrapped in <p> tags.
5. Use clear heading hierarchy: <h2> for main sections, <h3> for subsections. Do NOT use <h1> (the title is stored separately).
6. Structure the article with: introduction (h2 + paragraphs), multiple body sections (h2/h3 + paragraphs), lists (ul/ol), comparison tables where useful, and pros/cons subsections.
7. Add blank lines between block elements for readability.
8. Content must be at least 1200 words worth of substance.
9. Meta title max 70 chars. Meta description max 160 chars.
10. Slug must be lowercase with hyphens only.
11. Pick the best matching blog category from: ${blogCategories.join(", ") || "General"}
12. linkedToolSlugs must list slugs of tools you referenced from the database.
13. Do NOT generate or reference any images. No image prompts.
14. Do NOT include FAQ, conclusion, or CTA in the content field — those are separate JSON fields.

EXAMPLE CONTENT HTML FORMAT:
<h2>Introduction</h2>
<p>Opening paragraph with context...</p>
<p>Second introductory paragraph...</p>
<h2>Best AI Video Generators</h2>
<p>Overview paragraph...</p>
<h3>Tool Name</h3>
<p>Description with <a href="/tools/slug" target="_blank" rel="noopener noreferrer">link</a>...</p>
<ul>
<li>Key feature one</li>
<li>Key feature two</li>
</ul>
<table>
<thead><tr><th>Tool</th><th>Pricing</th><th>Best For</th></tr></thead>
<tbody><tr><td>Example</td><td>Free</td><td>Creators</td></tr></tbody>
</table>

PUBLISHED TOOLS DATABASE:
${toolsText}

Return strict JSON only.`;
}

export async function generateBlogWithGemini(
  prompt: string,
  blogCategories: string[],
): Promise<GeneratedBlogContent> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new BlogGeneratorError(
      "Gemini is not configured on the server.",
      "configuration",
    );
  }

  const tools = await getPublishedToolsForBlogContext(prompt);
  const toolsText = formatToolsForBlogPrompt(tools);
  const geminiPrompt = buildBlogGeneratorPrompt(
    prompt,
    toolsText,
    blogCategories,
  );

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    GEMINI_REQUEST_TIMEOUT_MS * 3,
  );

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }],
          generationConfig: {
            temperature: GEMINI_TEMPERATURE,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new BlogGeneratorError(
        "AI blog generation failed. Please try again.",
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
      throw new BlogGeneratorError(
        "AI returned an invalid response.",
        "invalid_response",
      );
    }

    const parsed = generatedBlogSchema.safeParse(JSON.parse(text));

    if (!parsed.success) {
      throw new BlogGeneratorError(
        "AI returned an invalid response.",
        "invalid_response",
      );
    }

    const data = parsed.data;
    const assembledContent = assembleGeneratedBlogContent(data);

    return {
      ...data,
      content: assembledContent,
      title:
        truncateBlogField(data.title, BLOG_FIELD_LIMITS.title) ?? data.title,
      slug: truncateBlogField(data.slug, BLOG_FIELD_LIMITS.slug) ?? data.slug,
      excerpt:
        truncateBlogField(data.excerpt, BLOG_FIELD_LIMITS.excerpt) ??
        data.excerpt,
      metaTitle:
        truncateBlogField(data.metaTitle, BLOG_FIELD_LIMITS.metaTitle) ??
        data.metaTitle,
      metaDescription:
        truncateBlogField(
          data.metaDescription,
          BLOG_FIELD_LIMITS.metaDescription,
        ) ?? data.metaDescription,
      focusKeyword:
        truncateBlogField(data.focusKeyword, BLOG_FIELD_LIMITS.focusKeyword) ??
        data.focusKeyword,
    };
  } catch (error) {
    if (error instanceof BlogGeneratorError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new BlogGeneratorError("AI blog generation timed out.", "timeout");
    }

    if (error instanceof SyntaxError) {
      throw new BlogGeneratorError(
        "AI returned an invalid response.",
        "invalid_response",
      );
    }

    throw new BlogGeneratorError(
      "AI blog generation failed. Please try again.",
      "api",
    );
  } finally {
    clearTimeout(timeout);
  }
}
