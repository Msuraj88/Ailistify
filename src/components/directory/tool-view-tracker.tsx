"use client";

import { useEffect, useRef } from "react";
import { incrementToolViews } from "@/actions/directory";

type ToolViewTrackerProps = {
  slug: string;
};

export function ToolViewTracker({ slug }: ToolViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) {
      return;
    }

    tracked.current = true;
    void incrementToolViews(slug);
  }, [slug]);

  return null;
}
