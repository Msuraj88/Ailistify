import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth/roles";
import { createMetadata } from "@/lib/metadata";
import { createBlankBlogDraft } from "@/services/admin/blog";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "Create Blog",
  description: "Create a new blog post.",
});

export default async function NewBlogPage() {
  const session = await auth();

  if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
    redirect("/admin/content/blogs");
  }

  const draft = await createBlankBlogDraft(session.user.id);
  redirect(`/admin/content/blogs/${draft.id}/edit`);
}
