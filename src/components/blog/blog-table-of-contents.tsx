"use client";

import { useEffect, useMemo, useState } from "react";
import { extractTocItemsFromHtml } from "@/lib/blog/toc";
import { cn } from "@/lib/utils";

export function BlogTableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>("");

  const items = useMemo(() => extractTocItemsFromHtml(content), [content]);

  useEffect(() => {
    const article = document.querySelector("[data-blog-content]");
    if (!article) {
      return;
    }

    for (const item of items) {
      const headings = article.querySelectorAll("h2, h3");
      for (const heading of headings) {
        if (heading.textContent?.trim() === item.text && !heading.id) {
          heading.id = item.id;
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] },
    );

    for (const item of items) {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
      <p className="mb-3 text-sm font-semibold">On this page</p>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block text-muted-foreground transition-colors hover:text-foreground",
                item.level === 3 && "pl-4",
                activeId === item.id && "font-medium text-primary",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
