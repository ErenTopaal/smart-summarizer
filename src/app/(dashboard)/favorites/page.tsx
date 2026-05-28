"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Sparkles, GraduationCap, Briefcase } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SummaryCardSkeleton } from "@/components/ui/Skeleton";
import { formatDateRelative } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { Summary } from "@/types";
import { MODE_CONFIG } from "@/types";

export default function FavoritesPage() {
  const { success, error } = useToast();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history?favorite=true&pageSize=50")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSummaries(d.data.items); })
      .catch(() => error("Yükleme başarısız"))
      .finally(() => setLoading(false));
  }, []);

  const removeFavorite = async (id: string, e: React.MouseEvent) => {
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
        setSummaries((prev) => prev.filter((s) => s.id !== id));
        success("Favorilerden çıkarıldı");
      }
    } catch {
      error("İşlem başarısız");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-3xl" style={{ color: "var(--text-primary)" }}>
        Favoriler
      </h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : summaries.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Henüz favori yok</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Özetleri favorilere eklemek için kalp ikonuna tıklayın</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summaries.map((summary) => {
            const config = MODE_CONFIG[summary.mode];
            return (
              <Link key={summary.id} href={`/history/${summary.id}`}>
                <Card hover className="h-full group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="info" size="sm">{config.label}</Badge>
                    </div>
                    <button
                      onClick={(e) => removeFavorite(summary.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart size={14} className="fill-[var(--accent-rose)] text-[var(--accent-rose)]" />
                    </button>
                  </div>
                  <p className="font-semibold text-sm mb-1 truncate" style={{ color: "var(--text-primary)" }}>
                    {summary.title}
                  </p>
                  <p className="text-xs truncate-2" style={{ color: "var(--text-muted)" }}>
                    {summary.shortSummary}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    {formatDateRelative(summary.createdAt)}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
