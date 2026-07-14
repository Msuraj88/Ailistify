import { UsersManager } from "@/components/admin/users/users-manager";
import { createMetadata } from "@/lib/metadata";
import { getAdminUsers } from "@/services/admin/users";
import { userListFiltersSchema } from "@/validations/admin-users";

export const metadata = createMetadata({
  title: "Users",
  description: "View registered users in the AIListify admin.",
});

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const rawParams = await searchParams;
  const normalizedParams = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const filters = userListFiltersSchema.parse(normalizedParams);
  const users = await getAdminUsers(filters);

  return <UsersManager users={users} />;
}
