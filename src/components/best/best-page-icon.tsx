import {
  Clapperboard,
  Code2,
  FileText,
  GraduationCap,
  Palette,
  Presentation,
  Terminal,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { BestPageIcon } from "@/types/best";

const BEST_PAGE_ICONS: Record<BestPageIcon, LucideIcon> = {
  "graduation-cap": GraduationCap,
  presentation: Presentation,
  "code-2": Code2,
  palette: Palette,
  youtube: Clapperboard,
  "trending-up": TrendingUp,
  terminal: Terminal,
  "file-text": FileText,
};

export function getBestPageIcon(icon: BestPageIcon): LucideIcon {
  return BEST_PAGE_ICONS[icon];
}
