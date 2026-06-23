import type { UserRole } from "@/generated/prisma/client";

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
} as const satisfies Record<string, UserRole>;

export function hasRole(
  role: string | undefined | null,
  allowed: UserRole | UserRole[],
): boolean {
  if (!role) return false;
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  return allowedRoles.includes(role as UserRole);
}

export function isAdmin(role: string | undefined | null): boolean {
  return hasRole(role, ROLES.ADMIN);
}

export function isModerator(role: string | undefined | null): boolean {
  return hasRole(role, [ROLES.ADMIN, ROLES.MODERATOR]);
}

export function canAccessAdmin(role: string | undefined | null): boolean {
  return isAdmin(role);
}
