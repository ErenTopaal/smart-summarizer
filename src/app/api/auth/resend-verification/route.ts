import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "E-posta gerekli" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Return success to avoid user enumeration
      return NextResponse.json({ success: true });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: false, error: "E-posta adresi zaten doğrulanmış" }, { status: 400 });
    }

    // Delete old tokens
    await prisma.emailVerification.deleteMany({ where: { userId: user.id } });

    const token = uuidv4();
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ success: false, error: "Gönderilemedi" }, { status: 500 });
  }
}
