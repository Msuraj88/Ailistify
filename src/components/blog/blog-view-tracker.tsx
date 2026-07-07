"use client";

import { useEffect } from "react";

export function BlogViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    void fetch(`/api/blog/${postId}/view`, { method: "POST" });
  }, [postId]);

  return null;
}
