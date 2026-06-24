import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ToolDetailContent } from "@/components/directory/tool-detail-content";
import { createPageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";
import {
  getDirectoryToolBySlug,
  getRelatedTools,
} from "@/services/directory/tools";

type ToolDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ToolDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getDirectoryToolBySlug(slug);

  if (!tool) {
    return createPageMetadata({
      title: "Tool Not Found",
      description: "The requested AI tool could not be found.",
      path: `/tools/${slug}`,
    });
  }

  const title = tool.metaTitle ?? tool.name;
  const description = tool.metaDescription ?? tool.shortDescription;

  return createPageMetadata({
    title,
    description,
    path: `/tools/${slug}`,
  });
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { slug } = await params;
  const tool = await getDirectoryToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = await getRelatedTools(tool.id, tool.category.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.shortDescription,
    applicationCategory: tool.category.name,
    url: absoluteUrl(`/tools/${tool.slug}`),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: tool.pricingModel,
    },
  };

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolDetailContent tool={tool} relatedTools={relatedTools} />
    </div>
  );
}
