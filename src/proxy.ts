import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Optimistic gate for the review desk: signed-out visitors go to the login page
// before anything renders. The real check happens again in every desk page and
// action (lib/auth.ts).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!verifySession(request.cookies.get(SESSION_COOKIE)?.value)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    // come back to where you were going (the link in the new-application email)
    if (pathname !== "/admin") url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
