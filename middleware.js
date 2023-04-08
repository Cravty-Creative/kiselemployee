import { NextResponse, NextRequest } from "next/server";
import { getDecrypt } from "@/services/encryptDecrypt";

export async function middleware(req) {
  const accessToken = req.cookies.get("access_token")?.value;
  const menu = req.cookies.get("menu")?.value;
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  const accessMenu = {
    admin: ["/", "/manajemen-user", "/penilaian-karyawan", "/absensi", "/ranking"],
    karyawan: ["/", "/ranking"],
  };

  if (accessToken && menu) {
    if (url.pathname === "/login") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    const parsedAccessToken = JSON.parse(getDecrypt(accessToken));
    const urlPath = url.pathname.split('/').slice(0,2).join("/");
    
    if (accessMenu[parsedAccessToken.role].includes(urlPath) === false) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } else if (url.pathname !== "/login") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  } else {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.).*)"],
};
