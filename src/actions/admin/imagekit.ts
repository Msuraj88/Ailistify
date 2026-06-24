"use server";

import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { isImageKitConfigured } from "@/lib/imagekit/config";
import { deleteImageKitFile } from "@/lib/imagekit/server";
import type { ActionResult } from "@/types";

export async function deleteImageKitAsset(
  fileId: string,
): Promise<ActionResult<void>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  if (!isImageKitConfigured()) {
    return { success: false, error: "ImageKit is not configured." };
  }

  if (!fileId.trim()) {
    return { success: false, error: "File ID is required." };
  }

  try {
    await deleteImageKitFile(fileId);
    return { success: true, data: undefined };
  } catch {
    return {
      success: false,
      error: "Failed to delete image from ImageKit.",
    };
  }
}
