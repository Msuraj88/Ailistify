import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ToolCardData } from "@/types";

type ToolCardProps = {
  tool: ToolCardData;
};

export function ToolCard({ tool }: ToolCardProps) {
  const categoryLabel =
    typeof tool.category === "string" ? tool.category : tool.category.name;

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">
            <Link
              href={`/tools/${tool.slug}`}
              className="after:absolute after:inset-0 hover:text-primary"
            >
              {tool.name}
            </Link>
          </CardTitle>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </div>
        <Badge variant="secondary" className="w-fit">
          {categoryLabel}
        </Badge>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-2 text-sm">
          {tool.description}
        </CardDescription>
        {tool.tags && tool.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tool.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
