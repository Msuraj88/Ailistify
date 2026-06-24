import { CategoriesManager } from "@/components/admin/categories/categories-manager";
import { createMetadata } from "@/lib/metadata";
import { getAdminCategories } from "@/services/admin/categories";
import { categoryListFiltersSchema } from "@/validations/admin-categories";

export const metadata = createMetadata({
  title: "Categories",
  description: "Manage tool categories in the AIListify admin.",
});

type AdminCategoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const rawParams = await searchParams;
  const normalizedParams = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const filters = categoryListFiltersSchema.parse(normalizedParams);
  const categories = await getAdminCategories(filters);

  return <CategoriesManager categories={categories} />;
}
