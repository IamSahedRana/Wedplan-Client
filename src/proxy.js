import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // /services (browse) is public; only /services/[id] is private.
  if (pathname === "/services") return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (sessionCookie) return NextResponse.next();

  const signIn = new URL("/signin", request.url);
  signIn.searchParams.set("redirect", `${pathname}${search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/services/:path*", "/dashboard/:path*", "/payment/:path*", "/onboarding/:path*"],
};
