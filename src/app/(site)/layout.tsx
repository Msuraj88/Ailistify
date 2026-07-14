import { BookmarkProvider } from "@/components/bookmarks/bookmark-provider";
import { MainLayout } from "@/components/layout/main-layout";
import { auth } from "@/lib/auth";
import { isGoogleAuthEnabled } from "@/lib/auth/oauth";
import { getUserBookmarkToolIds } from "@/services/bookmarks";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const initialBookmarkIds = session?.user?.id
    ? await getUserBookmarkToolIds(session.user.id)
    : [];

  return (
    <MainLayout googleAuthEnabled={isGoogleAuthEnabled()}>
      <BookmarkProvider initialIds={initialBookmarkIds}>
        {children}
      </BookmarkProvider>
    </MainLayout>
  );
}
