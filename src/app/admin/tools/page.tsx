import {
  AdminPlaceholderPage,
  createAdminPlaceholderMetadata,
} from "@/components/admin/admin-placeholder-page";

export const metadata = createAdminPlaceholderMetadata("Tools");

export default function AdminToolsPage() {
  return (
    <AdminPlaceholderPage
      title="Tools"
      description="Manage AI tool listings, approvals, and featured placements."
    />
  );
}
