"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_ROBOTS, BLOG_ROBOTS_LABELS } from "@/lib/constants/blog";
import type { BlogFormInput } from "@/validations/admin-blog";

type BlogSeoPanelProps = {
  values: BlogFormInput;
  onChange: <K extends keyof BlogFormInput>(
    key: K,
    value: BlogFormInput[K],
  ) => void;
  disabled?: boolean;
};

export function BlogSeoPanel({
  values,
  onChange,
  disabled,
}: BlogSeoPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <h3 className="font-semibold">SEO</h3>
        <p className="text-sm text-muted-foreground">
          Search and social metadata for this post.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaTitle">Meta title</Label>
        <Input
          id="metaTitle"
          value={values.metaTitle ?? ""}
          disabled={disabled}
          onChange={(event) => onChange("metaTitle", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">Meta description</Label>
        <Textarea
          id="metaDescription"
          rows={3}
          value={values.metaDescription ?? ""}
          disabled={disabled}
          onChange={(event) => onChange("metaDescription", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="focusKeyword">Focus keyword</Label>
        <Input
          id="focusKeyword"
          value={values.focusKeyword ?? ""}
          disabled={disabled}
          onChange={(event) => onChange("focusKeyword", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="canonicalUrl">Canonical URL</Label>
        <Input
          id="canonicalUrl"
          type="url"
          value={values.canonicalUrl ?? ""}
          disabled={disabled}
          onChange={(event) => onChange("canonicalUrl", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Robots</Label>
        <Select
          value={values.robots}
          onValueChange={(value) =>
            onChange("robots", value as BlogFormInput["robots"])
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOG_ROBOTS.map((robot) => (
              <SelectItem key={robot} value={robot}>
                {BLOG_ROBOTS_LABELS[robot]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogTitle">Open Graph title</Label>
        <Input
          id="ogTitle"
          value={values.ogTitle ?? ""}
          disabled={disabled}
          onChange={(event) => onChange("ogTitle", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogDescription">Open Graph description</Label>
        <Textarea
          id="ogDescription"
          rows={3}
          value={values.ogDescription ?? ""}
          disabled={disabled}
          onChange={(event) => onChange("ogDescription", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogImage">Open Graph image URL</Label>
        <Input
          id="ogImage"
          type="url"
          value={values.ogImage ?? ""}
          disabled={disabled}
          onChange={(event) => onChange("ogImage", event.target.value)}
        />
      </div>
    </div>
  );
}
