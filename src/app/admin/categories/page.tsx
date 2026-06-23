import {
  AdminPlaceholderPage,
  createAdminPlaceholderMetadata,
} from "@/components/admin/admin-placeholder-page";

export const metadata = createAdminPlaceholderMetadata("Categories");

export default function AdminCategoriesPage() {
  return (
    <AdminPlaceholderPage
      title="Categories"
      description="Organize tools into browsable categories."
    />
  );
}
