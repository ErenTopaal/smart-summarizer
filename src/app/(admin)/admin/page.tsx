"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Zap, DollarSign, TrendingUp, Activity } from "lucide-react";
import Card from "@/components/ui/Card";
import { DashboardStatSkeleton } from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import type { AdminAnalytics } from "@/types";
import { MODE_CONFIG } from "@/types";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAnalytics(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const stats = analytics
    ? [
        { icon: <Users size={18} />, label: "Toplam Kullanıcı", value: analytics.totalUsers, sub: `+${analytics.newUsersThisWeek} bu hafta`, color: "cyan" },
        { icon: <Activity size={18} />, label: "Bugün Aktif", value: analytics.activeUsersToday, sub: "Benzersiz oturum", color: "emerald" },
        { icon: <FileText size={18} />, label: "Toplam Özet", value: analytics.totalSummaries, sub: `${analytics.summariesToday} bugün`, color: "violet" },
        { icon: <Zap size={18} />, label: "Token Kullanımı", value: `${(analytics.totalTokensUsed / 1000000).toFixed(2)}M`, sub: "Bu ay", color: "amber" },
        { icon: <DollarSign size={18} />, label: "Gelir", value: `$${analytics.totalRevenue.toFixed(2)}`, sub: "Toplam", color: "emerald" },
        { icon: <TrendingUp size={18} />, label: "Aktif Abonelik", value: analytics.activeSubscriptions, sub: "Ücretli plan", color: "rose" },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl" style={{ color: "var(--text-primary)" }}>
          Admin Panel
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Platform analitikleri ve yönetim</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <DashboardStatSkeleton key={i} />)
          : stats.map((stat, i) => (
              <Card key={i}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{
                    background: `var(--accent-${stat.color}-dim, rgba(0,212,255,0.12))`,
                    color: `var(--accent-${stat.color}, var(--accent-cyan))`
                  }}>
                    {stat.icon}
                  </div>
                </div>
                <p className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{stat.sub}</p>
              </Card>
            ))}
      </div>

      {/* Plan & Mode breakdown */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Plan Dağılımı</h3>
            <div className="space-y-3">
              {analytics.planBreakdown.map((p) => (
                <div key={p.plan} className="flex items-center justify-between">
                  <span className="text-sm capitalize" style={{ color: "var(--text-secondary)" }}>{p.plan}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 rounded-full" style={{ background: "var(--bg-elevated)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(p.count / analytics.totalUsers) * 100}%`,
                          background: "linear-gradient(to right, var(--accent-cyan), var(--accent-violet))"
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right" style={{ color: "var(--text-primary)" }}>{p.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>En Çok Kullanılan Modlar</h3>
            <div className="space-y-2">
              {analytics.modeBreakdown.slice(0, 6).map((m, i) => {
                const config = MODE_CONFIG[m.mode as keyof typeof MODE_CONFIG];
                return (
                  <div key={m.mode} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
                    <span className="text-xs w-4 text-right" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>
                    <span className="text-sm flex-1" style={{ color: "var(--text-secondary)" }}>
                      {config?.label || m.mode}
                    </span>
                    <Badge variant="info" size="sm">{m.count}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
