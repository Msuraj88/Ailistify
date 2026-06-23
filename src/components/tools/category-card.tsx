import Link from "next/link";
import {
  Code2,
  Image,
  Palette,
  PenLine,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ToolCategory } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Zap,
  Code2,
  Palette,
  TrendingUp,
  PenLine,
  Image,
};

type CategoryCardProps = {
  category: ToolCategory;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] ?? Zap;

  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-base">{category.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {category.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
