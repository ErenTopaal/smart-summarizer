import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/middleware";
import prisma from "@/lib/db";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  return requireAdmin(req, async (_req: NextRequest, _user: JWTPayload) => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsersToday,
      newUsersThisWeek,
      totalSummaries,
      summariesToday,
      tokenStats,
      paymentStats,
      activeSubscriptions,
      planBreakdown,
      modeBreakdown,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastLoginAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.summary.count(),
      prisma.summary.count({ where: { createdAt: { gte: today } } }),
      prisma.usageLog.aggregate({
        _sum: { tokensUsed: true, costUsd: true },
        where: { createdAt: { gte: monthAgo } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "succeeded" },
      }),
      prisma.subscription.count({ where: { status: "active", plan: { not: "free" } } }),
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),
      prisma.summary.groupBy({
        by: ["mode"],
        _count: { mode: true },
        orderBy: { _count: { mode: "desc" } },
        take: 10,
      }),
    ]);

    // Daily stats for last 30 days
    const dailyStats = await prisma.$queryRaw<
      { date: string; summaries: number; users: number; tokens: number }[]
    >`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as summaries,
        COUNT(DISTINCT user_id) as users,
        SUM(tokens_used) as tokens
      FROM "Summary"
      WHERE created_at >= ${monthAgo}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsersToday,
        newUsersThisWeek,
        totalSummaries,
        summariesToday,
        totalTokensUsed: tokenStats._sum.tokensUsed || 0,
        totalRevenue: (paymentStats._sum.amount || 0) / 100,
        activeSubscriptions,
        planBreakdown: planBreakdown.map((p: { plan: string; _count: { plan: number } }) => ({
          plan: p.plan,
          count: p._count.plan,
        })),
        modeBreakdown: modeBreakdown.map((m: { mode: string; _count: { mode: number } }) => ({
          mode: m.mode,
          count: m._count.mode,
        })),
        dailyStats,
      },
    });
  });
}
