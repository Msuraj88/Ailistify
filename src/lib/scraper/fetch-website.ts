const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_HTML_BYTES = 2_000_000;

export class WebsiteFetchError extends Error {
  constructor(
    message: string,
    readonly code:
      | "unreachable"
      | "timeout"
      | "unsupported"
      | "invalid_response",
  ) {
    super(message);
    this.name = "WebsiteFetchError";
  }
}

export async function fetchWebsiteHtml(
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "AIListify-ToolAnalyzer/1.0 (+https://ailistify.com; admin research bot)",
      },
      signal: controller.signal,
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new WebsiteFetchError(
        "This website could not be reached. Check the URL and try again.",
        "unreachable",
      );
    }

    const contentType =
      response.headers.get("content-type")?.toLowerCase() ?? "";

    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml")
    ) {
      throw new WebsiteFetchError(
        "This URL does not appear to be a supported website page.",
        "unsupported",
      );
    }

    const reader = response.body?.getReader();

    if (!reader) {
      const text = await response.text();
      return text.slice(0, MAX_HTML_BYTES);
    }

    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done || !value) {
        break;
      }

      total += value.byteLength;
      if (total > MAX_HTML_BYTES) {
        chunks.push(
          value.slice(
            0,
            Math.max(0, MAX_HTML_BYTES - (total - value.byteLength)),
          ),
        );
        break;
      }

      chunks.push(value);
    }

    const merged = new Uint8Array(Math.min(total, MAX_HTML_BYTES));
    let offset = 0;

    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return new TextDecoder("utf-8", { fatal: false }).decode(merged);
  } catch (error) {
    if (error instanceof WebsiteFetchError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new WebsiteFetchError(
        "Website analysis timed out. Try again or use a different URL.",
        "timeout",
      );
    }

    throw new WebsiteFetchError(
      "This website could not be reached. Check the URL and try again.",
      "unreachable",
    );
  } finally {
    clearTimeout(timeout);
  }
}
