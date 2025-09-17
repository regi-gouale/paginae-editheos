import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ["/", "/auth", "/auth/login", "/auth/register"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Routes d'API qui ne nécessitent pas d'authentification
  const publicApiRoutes = ["/api/auth"];
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  // Permettre l'accès aux ressources statiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Headers de sécurité pour toutes les réponses
  const response = NextResponse.next();
  
  // Sécurité: Headers de protection
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  
  // CSP pour éviter les attaques XSS
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );

  // Si c'est une route publique, permettre l'accès
  if (isPublicRoute || isPublicApiRoute) {
    return response;
  }

  try {
    // Vérifier la session pour les routes protégées
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      // Rediriger vers la page de connexion si pas de session
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Vérification de l'email whitelist pour les routes dashboard
    if (pathname.startsWith("/dashboard")) {
      const { isEmailWhitelisted } = await import("@/lib/whitelist");
      if (!isEmailWhitelisted(session.user.email)) {
        const unauthorizedUrl = new URL("/auth?error=unauthorized", request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // En cas d'erreur, rediriger vers la page de connexion
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};