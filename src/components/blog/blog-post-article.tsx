import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { BlogPreviewBanner } from "@/components/blog/blog-preview-banner";
import { BlogReadingProgress } from "@/components/blog/blog-reading-progress";
import { BlogShareButtons } from "@/components/blog/blog-share-buttons";
import {
  BlogNewsletterCta,
  BlogRelatedPosts,
  BlogRelatedTools,
} from "@/components/blog/blog-sections";
import { BlogTableOfContents } from "@/components/blog/blog-table-of-contents";
import { BlogViewTracker } from "@/components/blog/blog-view-tracker";
import { applyBlogToolLinkTargets } from "@/lib/blog/content";
import { buildImageKitUrl } from "@/lib/imagekit/client";
import {
  buildBlogBreadcrumbSchema,
  buildBlogFaqSchema,
  buildBlogPostingSchema,
} from "@/lib/seo/blog-json-ld";
import { absoluteUrl } from "@/lib/utils";
import type { BlogListItem, PublicBlogPost } from "@/types/blog";

type BlogPostArticleProps = {
  post: PublicBlogPost;
  relatedPosts: BlogListItem[];
  relatedTools: Awaited<
    ReturnType<typeof import("@/services/blog/posts").getRelatedToolsForBlog>
  >;
  isPreview?: boolean;
};

export function BlogPostArticle({
  post,
  relatedPosts,
  relatedTools,
  isPreview = false,
}: BlogPostArticleProps) {
  const faqSchema = buildBlogFaqSchema(post.faqJson);
  const shareUrl = absoluteUrl(`/blog/${post.slug}`);
  const showPublishedMeta = !isPreview && Boolean(post.publishedAt);

  return (
    <>
      {!isPreview && <BlogViewTracker postId={post.id} />}
      <BlogReadingProgress />
      {!isPreview && <JsonLd data={buildBlogPostingSchema(post)} />}
      {!isPreview && <JsonLd data={buildBlogBreadcrumbSchema(post)} />}
      {!isPreview && faqSchema && <JsonLd data={faqSchema} />}

      {isPreview && (
        <BlogPreviewBanner
          status={post.status}
          editHref={`/admin/content/blogs/${post.id}/edit`}
        />
      )}

      <article className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <BlogTableOfContents content={post.content} />

          <div className="min-w-0">
            <header className="mb-8 space-y-4">
              <Link
                href="/blog"
                className="inline-flex w-fit items-center rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Go to blogs
              </Link>
              {post.category && (
                <p className="text-sm font-medium uppercase tracking-wide text-primary">
                  {post.category.name}
                </p>
              )}
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-lg text-muted-foreground">{post.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {post.author?.name && <span>By {post.author.name}</span>}
                {showPublishedMeta && post.publishedAt && (
                  <time dateTime={post.publishedAt.toISOString()}>
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(post.publishedAt))}
                  </time>
                )}
                {!isPreview && <span>{post.views.toLocaleString()} views</span>}
              </div>
              {!isPreview && (
                <BlogShareButtons title={post.title} url={shareUrl} />
              )}
            </header>

            {post.featuredImage && (
              <div className="mb-8 overflow-hidden rounded-2xl border">
                <Image
                  src={buildImageKitUrl(post.featuredImage, "screenshotThumb")}
                  alt=""
                  width={1200}
                  height={675}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            )}

            <div
              data-blog-content
              className="blog-content"
              dangerouslySetInnerHTML={{
                __html: applyBlogToolLinkTargets(post.content),
              }}
            />
          </div>
        </div>

        {!isPreview && (
          <div className="mt-14 space-y-14">
            <BlogRelatedTools tools={relatedTools} />
            <BlogRelatedPosts posts={relatedPosts} />
            <BlogNewsletterCta />
          </div>
        )}
      </article>
    </>
  );
}
