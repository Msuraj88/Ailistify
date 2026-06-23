import type { LucideIcon } from "lucide-react";
import {
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Tags,
  Users,
  Wrench,
} from "lucide-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Tools", href: "/admin/tools", icon: Wrench },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Tags", href: "/admin/tags", icon: Tags },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export const ADMIN_BREADCRUMB_LABELS: Record<string, string> = {
  admin: "Dashboard",
  tools: "Tools",
  categories: "Categories",
  tags: "Tags",
  users: "Users",
  reviews: "Reviews",
  settings: "Settings",
};
