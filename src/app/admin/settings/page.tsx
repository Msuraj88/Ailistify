import {
  AdminPlaceholderPage,
  createAdminPlaceholderMetadata,
} from "@/components/admin/admin-placeholder-page";

export const metadata = createAdminPlaceholderMetadata("Settings");

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholderPage
      title="Settings"
      description="Configure platform settings and preferences."
    />
  );
}
