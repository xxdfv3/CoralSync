import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware для защиты роутов по cookie сессии better-auth.
 * Работает в Edge Runtime — в файле нет импортов better-auth/Node-only API,
 * только проверка наличия cookie `better-auth.session_token`.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings");

  const isAuthPage =
    pathname === "/sign-in" || pathname === "/sign-up";

  const sessionCookie = request.cookies.get("better-auth.session_token");
  const hasSession = !!sessionCookie?.value;

  if (isProtected && !hasSession) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackURL", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthPage && hasSession) {
    const redirectTo =
      request.nextUrl.searchParams.get("callbackURL") ?? "/";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/sign-in",
    "/sign-up",
    "/settings/:path*",
  ],
};
