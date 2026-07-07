import Link from "next/link";
import { createSeoMetadata } from "@/lib/metadata";
import { getPublishedBlogPosts } from "@/services/blog/posts";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogNewsletterCta } from "@/components/blog/blog-sections";

export const metadata = createSeoMetadata({
  title: "AI Learning Hub",
  description:
    "Everything you need to discover, compare, and master the latest AI tools with expert-written guides and tutorials.",
  path: "/blog",
});

type BlogIndexPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogIndexPage({
  searchParams,
}: BlogIndexPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const categorySlug =
    typeof params.category === "string" ? params.category : undefined;

  const { posts, totalPages } = await getPublishedBlogPosts({
    page,
    categorySlug,
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          AI Learning Hub
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Everything you need to discover, compare, and master the latest AI
          tools with expert-written guides and tutorials.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No published blog posts yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => {
              const href = `/blog?page=${pageNumber}${
                categorySlug ? `&category=${categorySlug}` : ""
              }`;

              return (
                <Link
                  key={pageNumber}
                  href={href}
                  className={`rounded-md border px-3 py-1 text-sm hover:bg-muted ${
                    pageNumber === page ? "bg-muted font-medium" : ""
                  }`}
                  aria-current={pageNumber === page ? "page" : undefined}
                >
                  {pageNumber}
                </Link>
              );
            },
          )}
        </div>
      )}

      <div className="mt-14">
        <BlogNewsletterCta />
      </div>
    </div>
  );
}
