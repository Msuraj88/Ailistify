import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth/roles";
import type { ActionResult } from "@/types";

export async function requireAdminAction(): Promise<
  ActionResult<{ userId: string }>
> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  if (!hasRole(session.user.role, "ADMIN")) {
    return { success: false, error: "You do not have permission to do that." };
  }

  return { success: true, data: { userId: session.user.id } };
}
