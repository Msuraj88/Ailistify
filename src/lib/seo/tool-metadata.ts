import { buildImageKitUrl } from "@/lib/imagekit/client";
import type { DirectoryToolDetail } from "@/types/directory";

export function getToolOgImage(tool: DirectoryToolDetail): string | undefined {
  if (tool.logo) {
    return buildImageKitUrl(tool.logo, "card");
  }

  const primaryImage = tool.images[0];
  if (primaryImage) {
    return buildImageKitUrl(primaryImage.imageUrl, "screenshot");
  }

  return undefined;
}
