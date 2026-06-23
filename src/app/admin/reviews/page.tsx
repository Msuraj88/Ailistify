import {
  AdminPlaceholderPage,
  createAdminPlaceholderMetadata,
} from "@/components/admin/admin-placeholder-page";

export const metadata = createAdminPlaceholderMetadata("Reviews");

export default function AdminReviewsPage() {
  return (
    <AdminPlaceholderPage
      title="Reviews"
      description="Moderate user reviews and ratings."
    />
  );
}
