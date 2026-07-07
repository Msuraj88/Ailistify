import { notFound } from "next/navigation";
import { BlogPostArticle } from "@/components/blog/blog-post-article";
import { createSeoMetadata } from "@/lib/metadata";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth/roles";
import { getBlogOgImage } from "@/lib/seo/blog-json-ld";
import {
  getBlogPostBySlug,
  getPublishedBlogBySlug,
  getRelatedBlogPosts,
  getRelatedToolsForBlog,
} from "@/services/blog/posts";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

async function resolveBlogPost(slug: string, previewRequested: boolean) {
  if (previewRequested) {
    const session = await auth();
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return { post: null, isPreview: false };
    }

    const post = await getBlogPostBySlug(slug);
    return { post, isPreview: true };
  }

  const post = await getPublishedBlogBySlug(slug);
  return { post, isPreview: false };
}

export async function generateMetadata({
  params,
  searchParams,
}: BlogPostPageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const { post, isPreview } = await resolveBlogPost(slug, preview === "1");

  if (!post) {
    return createSeoMetadata({
      title: "Blog Post Not Found",
      description: "This blog post could not be found.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const noIndex = isPreview || post.robots.startsWith("NOINDEX");

  return createSeoMetadata({
    title: isPreview
      ? `Preview: ${post.metaTitle || post.title}`
      : post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    path: post.canonicalUrl || `/blog/${post.slug}`,
    ogImage: getBlogOgImage(post),
    ogType: "article",
    noIndex,
  });
}

export default async function BlogPostPage({
  params,
  searchParams,
}: BlogPostPageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const { post, isPreview } = await resolveBlogPost(slug, preview === "1");

  if (!post) {
    notFound();
  }

  const [relatedPosts, relatedTools] = isPreview
    ? [[], []]
    : await Promise.all([
        getRelatedBlogPosts(slug, post.category?.slug, 3),
        getRelatedToolsForBlog(post.focusKeyword),
      ]);

  return (
    <BlogPostArticle
      post={post}
      relatedPosts={relatedPosts}
      relatedTools={relatedTools}
      isPreview={isPreview}
    />
  );
}
