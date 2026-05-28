import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/middleware";
import prisma from "@/lib/db";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  return requireAdmin(req, async (req: NextRequest, _user: JWTPayload) => {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 100);
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as never } },
          { name: { contains: search, mode: "insensitive" as never } },
        ],
      }),
      ...(role && { role: role as never }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          subscription: { select: { plan: true, status: true } },
          _count: { select: { summaries: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: users.map((u: { id: string; name: string | null; email: string; role: string; isActive: boolean; isBanned: boolean; createdAt: Date; lastLoginAt: Date | null; subscription: { plan: string; status: string } | null; _count: { summaries: number } }) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isActive: u.isActive,
          isBanned: u.isBanned,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
          subscription: u.subscription,
          summaryCount: u._count.summaries,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  });
}
