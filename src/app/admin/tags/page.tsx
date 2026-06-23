import {
  AdminPlaceholderPage,
  createAdminPlaceholderMetadata,
} from "@/components/admin/admin-placeholder-page";

export const metadata = createAdminPlaceholderMetadata("Tags");

export default function AdminTagsPage() {
  return (
    <AdminPlaceholderPage
      title="Tags"
      description="Manage tags for filtering and SEO landing pages."
    />
  );
}
