import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig, getOAuthProviders } from "@/lib/auth.config";
import { ensureAdminRole, isAdminEmail } from "@/lib/auth/admin";
import { credentialsProvider } from "@/lib/auth/credentials-provider";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [credentialsProvider, ...getOAuthProviders()],
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
