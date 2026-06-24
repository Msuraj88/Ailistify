import { DirectoryGridSkeleton } from "@/components/directory/directory-skeletons";

export default function TagsLoading() {
  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <DirectoryGridSkeleton />
    </div>
  );
}
