import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export type ToolCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};

export type Tool = {
  id: string;
  name: string;
  slug: string;
  description: string;
  websiteUrl?: string;
  logoUrl?: string | null;
  category: string;
  tags: string[];
  featured?: boolean;
  published?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type NavLink = {
  href: string;
  label: string;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
