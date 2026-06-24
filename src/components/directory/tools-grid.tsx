import { ToolCard } from "@/components/tools/tool-card";
import { EmptyState } from "@/components/admin/empty-state";
import type { DirectoryToolCard } from "@/types/directory";

type ToolsGridProps = {
  tools: DirectoryToolCard[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ToolsGrid({
  tools,
  emptyTitle = "No tools found",
  emptyDescription = "Try adjusting your search or filters.",
}: ToolsGridProps) {
  if (tools.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
