import Link from "next/link";
import { getBestPageIcon } from "@/components/best/best-page-icon";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BestPageCardSummary } from "@/types/best";

type BestGuideCardProps = {
  page: BestPageCardSummary;
};

export function BestGuideCard({ page }: BestGuideCardProps) {
  const Icon = getBestPageIcon(page.icon);

  return (
    <Link href={page.href} className="group block h-full">
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <Badge variant="secondary">{page.toolCount} tools</Badge>
          </div>
          <CardTitle className="text-base">{page.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {page.heroDescription}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
