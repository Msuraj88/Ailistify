import { configureAuthUrl } from "@/lib/auth/configure-auth-url";

configureAuthUrl();

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig, getOAuthProviders } from "@/lib/auth.config";
import { ensureAdminRole, isAdminEmail } from "@/lib/auth/admin";
import { credentialsProvider } from "@/lib/auth/credentials-provider";
import { prisma } from "@/lib/prisma";
import { subscribeToBeehiivPublication } from "@/services/beehiiv";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [credentialsProvider, ...getOAuthProviders()],
  events: {
    async createUser({ user }) {
      const email = user.email?.toLowerCase().trim();
      if (!email) {
        return;
      }

      // Covers OAuth (e.g. Google) first-time account creation.
      void subscribeToBeehiivPublication(email, {
        utmMedium: "signup",
      }).catch((error) => {
        console.error(
          "[auth] beehiiv subscribe failed after createUser",
          error,
        );
      });
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (user?.id && isAdminEmail(user.email)) {
        const role = await ensureAdminRole(user.id, user.email);
        if (role) {
          user.role = role;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.email = user.email;

        if (isAdminEmail(user.email) && user.id) {
          const role = await ensureAdminRole(user.id, user.email);
          token.role = role ?? user.role;
        } else if (user.role) {
          token.role = user.role;
        } else if (user.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          token.role = dbUser?.role;
        }
      }

      return token;
    },
  },
});
