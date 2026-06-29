import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const ADMIN_EMAIL = "msurajkumar514@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
}

export async function ensureAdminRole(
  userId: string,
  email: string | null | undefined,
) {
  if (!isAdminEmail(email)) {
    return null;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: UserRole.ADMIN },
    select: { role: true },
  });

  return user.role;
}
