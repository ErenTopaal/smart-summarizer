import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { createCheckoutSession } from "@/lib/stripe";
import prisma from "@/lib/db";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  return requireAuth(req, async (_req: NextRequest, user: JWTPayload) => {
    const { plan } = await req.json();

    if (!["pro", "premium"].includes(plan)) {
      return NextResponse.json({ success: false, error: "Geçersiz plan" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
    if (!dbUser) {
      return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = await createCheckoutSession(
      user.sub,
      dbUser.email,
      plan,
      `${appUrl}/billing?success=true`,
      `${appUrl}/billing?canceled=true`
    );

    return NextResponse.json({ success: true, data: { url } });
  });
}
