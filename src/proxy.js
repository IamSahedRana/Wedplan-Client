import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // /services (browse) is public; only /services/[id] is private.
  if (pathname === "/services") return NextResponse.next();

  // Forward the requested path so server guards can preserve deep links when
  // redirecting unauthenticated users to sign-in.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-wedplan-path", `${pathname}${search}`);
  const next = NextResponse.next({ request: { headers: requestHeaders } });

  const sessionCookie = getSessionCookie(request);
  if (sessionCookie) return next;

  const signIn = new URL("/signin", request.url);
  signIn.searchParams.set("redirect", `${pathname}${search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/services/:path*", "/dashboard/:path*", "/payment/:path*", "/onboarding/:path*"],
};
