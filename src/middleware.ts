import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, getTokenFromRequest } from "@/lib/auth/jwt";

const ADMIN_ROUTES = ["/admin", "/api/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Allow Stripe webhook
  if (pathname === "/api/webhooks/stripe") {
    return NextResponse.next();
  }

  // Admin routes still require auth + admin role
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    const token = await getTokenFromRequest(req);
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Yetkilendirme gerekli" }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Yetkisiz erişim" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
