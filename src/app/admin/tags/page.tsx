import { TagsManager } from "@/components/admin/tags/tags-manager";
import { createMetadata } from "@/lib/metadata";
import { getAdminTags } from "@/services/admin/tags";
import { tagListFiltersSchema } from "@/validations/admin-tags";

export const metadata = createMetadata({
  title: "Tags",
  description: "Manage tool tags in the AIListify admin.",
});

type AdminTagsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTagsPage({
  searchParams,
}: AdminTagsPageProps) {
  const rawParams = await searchParams;
  const normalizedParams = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const filters = tagListFiltersSchema.parse(normalizedParams);
  const tags = await getAdminTags(filters);

  return <TagsManager tags={tags} />;
}
