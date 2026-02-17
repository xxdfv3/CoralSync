import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/server/auth";

/**
 * Middleware аутентификации на базе Better Auth.
 *
 * Сейчас для примера защищаем только /dashboard(.*) и /profile(.*).
 * Когда появятся реальные приватные роуты, можно дополнять matcher
 * и/или изменять условие isProtected.
 */
export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const pathname = request.nextUrl.pathname;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile");

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};

