import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login";
  const isRootPage = pathname === "/";

  // 1. Unauthenticated users
  if (!token) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/manager") ||
      pathname.startsWith("/driver") ||
      pathname === "/"
    ) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Authenticated users
  const role = token.role;

  // Determine correct landing page for user role
  let defaultPath = "/login";
  if (role === "SUPER_ADMIN") {
    defaultPath = "/admin/dashboard";
  } else if (role === "TRANSPORT_MANAGER") {
    defaultPath = "/manager/dashboard";
  } else if (role === "DRIVER") {
    defaultPath = "/driver";
  }

  // If hitting login or root, redirect to their default path
  if (isAuthPage || isRootPage) {
    if (defaultPath === "/login" && isAuthPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(defaultPath, request.url));
  }

  // Protect paths: redirect cross-role access to their own default landing
  if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL(defaultPath, request.url));
  }

  if (pathname.startsWith("/manager") && role !== "TRANSPORT_MANAGER") {
    return NextResponse.redirect(new URL(defaultPath, request.url));
  }

  if (pathname.startsWith("/driver") && role !== "DRIVER") {
    return NextResponse.redirect(new URL(defaultPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/manager/:path*",
    "/driver/:path*",
  ],
};
