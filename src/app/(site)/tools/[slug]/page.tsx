import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolDetailContent } from "@/components/directory/tool-detail-content";
import { createNoIndexMetadata, createSeoMetadata } from "@/lib/metadata";
import { buildSoftwareApplicationSchema } from "@/lib/seo/json-ld";
import { getToolOgImage } from "@/lib/seo/tool-metadata";
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
    return createNoIndexMetadata({
      title: "Tool Not Found",
      description: "The requested AI tool could not be found.",
      path: `/tools/${slug}`,
    });
  }

  const title = tool.metaTitle ?? tool.name;
  const description = tool.metaDescription ?? tool.shortDescription;

  return createSeoMetadata({
    title,
    description,
    path: `/tools/${tool.slug}`,
    ogImage: getToolOgImage(tool),
    ogType: "article",
  });
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { slug } = await params;
  const tool = await getDirectoryToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = await getRelatedTools(tool.id, tool.category.id);
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Browse AI Tools", path: "/tools" },
    { name: tool.category.name, path: `/category/${tool.category.slug}` },
    { name: tool.name, path: `/tools/${tool.slug}` },
  ];

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={buildSoftwareApplicationSchema(tool)} />
      <Breadcrumbs items={breadcrumbs} />
      <ToolDetailContent tool={tool} relatedTools={relatedTools} />
    </div>
  );
}
