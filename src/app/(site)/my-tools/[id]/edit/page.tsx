import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { UserToolForm } from "@/components/submit-tool/user-tool-form";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/session";
import { createSeoMetadata } from "@/lib/metadata";
import { getMyToolById } from "@/services/my-tools";
import { getSubmitToolFormOptions } from "@/services/submit-tool";

type EditMyToolPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditMyToolPageProps) {
  const { id } = await params;
  return createSeoMetadata({
    title: "Edit Submission",
    description: "Update your AIListify tool submission.",
    path: `/my-tools/${id}/edit`,
    noIndex: true,
  });
}

export const maxDuration = 120;

export default async function EditMyToolPage({ params }: EditMyToolPageProps) {
  const session = await requireAuth("/my-tools");
  const { id } = await params;

  const [tool, options] = await Promise.all([
    getMyToolById(session.user.id, id),
    getSubmitToolFormOptions(),
  ]);

  if (!tool) {
    notFound();
  }

  if (
    tool.status !== "PENDING" &&
    tool.status !== "REJECTED" &&
    tool.status !== "DRAFT"
  ) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "My Tools", path: "/my-tools" },
          { name: "Edit", path: `/my-tools/${id}/edit` },
        ]}
      />

      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/my-tools">
          <ChevronLeft className="h-4 w-4" />
          Back to My Tools
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Edit submission
        </h1>
        <p className="mt-2 text-muted-foreground">{tool.name}</p>
      </div>

      <UserToolForm
        mode="edit"
        toolId={tool.id}
        options={options}
        defaultValues={{
          name: tool.name,
          websiteUrl: tool.websiteUrl,
          submitterEmail: tool.submitterEmail ?? session.user.email ?? "",
          categoryId: tool.categoryId,
          pricingModel: tool.pricingModel as "FREE" | "FREEMIUM" | "PAID",
          tagIds: tool.tagIds,
          shortDescription: tool.shortDescription,
          fullDescription: tool.fullDescription,
          logo: tool.logo ?? "",
          images: tool.images.map((image) => ({
            imageUrl: image.imageUrl,
            altText: image.altText ?? "",
            caption: image.caption ?? "",
            sortOrder: image.sortOrder,
          })),
          metaTitle: tool.metaTitle ?? "",
          metaDescription: tool.metaDescription ?? "",
          twitterUrl: tool.twitterUrl ?? "",
          linkedinUrl: tool.linkedinUrl ?? "",
          youtubeUrl: tool.youtubeUrl ?? "",
          discordUrl: tool.discordUrl ?? "",
          pricingUrl: tool.pricingUrl ?? "",
          listingPlan: tool.listingPlan as "FREE" | "PRIORITY" | "FEATURED",
        }}
      />
    </div>
  );
}
