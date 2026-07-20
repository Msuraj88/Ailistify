import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import type { BreadcrumbItem } from "@/lib/seo/json-ld";

type BestBreadcrumbsProps = {
  items: BreadcrumbItem[];
};

/** Thin wrapper so Best pages share one breadcrumb API. */
export function BestBreadcrumbs({ items }: BestBreadcrumbsProps) {
  return <Breadcrumbs items={items} />;
}
