import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/middleware";
import prisma from "@/lib/db";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireAdmin(req, async (_req: NextRequest, admin: JWTPayload) => {
    const { id } = await params;
    const body = await req.json();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.action === "ban") {
      updateData.isBanned = true;
      updateData.banReason = body.reason || "Kural ihlali";
      updateData.bannedAt = new Date();
      updateData.bannedBy = admin.sub;
    } else if (body.action === "unban") {
      updateData.isBanned = false;
      updateData.banReason = null;
      updateData.bannedAt = null;
      updateData.bannedBy = null;
    } else if (body.role) {
      updateData.role = body.role;
    }

    const updated = await prisma.user.update({ where: { id }, data: updateData });

    await prisma.adminLog.create({
      data: {
        adminId: admin.sub,
        action: body.action || "update_user",
        targetType: "user",
        targetId: id,
        description: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  });
}
