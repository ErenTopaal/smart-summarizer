"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import SummaryResult from "@/components/summary/SummaryResult";
import Button from "@/components/ui/Button";
import { SummaryCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import type { Summary } from "@/types";

export default function SummaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { error } = useToast();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/history/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setSummary(data.data);
        } else {
          error("Özet bulunamadı");
          router.push("/history");
        }
      } catch {
        error("Yükleme başarısız");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) load();
  }, [params.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => router.back()}>
        Geri
      </Button>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : summary ? (
        <SummaryResult
          summary={summary}
          onFavoriteToggle={(_, favorited) => {
            setSummary((prev) => prev ? { ...prev, isFavorite: favorited } : null);
          }}
        />
      ) : (
        <div className="text-center py-20">
          <Sparkles size={40} style={{ color: "var(--text-muted)" }} className="mx-auto mb-4" />
          <p style={{ color: "var(--text-muted)" }}>Özet bulunamadı</p>
        </div>
      )}
    </div>
  );
}
