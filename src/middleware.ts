import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login", // Si no hay sesión, mandamos al usuario aquí
  },
});

export const config = {
  // Protegemos todas las rutas que empiecen con /admin, EXCEPTO /admin/login
  matcher: ["/admin/((?!login).*)"],
};