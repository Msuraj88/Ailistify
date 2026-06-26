import { NextResponse } from "next/server";
import { middlewareAuth } from "@/lib/auth.middleware";

const authRoutes = ["/login", "/register"];
const protectedRoutes = ["/admin", "/bookmarks"];

export default middlewareAuth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const pathname = nextUrl.pathname;

  if (pathname === "/submit" || pathname.startsWith("/submit/")) {
    const redirectUrl = new URL("/submit-tool", nextUrl);
    redirectUrl.search = nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isProtectedRoute && !isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/bookmarks",
    "/submit/:path*",
    "/login",
    "/register",
  ],
};
