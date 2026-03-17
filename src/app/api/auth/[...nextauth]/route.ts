import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Llamamos a tu API real para validar el login
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.tu-dominio.com/api/v1';
          const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            })
          });

          const data = await res.json();

          // Si el backend responde OK y trae el token, lo retornamos
          if (res.ok && data.success && data.data.token) {
            return {
              id: "1", // NextAuth requiere un ID obligatorio por defecto
              token: data.data.token,
            };
          }
          
          return null; // Si falla, retorna null y NextAuth rechaza el login
        } catch (error) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    // 1. Metemos el token de tu backend en el JWT de NextAuth
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
      }
      return token;
    },
    // 2. Pasamos el token del JWT a la sesión pública (para leerlo en el frontend)
    async session({ session, token }) {
      session.user.token = token.accessToken as string;
      return session;
    }
  },
  pages: {
    signIn: '/admin/login', // Redirigiremos aquí cuando no estén autenticados
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };