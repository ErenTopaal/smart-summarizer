import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyJWT, JWTPayload } from "./jwt";
import prisma from "@/lib/db";

export type AuthenticatedRequest = NextRequest & { user: JWTPayload };

export async function requireAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = await getTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ success: false, error: "Yetkilendirme gerekli" }, { status: 401 });
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Geçersiz veya süresi dolmuş token" }, { status: 401 });
  }

  // Check if user is still active and not banned
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, isActive: true, isBanned: true, role: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ success: false, error: "Hesap bulunamadı" }, { status: 401 });
  }

  if (user.isBanned) {
    return NextResponse.json({ success: false, error: "Hesabınız askıya alınmış" }, { status: 403 });
  }

  return handler(req, { ...payload, role: user.role });
}

export async function requireAdmin(
  req: NextRequest,
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(req, async (req, user) => {
    if (user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Yetkisiz erişim" }, { status: 403 });
    }
    return handler(req, user);
  });
}

export async function requireSubscription(
  req: NextRequest,
  plans: string[],
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(req, async (req, user) => {
    if (user.role === "admin") return handler(req, user);

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.sub },
    });

    if (!subscription || !plans.includes(subscription.plan)) {
      return NextResponse.json(
        { success: false, error: "Bu özellik için plan yükseltmeniz gerekiyor" },
        { status: 403 }
      );
    }

    return handler(req, user);
  });
}
