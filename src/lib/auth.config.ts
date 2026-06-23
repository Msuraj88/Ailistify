import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/generated/prisma/client";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [] as NextAuthConfig["providers"],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole | undefined;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const role = auth?.user?.role;

      if (isAdminRoute) {
        return isLoggedIn && role === "ADMIN";
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

export function getOAuthProviders(): NextAuthConfig["providers"] {
  const providers: NextAuthConfig["providers"] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    );
  }

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      }),
    );
  }

  return providers;
}
