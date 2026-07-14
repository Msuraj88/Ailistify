import type { UserRole } from "@/generated/prisma/client";

export type AdminUserListItem = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  submittedToolCount: number;
  isFounder: boolean;
};
