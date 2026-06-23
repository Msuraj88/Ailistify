import type { DefaultSession } from "next-auth";
import type {
  Category,
  Review,
  Tool as PrismaTool,
  ToolImage,
} from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

export type ToolCategory = {
  slug: string;
  name: string;
  description: string;
  icon?: string;
};

export type ToolCardData = {
  name: string;
  slug: string;
  description: string;
  category: string | { name: string };
  tags?: readonly string[];
};

export type Tool = PrismaTool & {
  category?: Category;
  images?: ToolImage[];
  reviews?: Review[];
};

export type NavLink = {
  href: string;
  label: string;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type {
  Category,
  Review,
  Tag,
  ToolImage,
  ToolTag,
  UserRole,
  PricingModel,
  ToolStatus,
} from "@/generated/prisma/client";
