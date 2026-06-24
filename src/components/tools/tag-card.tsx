import Link from "next/link";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DirectoryTagCard } from "@/types/directory";

type TagCardProps = {
  tag: DirectoryTagCard;
};

export function TagCard({ tag }: TagCardProps) {
  return (
    <Link href={`/tag/${tag.slug}`} className="group block h-full">
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Tag className="h-5 w-5" aria-hidden="true" />
            </div>
            <Badge variant="secondary">{tag.toolCount} tools</Badge>
          </div>
          <CardTitle className="text-base">{tag.name}</CardTitle>
          {tag.description && (
            <CardDescription className="line-clamp-2">
              {tag.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
