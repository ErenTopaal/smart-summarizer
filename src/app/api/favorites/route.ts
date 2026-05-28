import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import prisma from "@/lib/db";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  return requireAuth(req, async (_req: NextRequest, user: JWTPayload) => {
    const { summaryId } = await req.json();

    const summary = await prisma.summary.findFirst({
      where: { id: summaryId, userId: user.sub },
    });

    if (!summary) {
      return NextResponse.json({ success: false, error: "Özet bulunamadı" }, { status: 404 });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_summaryId: { userId: user.sub, summaryId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      await prisma.summary.update({ where: { id: summaryId }, data: { isFavorite: false } });
      return NextResponse.json({ success: true, favorited: false });
    }

    await prisma.favorite.create({ data: { userId: user.sub, summaryId } });
    await prisma.summary.update({ where: { id: summaryId }, data: { isFavorite: true } });

    return NextResponse.json({ success: true, favorited: true });
  });
}
