import { NextResponse } from "next/server";
import { getDecrypt } from "@/services/encryptDecrypt";

export async function middleware(req) {
  const accessToken = req.cookies.get("access_token")?.value;
  const menu = req.cookies.get("menu")?.value;
  const url = req.nextUrl.clone();

  const accessMenu = {
    admin: ["/", "/manajemen-user", "/penilaian-karyawan", "/absensi", "/ranking", "/profile"],
    karyawan: ["/", "/ranking", "/profile"],
  };

  if (accessToken && menu) {
    const parsedAccessToken = JSON.parse(getDecrypt(accessToken));
    const parsedMenu = JSON.parse(getDecrypt(menu));

    if (parsedAccessToken === null || parsedMenu === null) {
      if (url.pathname === "/login") {
        return NextResponse.next();
      } else {
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    } else {
      if (url.pathname === "/login") {
        url.pathname = "/";
        return NextResponse.redirect(url);
      } else {
        const urlPath = url.pathname.split("/").slice(0, 2).join("/");
        if (accessMenu[parsedAccessToken.role].includes(urlPath) === false) {
          url.pathname = "/";
          return NextResponse.redirect(url);
        } else {
          return NextResponse.next();
        }
      }
    }
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
