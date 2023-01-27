import { NextResponse, NextRequest } from "next/server";

export async function middleware(req) {
  const accessToken = req.cookies.get("access_token")?.value;
  const url = req.nextUrl.clone();

  if (!accessToken && url.pathname !== "/login") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!accessToken) {
    return NextResponse.next();
  }

  if (url.pathname === "/login") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js).*)",
  ],
};
