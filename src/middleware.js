import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function middleware(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  if (token) {
      if (pathname === "/login" || pathname === "/register") {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
  } else {
    if (pathname !== "/login" && pathname !== "/register") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/login", "/register"],
};
