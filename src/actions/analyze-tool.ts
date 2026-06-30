"use server";

import { requireAdminAction } from "@/lib/auth/require-admin-action";
import {
  analyzeToolFromWebsite,
  ToolAnalyzerError,
} from "@/services/tool-analyzer";
import { getAdminToolFormOptions } from "@/services/admin/tools";
import type { ActionResult } from "@/types";
import type { ToolAnalyzerFormFill } from "@/types/tool-analyzer";
import { analyzeToolUrlSchema } from "@/validations/analyze-tool";

export async function analyzeToolFromUrl(
  input: unknown,
): Promise<ActionResult<ToolAnalyzerFormFill>> {
  const auth = await requireAdminAction();

  if (!auth.success) {
    return auth;
  }

  const parsed = analyzeToolUrlSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please enter a valid URL.",
    };
  }

  try {
    const options = await getAdminToolFormOptions();
    const data = await analyzeToolFromWebsite({
      url: parsed.data.url,
      categories: options.categories,
      tags: options.tags,
    });

    return { success: true, data };
  } catch (error) {
    if (error instanceof ToolAnalyzerError) {
      console.error("[tool-analyzer] analysis failed", {
        code: error.code,
        message: error.message,
      });
      return { success: false, error: error.message };
    }

    console.error("[tool-analyzer] unexpected failure", error);
    return {
      success: false,
      error: "Tool analysis failed. Please try again.",
    };
  }
}
