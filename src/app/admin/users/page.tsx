import {
  AdminPlaceholderPage,
  createAdminPlaceholderMetadata,
} from "@/components/admin/admin-placeholder-page";

export const metadata = createAdminPlaceholderMetadata("Users");

export default function AdminUsersPage() {
  return (
    <AdminPlaceholderPage
      title="Users"
      description="View registered users and manage roles."
    />
  );
}
