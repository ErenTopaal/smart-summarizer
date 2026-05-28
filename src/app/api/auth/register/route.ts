import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { signJWT, setAuthCookie } from "@/lib/auth/jwt";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";
import { registerSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Bu e-posta adresi zaten kullanımda" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "free_user",
        subscription: {
          create: {
            plan: "free",
            status: "active",
            dailySummaryLimit: 3,
            fileSizeLimitMB: 5,
            monthlyTokenLimit: 50000,
          },
        },
      },
    });

    // Create email verification token
    const verificationToken = uuidv4();
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send emails (non-blocking)
    Promise.all([
      sendVerificationEmail(email, verificationToken).catch(console.error),
      sendWelcomeEmail(email, name).catch(console.error),
    ]);

    const token = await signJWT({ sub: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Hesap başarıyla oluşturuldu",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Kayıt işlemi başarısız" },
      { status: 500 }
    );
  }
}
