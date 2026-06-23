import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth/roles";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function getSession() {
  return auth();
}

export async function requireAuth(callbackUrl?: string) {
  const session = await auth();

  if (!session?.user) {
    const loginUrl = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";
    redirect(loginUrl);
  }

  return session;
}

export async function requireRole(
  allowed: UserRole | UserRole[],
  redirectTo = "/",
) {
  const session = await requireAuth();
  const role = session.user.role;

  if (!hasRole(role, allowed)) {
    redirect(redirectTo);
  }

  return session;
}

export async function requireAdmin() {
  return requireRole("ADMIN", "/");
}
