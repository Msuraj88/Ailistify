import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminUserListItem } from "@/types/admin-users";
import type { UserListFilters } from "@/validations/admin-users";

function buildWhere(filters: UserListFilters): Prisma.UserWhereInput {
  if (!filters.q?.trim()) {
    return {};
  }

  const q = filters.q.trim();
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ],
  };
}

export async function getAdminUsers(
  filters: UserListFilters = {},
): Promise<AdminUserListItem[]> {
  const users = await prisma.user.findMany({
    where: buildWhere(filters),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      _count: { select: { submittedTools: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    createdAt: user.createdAt,
    submittedToolCount: user._count.submittedTools,
    isFounder: user._count.submittedTools > 0,
  }));
}
