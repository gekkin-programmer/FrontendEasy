import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Définir les routes protégées
const protectedRoutes = ["/dashboard", "/onboarding", "/workspaces"];
// Routes pour les utilisateurs non connectés
const authRoutes = ["/login", "/signup"];

export default function middleware(req: NextRequest) {
  // On récupère le token d'authentification (ex: "auth_token") depuis les cookies
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  // 1. SI CONNECTÉ : Rediriger si l'utilisateur tente d'aller sur Login/Signup
  if (token && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. SI NON CONNECTÉ : Rediriger vers Login si l'utilisateur tente d'accéder au Dashboard
  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // On garde le même matcher pour intercepter les routes
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
