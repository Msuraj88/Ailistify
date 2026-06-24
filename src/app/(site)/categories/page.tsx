import { Suspense } from "react";
import { DirectoryGridSkeleton } from "@/components/directory/directory-skeletons";
import { DirectorySearchBar } from "@/components/directory/directory-search-bar";
import { CategoryCard } from "@/components/tools/category-card";
import { EmptyState } from "@/components/admin/empty-state";
import { createPageMetadata } from "@/lib/metadata";
import { getDirectoryCategories } from "@/services/directory/categories";
import { directorySearchSchema } from "@/validations/directory";

export const metadata = createPageMetadata({
  title: "AI Tool Categories",
  description:
    "Browse AI tools by category — productivity, development, design, marketing, and more.",
  path: "/categories",
});

type CategoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const rawParams = await searchParams;
  const filters = directorySearchSchema.parse({
    q: Array.isArray(rawParams.q) ? rawParams.q[0] : rawParams.q,
  });

  const categories = await getDirectoryCategories(filters);

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Categories
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Explore AI tools organized by category.
        </p>
      </div>

      <Suspense fallback={<DirectoryGridSkeleton />}>
        <DirectorySearchBar
          basePath="/categories"
          placeholder="Search categories..."
        />
      </Suspense>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Try a different search term."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
