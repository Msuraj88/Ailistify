import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTagsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}
