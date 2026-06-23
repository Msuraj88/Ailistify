import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig, getOAuthProviders } from "@/lib/auth.config";
import { credentialsProvider } from "@/lib/auth/credentials-provider";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [credentialsProvider, ...getOAuthProviders()],
});
