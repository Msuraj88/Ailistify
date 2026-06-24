import { Badge } from "@/components/ui/badge";
import type { ToolStatusValue } from "@/lib/constants/tools";
import { cn } from "@/lib/utils";

const statusStyles: Record<ToolStatusValue, string> = {
  DRAFT: "border-muted-foreground/30 bg-muted text-muted-foreground",
  PENDING:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  PUBLISHED:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  REJECTED: "border-destructive/30 bg-destructive/10 text-destructive",
  ARCHIVED: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

type ToolStatusBadgeProps = {
  status: ToolStatusValue;
  className?: string;
};

export function ToolStatusBadge({ status, className }: ToolStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {status}
    </Badge>
  );
}
