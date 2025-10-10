import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
    }),
    ...(env.GITHUB_ID && env.GITHUB_SECRET
      ? [GithubProvider({ clientId: env.GITHUB_ID, clientSecret: env.GITHUB_SECRET })]
      : []),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (profile) {
          session.user.profileId = profile.id;
          session.user.handle = profile.handle;
        }
      }
      return session;
    },
  },
};
