import { siteConfig } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";
import type { PublicBlogPost } from "@/types/blog";

export function buildBlogPostingSchema(post: PublicBlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? post.metaDescription ?? undefined,
    image: post.featuredImage ?? post.ogImage ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: post.author?.name
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : {
          "@type": "Organization",
          name: siteConfig.name,
        },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
  };
}

export function buildBlogBreadcrumbSchema(post: PublicBlogPost) {
  const items = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ];

  if (post.category) {
    items.push({
      name: post.category.name,
      path: `/blog?category=${post.category.slug}`,
    });
  }

  items.push({ name: post.title, path: `/blog/${post.slug}` });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildBlogFaqSchema(faqJson: string | null) {
  if (!faqJson) {
    return null;
  }

  try {
    const faq = JSON.parse(faqJson) as Array<{
      question: string;
      answer: string;
    }>;

    if (!Array.isArray(faq) || faq.length === 0) {
      return null;
    }

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };
  } catch {
    return null;
  }
}

export function getBlogOgImage(post: PublicBlogPost) {
  return post.ogImage || post.featuredImage || null;
}
