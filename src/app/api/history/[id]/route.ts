import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import prisma from "@/lib/db";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireAuth(req, async (_req: NextRequest, user: JWTPayload) => {
    const { id } = await params;

    const summary = await prisma.summary.findFirst({
      where: { id, userId: user.sub },
      include: { file: true },
    });

    if (!summary) {
      return NextResponse.json({ success: false, error: "Özet bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: summary });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireAuth(req, async (_req: NextRequest, user: JWTPayload) => {
    const { id } = await params;

    const summary = await prisma.summary.findFirst({
      where: { id, userId: user.sub },
    });

    if (!summary) {
      return NextResponse.json({ success: false, error: "Özet bulunamadı" }, { status: 404 });
    }

    await prisma.summary.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Özet silindi" });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireAuth(req, async (_req: NextRequest, user: JWTPayload) => {
    const { id } = await params;
    const body = await req.json();

    const summary = await prisma.summary.findFirst({
      where: { id, userId: user.sub },
    });

    if (!summary) {
      return NextResponse.json({ success: false, error: "Özet bulunamadı" }, { status: 404 });
    }

    const updated = await prisma.summary.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.isFavorite !== undefined && { isFavorite: body.isFavorite }),
        ...(body.tags && { tags: body.tags }),
        ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  });
}
