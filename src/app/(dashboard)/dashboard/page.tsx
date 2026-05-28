"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  Clock,
  Zap,
  TrendingUp,
  ArrowRight,
  Plus,
  GraduationCap,
  Briefcase,
  Stethoscope,
  Scale,
  BookOpen,
  Share2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Progress from "@/components/ui/Progress";
import { DashboardStatSkeleton, SummaryCardSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { formatDateRelative, formatBytes } from "@/lib/utils";
import type { Summary } from "@/types";
import { MODE_CONFIG } from "@/types";

interface DashboardData {
  recentSummaries: Summary[];
  stats: {
    summariesToday: number;
    totalSummaries: number;
    totalTokens: number;
    favoriteCount: number;
  };
}

const MODE_ICONS = {
  general: Sparkles,
  lesson: GraduationCap,
  business: Briefcase,
  medical: Stethoscope,
  legal: Scale,
  academic: BookOpen,
  social_media: Share2,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summariesRes, meRes] = await Promise.all([
          fetch("/api/history?pageSize=5"),
          fetch("/api/auth/me"),
        ]);
        const summariesData = await summariesRes.json();
        const meData = await meRes.json();

        setData({
          recentSummaries: summariesData.data?.items || [],
          stats: {
            summariesToday: meData.data?.subscription?.summariesUsedToday || 0,
            totalSummaries: meData.data?.stats?.totalSummaries || 0,
            totalTokens: meData.data?.subscription?.tokensUsedThisMonth || 0,
            favoriteCount: meData.data?.stats?.totalFavorites || 0,
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const plan = user?.subscription?.plan || "free";
  const dailyLimit = user?.subscription?.dailySummaryLimit || 3;
  const summariesToday = user?.subscription?.summariesUsedToday || 0;
  const usagePercent = dailyLimit === -1 ? 0 : (summariesToday / dailyLimit) * 100;

  const quickModes = [
    { mode: "lesson", label: "Ders Özeti", icon: GraduationCap, color: "#7c3aed" },
    { mode: "business", label: "İş Modu", icon: Briefcase, color: "#f59e0b" },
    { mode: "medical", label: "Tıbbi Analiz", icon: Stethoscope, color: "#10b981" },
    { mode: "legal", label: "Hukuki Analiz", icon: Scale, color: "#f43f5e" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl" style={{ color: "var(--text-primary)" }}>
            Merhaba, {user?.name?.split(" ")[0] || "Kullanıcı"} 👋
          </h1>
          <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Bugün ne özetlemek istersiniz?
          </p>
        </div>
        <Link href="/summarize">
          <Button icon={<Plus size={16} />} size="md">
            Yeni Özet
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <DashboardStatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={<Sparkles size={18} />}
              label="Bugünkü Özet"
              value={`${summariesToday}/${dailyLimit === -1 ? "∞" : dailyLimit}`}
              sub="Günlük kullanım"
              color="cyan"
              extra={dailyLimit !== -1 && (
                <Progress value={usagePercent} size="sm" color={usagePercent > 80 ? "rose" : "cyan"} className="mt-2" />
              )}
            />
            <StatCard
              icon={<FileText size={18} />}
              label="Toplam Özet"
              value={data?.stats.totalSummaries || 0}
              sub="Tüm zamanlar"
              color="violet"
            />
            <StatCard
              icon={<Zap size={18} />}
              label="Token Kullanımı"
              value={`${((data?.stats.totalTokens || 0) / 1000).toFixed(1)}K`}
              sub="Bu ay"
              color="amber"
            />
            <StatCard
              icon={<TrendingUp size={18} />}
              label="Favoriler"
              value={data?.stats.favoriteCount || 0}
              sub="Kaydedilen özet"
              color="emerald"
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            Hızlı Başla
          </h2>
          <Link href="/summarize" className="text-sm flex items-center gap-1 hover:underline" style={{ color: "var(--accent-cyan)" }}>
            Tümü <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickModes.map((m) => (
            <Link
              key={m.mode}
              href={`/summarize?mode=${m.mode}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5"
              style={{
                background: `${m.color}15`,
                borderColor: `${m.color}30`,
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: m.color + "25" }}>
                <m.icon size={20} style={{ color: m.color }} />
              </div>
              <span className="text-sm font-medium text-center" style={{ color: "var(--text-primary)" }}>
                {m.label}
              </span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Recent summaries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            Son Özetler
          </h2>
          <Link href="/history" className="text-sm flex items-center gap-1 hover:underline" style={{ color: "var(--accent-cyan)" }}>
            Tümünü gör <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
          </div>
        ) : data?.recentSummaries.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
              <Sparkles size={24} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Henüz özet yok</p>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>İlk özetinizi oluşturun</p>
            <Link href="/summarize">
              <Button icon={<Plus size={14} />}>Özetle</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {data?.recentSummaries.map((summary) => {
              const mode = summary.mode;
              const config = MODE_CONFIG[mode];
              const Icon = MODE_ICONS[mode] || Sparkles;

              return (
                <Link key={summary.id} href={`/history/${summary.id}`}>
                  <Card hover className="transition-all">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: config.color + "25" }}
                      >
                        <Icon size={18} style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                          {summary.title}
                        </p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                          {summary.shortSummary?.slice(0, 80)}...
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="info" size="sm">{config.label}</Badge>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          {formatDateRelative(summary.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Upgrade CTA for free users */}
      {plan === "free" && (
        <Card gradient className="overflow-hidden relative">
          <div className="absolute inset-0 opacity-5" style={{ background: "var(--gradient-brand)" }} />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                Pro'ya yükselt
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Günde 30 özet, 50MB dosya, tüm AI modelleri
              </p>
            </div>
            <Link href="/billing">
              <Button variant="outline" icon={<ArrowRight size={14} />} iconPosition="right">
                Planları Gör
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  extra?: React.ReactNode;
}) {
  const colorMap = {
    cyan: "var(--accent-cyan)",
    violet: "var(--accent-violet)",
    amber: "var(--accent-amber)",
    emerald: "var(--accent-emerald)",
    rose: "var(--accent-rose)",
  };

  const bg = {
    cyan: "var(--accent-cyan-dim)",
    violet: "var(--accent-violet-dim)",
    amber: "rgba(245,158,11,0.12)",
    emerald: "rgba(16,185,129,0.12)",
    rose: "rgba(244,63,94,0.12)",
  };

  const c = colorMap[color as keyof typeof colorMap] || colorMap.cyan;
  const b = bg[color as keyof typeof bg] || bg.cyan;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: b, color: c }}>
          {icon}
        </div>
      </div>
      <p className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
      {extra}
    </Card>
  );
}
