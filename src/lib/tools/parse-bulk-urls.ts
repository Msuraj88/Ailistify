import {
  analyzeToolUrlSchema,
  normalizeToolUrl,
} from "@/validations/analyze-tool";

export function parseBulkImportUrls(text: string): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const parsed = analyzeToolUrlSchema.safeParse({ url: trimmed });
    if (!parsed.success) {
      continue;
    }

    try {
      const normalized = normalizeToolUrl(parsed.data.url);
      if (seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      urls.push(normalized);
    } catch {
      continue;
    }
  }

  return urls;
}
