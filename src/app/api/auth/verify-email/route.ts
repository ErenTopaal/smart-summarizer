import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ success: false, error: "Token gerekli" }, { status: 400 });
  }

  const record = await prisma.emailVerification.findUnique({ where: { token } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      { success: false, error: "Bu link geçersiz veya süresi dolmuş" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerification.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?verified=true`
  );
}
