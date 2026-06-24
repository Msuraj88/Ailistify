import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Admin",
  description: "AIListify admin dashboard.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return <AdminShell user={session.user}>{children}</AdminShell>;
}
