"use server";

import { analyzeToolFromUrl } from "@/actions/analyze-tool";
import { createAdminTool } from "@/actions/admin/tools";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { mapAnalyzerFormFillToToolFormInput } from "@/lib/tools/map-analyzer-to-form";
import { resolveUniqueToolSlug } from "@/lib/tools/slug";
import { findToolByWebsiteHost } from "@/lib/tools/website";
import type { ActionResult } from "@/types";
import type { BulkImportUrlResult } from "@/types/bulk-import";
import { analyzeToolUrlSchema } from "@/validations/analyze-tool";

export async function bulkImportToolFromUrl(
  input: unknown,
): Promise<ActionResult<BulkImportUrlResult>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = analyzeToolUrlSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: true,
      data: {
        status: "failed",
        error: parsed.error.issues[0]?.message ?? "Please enter a valid URL.",
      },
    };
  }

  const url = parsed.data.url;

  try {
    const existingTool = await findToolByWebsiteHost(url);

    if (existingTool) {
      return {
        success: true,
        data: {
          status: "already_exists",
          toolId: existingTool.id,
          toolName: existingTool.name,
        },
      };
    }

    const analysisResult = await analyzeToolFromUrl({ url });

    if (!analysisResult.success) {
      return {
        success: true,
        data: {
          status: "failed",
          error: analysisResult.error,
        },
      };
    }

    const formInput = mapAnalyzerFormFillToToolFormInput(analysisResult.data);
    formInput.slug = await resolveUniqueToolSlug(formInput.slug);

    const createResult = await createAdminTool(formInput);

    if (!createResult.success) {
      return {
        success: true,
        data: {
          status: "failed",
          error: createResult.error,
        },
      };
    }

    return {
      success: true,
      data: {
        status: "imported",
        toolId: createResult.data.id,
        toolName: formInput.name,
      },
    };
  } catch (error) {
    console.error("[bulk-import] unexpected failure", { url, error });

    return {
      success: true,
      data: {
        status: "failed",
        error: "Import failed. Please try again.",
      },
    };
  }
}
