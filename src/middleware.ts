import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Si el usuario está autenticado pero intenta entrar al login, lo mandamos al dashboard
    if (req.nextUrl.pathname === "/admin/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      // Solo permite el acceso si existe un token
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/admin/login");
        if (isAuthPage) return true;
        return !!token;
      },
    },
  }
);

// Definimos qué rutas debe proteger el middleware
export const config = {
  matcher: ["/admin/:path*"],
};