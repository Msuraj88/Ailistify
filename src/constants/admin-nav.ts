import type { LucideIcon } from "lucide-react";
import {
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Settings,
  Tags,
  Users,
  Wrench,
} from "lucide-react";

export type AdminNavChild = {
  title: string;
  href: string;
};

export type AdminNavItem = {
  title: string;
  href?: string;
  icon: LucideIcon;
  children?: AdminNavChild[];
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Tools", href: "/admin/tools", icon: Wrench },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Tags", href: "/admin/tags", icon: Tags },
  {
    title: "Content",
    icon: Newspaper,
    children: [
      { title: "Blogs", href: "/admin/content/blogs" },
      { title: "Blog Categories", href: "/admin/content/blog-categories" },
    ],
  },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export const ADMIN_BREADCRUMB_LABELS: Record<string, string> = {
  admin: "Dashboard",
  tools: "Tools",
  categories: "Categories",
  tags: "Tags",
  content: "Content",
  blogs: "Blogs",
  "blog-categories": "Blog Categories",
  users: "Users",
  reviews: "Reviews",
  settings: "Settings",
  new: "New",
  edit: "Edit",
};
