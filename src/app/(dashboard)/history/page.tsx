"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Trash2, Heart, Sparkles, GraduationCap, Briefcase, Stethoscope, Scale, BookOpen, Share2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { SummaryCardSkeleton } from "@/components/ui/Skeleton";
import { formatDateRelative } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { Summary } from "@/types";
import { MODE_CONFIG } from "@/types";
import { cn } from "@/lib/utils";

const MODE_ICONS: Record<string, React.ElementType> = {
  general: Sparkles,
  lesson: GraduationCap,
  business: Briefcase,
  medical: Stethoscope,
  legal: Scale,
  academic: BookOpen,
  social_media: Share2,
};

export default function HistoryPage() {
  const { success, error } = useToast();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadSummaries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
        ...(search && { search }),
        ...(modeFilter && { mode: modeFilter }),
      });
      const res = await fetch(`/api/history?${params}`);
      const data = await res.json();
      if (data.success) {
        setSummaries(data.data.items);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } catch {
      error("Yükleme başarısız");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadSummaries, 300);
    return () => clearTimeout(timer);
  }, [page, search, modeFilter]);

  const deleteSummary = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Bu özeti silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSummaries((prev) => prev.filter((s) => s.id !== id));
        success("Özet silindi");
      }
    } catch {
      error("Silme başarısız");
    }
  };

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setSummaries((prev) =>
          prev.map((s) => s.id === id ? { ...s, isFavorite: data.favorited } : s)
        );
        success(data.favorited ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
      }
    } catch {
      error("İşlem başarısız");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl" style={{ color: "var(--text-primary)" }}>
            Geçmiş
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {total} özet
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Özet ara..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none transition-colors"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          />
        </div>
        <select
          value={modeFilter}
          onChange={(e) => { setModeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg text-sm border focus:outline-none"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          <option value="">Tüm modlar</option>
          {Object.entries(MODE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Summary list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : summaries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
            <Search size={24} style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {search || modeFilter ? "Sonuç bulunamadı" : "Henüz özet yok"}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {search || modeFilter ? "Farklı bir arama deneyin" : "İlk özeti oluşturmak için Özetle sayfasına gidin"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {summaries.map((summary) => {
            const config = MODE_CONFIG[summary.mode];
            const Icon = MODE_ICONS[summary.mode] || Sparkles;

            return (
              <Link key={summary.id} href={`/history/${summary.id}`}>
                <Card hover className="group">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: config.color + "20" }}
                    >
                      <Icon size={20} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                          {summary.title}
                        </p>
                        {summary.isFavorite && (
                          <Heart size={12} className="shrink-0 fill-[var(--accent-rose)] text-[var(--accent-rose)]" />
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {summary.shortSummary?.slice(0, 100)}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant="info" size="sm">{config.label}</Badge>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {formatDateRelative(summary.createdAt)}
                        </span>
                        {summary.tokensUsed > 0 && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {summary.tokensUsed} token
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => toggleFavorite(summary.id, e)}
                        className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
                      >
                        <Heart
                          size={15}
                          className={cn(
                            "transition-colors",
                            summary.isFavorite
                              ? "fill-[var(--accent-rose)] text-[var(--accent-rose)]"
                              : "text-[var(--text-muted)]"
                          )}
                        />
                      </button>
                      <button
                        onClick={(e) => deleteSummary(summary.id, e)}
                        className="p-2 rounded-lg transition-colors hover:bg-[rgba(244,63,94,0.1)] hover:text-[var(--accent-rose)]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Önceki
          </Button>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}
