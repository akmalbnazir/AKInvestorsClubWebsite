import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED = ["/learn", "/forum", "/admin", "/simulator", "/course", "/tools"];

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Admin is additionally protected server-side; here just require cookie
  if (PROTECTED.some(p => pathname.startsWith(p))) {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/learn/:path*", "/forum/:path*", "/admin/:path*", "/simulator/:path*", "/course/:path*", "/tools/:path*"]
};
