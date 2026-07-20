import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BestPageView } from "@/components/best/best-page-view";
import {
  getAllBestPageSlugs,
  getBestPageBySlug,
  getRelatedBestPages,
} from "@/data/best-pages";
import { createSeoMetadata } from "@/lib/metadata";
import {
  resolveBestToolsBySlugs,
  splitFreeAndPaidTools,
} from "@/services/best/tools";

export const dynamic = "force-static";
export const revalidate = false;

type BestSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBestPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BestSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getBestPageBySlug(slug);

  if (!page) {
    return createSeoMetadata({
      title: "Best AI Tools Guide Not Found",
      description: "The requested Best AI Tools page could not be found.",
      path: `/best/${slug}`,
      noIndex: true,
    });
  }

  return createSeoMetadata({
    title: page.title,
    description: page.description,
    path: `/best/${page.slug}`,
  });
}

export default async function BestSlugPage({ params }: BestSlugPageProps) {
  const { slug } = await params;
  const page = getBestPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const tools = await resolveBestToolsBySlugs(page.toolSlugs);
  const { freeTools, paidTools } = splitFreeAndPaidTools(tools);
  const relatedPages = getRelatedBestPages(page.relatedPages);

  return (
    <BestPageView
      page={page}
      tools={tools}
      freeTools={freeTools}
      paidTools={paidTools}
      relatedPages={relatedPages}
    />
  );
}
