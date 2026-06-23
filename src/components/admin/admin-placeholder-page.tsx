import { createMetadata } from "@/lib/metadata";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
};

export function createAdminPlaceholderMetadata(title: string) {
  return createMetadata({
    title: `Admin — ${title}`,
    description: `Manage ${title.toLowerCase()} in the AIListify admin dashboard.`,
  });
}

export function AdminPlaceholderPage({
  title,
  description,
}: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>

      <div className="rounded-lg border border-dashed bg-card p-12 text-center">
        <p className="text-sm font-medium">Coming soon</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {title} management will be available in a future update.
        </p>
      </div>
    </div>
  );
}
