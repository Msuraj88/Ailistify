import { Skeleton } from "@/components/ui/skeleton";

export function ToolsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function ToolDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex gap-6">
        <Skeleton className="h-24 w-24 rounded-xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-full max-w-lg" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function DirectoryGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  );
}
