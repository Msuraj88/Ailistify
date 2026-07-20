import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildImageKitUrl } from "@/lib/imagekit/client";
import type { BestResolvedTool } from "@/types/best";

type ComparisonTableProps = {
  tools: BestResolvedTool[];
};

function MiniLogo({ logo, name }: { logo: string | null; name: string }) {
  if (logo) {
    return (
      <div className="relative h-8 w-8 overflow-hidden rounded-md border bg-background">
        <Image
          src={buildImageKitUrl(logo, "thumbnail")}
          alt=""
          fill
          className="object-cover"
          sizes="32px"
          loading="lazy"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-[10px] font-semibold">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function ComparisonTable({ tools }: ComparisonTableProps) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <section id="comparison" className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Comparison table
        </h2>
        <p className="mt-2 text-muted-foreground">
          Quick side-by-side view of pricing, free plans, and ratings from
          AIListify.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>Best for</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Free plan</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell>
                  <MiniLogo logo={tool.logo} name={tool.name} />
                </TableCell>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {tool.category.name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{tool.pricingModel}</Badge>
                </TableCell>
                <TableCell>{tool.hasFreePlan ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {tool.averageRating != null ? (
                    <span className="inline-flex items-center gap-1">
                      <Star
                        className="h-3.5 w-3.5 fill-current"
                        aria-hidden="true"
                      />
                      {tool.averageRating}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
