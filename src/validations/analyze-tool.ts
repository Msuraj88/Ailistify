import { z } from "zod";

export const analyzeToolUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Please enter a tool URL")
    .refine((value) => {
      try {
        const parsed = new URL(
          value.startsWith("http://") || value.startsWith("https://")
            ? value
            : `https://${value}`,
        );
        return Boolean(parsed.hostname);
      } catch {
        return false;
      }
    }, "Please enter a valid URL"),
});

export type AnalyzeToolUrlInput = z.infer<typeof analyzeToolUrlSchema>;

export function normalizeToolUrl(url: string): string {
  const trimmed = url.trim();
  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  const parsed = new URL(withProtocol);
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}
