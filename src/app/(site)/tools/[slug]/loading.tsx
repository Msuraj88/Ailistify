import { ToolDetailSkeleton } from "@/components/directory/directory-skeletons";

export default function ToolDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <ToolDetailSkeleton />
    </div>
  );
}
