import Link from "next/link";
import Image from "next/image";
import { buildImageKitUrl } from "@/lib/imagekit/client";
import type { BlogListItem } from "@/types/blog";

type BlogCardProps = {
  post: BlogListItem;
};

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          {post.featuredImage ? (
            <Image
              src={buildImageKitUrl(post.featuredImage, "screenshotThumb")}
              alt=""
              width={640}
              height={360}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No featured image
            </div>
          )}
        </div>
        <div className="space-y-3 p-5">
          {post.category && (
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {post.category.name}
            </p>
          )}
          <h2 className="text-xl font-semibold tracking-tight group-hover:text-primary">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
