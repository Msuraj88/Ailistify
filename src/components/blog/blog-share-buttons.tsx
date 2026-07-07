"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BlogShareButtonsProps = {
  title: string;
  url: string;
};

export function BlogShareButtons({ title, url }: BlogShareButtonsProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const links = [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  async function copyLink() {
    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Share</span>
      {links.map((link) => (
        <Button key={link.label} asChild variant="outline" size="sm">
          <a href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        </Button>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void copyLink()}
      >
        <Share2 className="h-4 w-4" />
        Copy link
      </Button>
    </div>
  );
}
