import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import prisma from "@/lib/db";
import { profileUpdateSchema } from "@/lib/validators";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function PATCH(req: NextRequest) {
  return requireAuth(req, async (_req: NextRequest, user: JWTPayload) => {
    const body = await req.json();
    const validated = profileUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, username, bio, language, timezone } = validated.data;

    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: user.sub } },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Bu kullanıcı adı zaten kullanımda" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.sub },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(language && { language }),
        ...(timezone && { timezone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        bio: true,
        language: true,
        timezone: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  });
}
