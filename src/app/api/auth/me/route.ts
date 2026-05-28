import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import prisma from "@/lib/db";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  return requireAuth(req, async (_req: NextRequest, user: JWTPayload) => {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.sub },
      include: {
        subscription: true,
        _count: {
          select: { summaries: true, files: true, favorites: true },
        },
      },
    });

    if (!fullUser) {
      return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        username: fullUser.username,
        image: fullUser.image,
        role: fullUser.role,
        bio: fullUser.bio,
        language: fullUser.language,
        timezone: fullUser.timezone,
        emailVerified: fullUser.emailVerified,
        createdAt: fullUser.createdAt,
        subscription: fullUser.subscription,
        stats: {
          totalSummaries: fullUser._count.summaries,
          totalFiles: fullUser._count.files,
          totalFavorites: fullUser._count.favorites,
        },
      },
    });
  });
}
