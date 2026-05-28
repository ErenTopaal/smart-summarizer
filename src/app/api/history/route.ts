import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import prisma from "@/lib/db";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  return requireAuth(req, async (req: NextRequest, user: JWTPayload) => {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 50);
    const mode = searchParams.get("mode") || undefined;
    const search = searchParams.get("search") || undefined;
    const favorite = searchParams.get("favorite") === "true";

    const where = {
      userId: user.sub,
      ...(mode && { mode: mode as never }),
      ...(favorite && { isFavorite: true }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as never } },
          { shortSummary: { contains: search, mode: "insensitive" as never } },
        ],
      }),
    };

    const [summaries, total] = await Promise.all([
      prisma.summary.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          file: {
            select: { originalName: true, fileType: true, sizeBytes: true },
          },
        },
      }),
      prisma.summary.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: summaries,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  });
}
