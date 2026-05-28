import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = resetPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validated.data;

    const resetRecord = await prisma.passwordReset.findUnique({ where: { token } });

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Bu link geçersiz veya süresi dolmuş" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Şifreniz başarıyla güncellendi" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Şifre sıfırlama başarısız" },
      { status: 500 }
    );
  }
}
