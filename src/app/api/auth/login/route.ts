import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signJWT, setAuthCookie } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "E-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { success: false, error: `Hesabınız askıya alınmış: ${user.banReason || "Kural ihlali"}` },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "E-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    // Update last login
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    const token = await signJWT({ sub: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Giriş başarılı",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          emailVerified: user.emailVerified,
          subscription: user.subscription
            ? {
                plan: user.subscription.plan,
                status: user.subscription.status,
                dailySummaryLimit: user.subscription.dailySummaryLimit,
                summariesUsedToday: user.subscription.summariesUsedToday,
              }
            : null,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Giriş başarısız" },
      { status: 500 }
    );
  }
}
