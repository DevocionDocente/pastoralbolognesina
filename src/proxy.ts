import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const GUEST_ONLY = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const hasSession = Boolean(getSessionCookie(request));
  const isGuestPage = GUEST_ONLY.includes(request.nextUrl.pathname);

  if (!hasSession && !isGuestPage) return NextResponse.redirect(new URL("/login", request.url));
  if (hasSession && isGuestPage) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
