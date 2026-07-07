import Link from "next/link";
import { NewsletterForm } from "@/components/directory/newsletter-form";

export function BlogNewsletterCta() {
  return (
    <section className="rounded-2xl border bg-muted/30 p-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Get the best AI tools in your inbox
        </h2>
        <p className="mt-2 text-muted-foreground">
          Join AIListify newsletter for curated AI tool discoveries and SEO
          guides.
        </p>
        <div className="mt-6">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}

export function BlogRelatedTools({
  tools,
}: {
  tools: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    shortDescription: string;
    pricingModel: string;
    verified: boolean;
    featured: boolean;
  }>;
}) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Related AI Tools</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <h3 className="font-semibold">{tool.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {tool.shortDescription}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BlogRelatedPosts({
  posts,
}: {
  posts: Array<{
    slug: string;
    title: string;
    excerpt: string | null;
  }>;
}) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Related Articles</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <h3 className="font-semibold">{post.title}</h3>
            {post.excerpt && (
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
