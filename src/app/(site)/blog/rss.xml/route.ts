import { getAllPublishedBlogSlugs } from "@/services/blog/posts";
import { absoluteUrl } from "@/lib/utils";
import { siteConfig } from "@/lib/metadata";

export async function GET() {
  const posts = await getAllPublishedBlogSlugs();

  const items = posts
    .map((post) => {
      const pubDate = post.publishedAt ?? post.updatedAt;
      return `
  <item>
    <title><![CDATA[${escapeXml(post.title)}]]></title>
    <link>${absoluteUrl(`/blog/${post.slug}`)}</link>
    <guid>${absoluteUrl(`/blog/${post.slug}`)}</guid>
    <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
  </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${siteConfig.name} Blog</title>
  <link>${absoluteUrl("/blog")}</link>
  <description>AI tools guides and SEO articles from ${siteConfig.name}</description>
  <language>en-us</language>${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
