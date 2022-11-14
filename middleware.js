import { NextResponse, NextRequest } from "next/server";

export default async function middleware(req) {
  const access_token = req.cookies.get("access_token");
  const url = req.nextUrl.clone();
  const regexFile = /\.[a-zA-Z0-9]+$/;
  const otherSource = /(\/_next\/)|(\/api\/)/;

  if (regexFile.test(url.pathname) || otherSource.test(url.pathname)) return NextResponse.next();
}
