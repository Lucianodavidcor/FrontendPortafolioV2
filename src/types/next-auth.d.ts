import NextAuth from "next-auth"

declare module "next-auth" {
  // Extendemos la sesión para que TypeScript sepa que incluye el token
  interface Session {
    user: {
      token: string;
    }
  }

  // Extendemos el usuario que devolvemos en el authorize
  interface User {
    id: string;
    token: string;
  }
}