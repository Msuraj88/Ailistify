export const GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_TEMPERATURE = 0.2;
export const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta";
export const GEMINI_REQUEST_TIMEOUT_MS = 30_000;

export function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY?.trim() ?? null;
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}
