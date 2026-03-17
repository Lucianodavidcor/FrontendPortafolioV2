import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      token: string;
      name?: string | null;
      email?: string | null;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    token: string;
    name?: string | null;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    name?: string | null;
    email?: string | null;
  }
}