import { auth } from "@/auth";
import { NextResponse } from "next/server";

const AUTH_ROUTES = new Set(["/login", "/signup"]);
const PROTECTED_ROUTES = new Set(["/dashboard"]);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Handle root path
  if (pathname === "/") {
    const destination = isLoggedIn ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && AUTH_ROUTES.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect routes that require authentication
  if (
    !isLoggedIn &&
    Array.from(PROTECTED_ROUTES).some((route) => pathname.startsWith(route))
  ) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
