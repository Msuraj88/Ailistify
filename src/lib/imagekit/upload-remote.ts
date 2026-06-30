import { isImageKitConfigured } from "@/lib/imagekit/config";
import { getImageKitClient } from "@/lib/imagekit/server";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

function extensionFromContentType(contentType: string): string {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("icon")) return "ico";
  return "jpg";
}

export async function uploadRemoteLogoToImageKit(
  logoUrl: string,
  toolName: string,
): Promise<string | null> {
  if (!logoUrl || !isImageKitConfigured()) {
    return null;
  }

  try {
    const response = await fetch(logoUrl, {
      headers: {
        "User-Agent":
          "AIListify-ToolAnalyzer/1.0 (+https://ailistify.com; admin research bot)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const contentType =
      response.headers.get("content-type")?.split(";")[0] ?? "";

    if (contentType && !ALLOWED_IMAGE_TYPES.has(contentType)) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.byteLength === 0 || buffer.byteLength > 5 * 1024 * 1024) {
      return null;
    }

    const client = getImageKitClient();
    const safeName = toolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    const base64File = buffer.toString("base64");

    const upload = await client.files.upload({
      file: base64File,
      fileName: `${safeName || "tool-logo"}-${Date.now()}.${extensionFromContentType(contentType)}`,
      folder: "/tools/logos",
      useUniqueFileName: true,
    });

    return upload.url ?? null;
  } catch (error) {
    console.error("[tool-analyzer] logo upload failed", {
      logoUrl,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return null;
  }
}
