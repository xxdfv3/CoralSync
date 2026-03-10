import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime to avoid Edge Runtime limitations with better-auth
export const runtime = "nodejs";

/**
 * Middleware for authentication.
 * 
 * Note: better-auth uses dynamic code evaluation which is not compatible with Edge Runtime.
 * We use a cookie-based check here and defer full session validation to the API routes/pages.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile");

  const isAuthPage =
    pathname === "/sign-in" || pathname === "/sign-up";

  // Check for session cookie (better-auth uses 'better-auth.session_token' cookie)
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
  ],
};

