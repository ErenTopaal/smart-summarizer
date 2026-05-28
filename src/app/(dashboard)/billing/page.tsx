"use client";

import { useState } from "react";
import { Check, Zap, Star, Crown, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { PLAN_LIMITS } from "@/types";
import { cn } from "@/lib/utils";

const PLAN_ICONS = {
  free: Zap,
  pro: Star,
  premium: Crown,
};

const PLAN_COLORS = {
  free: "var(--text-muted)",
  pro: "var(--accent-cyan)",
  premium: "var(--accent-violet)",
};

export default function BillingPage() {
  const { user, refresh } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = user?.subscription?.plan || "free";
  const plans = Object.entries(PLAN_LIMITS) as [string, typeof PLAN_LIMITS.free][];

  const handleUpgrade = async (plan: string) => {
    if (plan === "free") return;
    setLoading(plan);
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        error("Ödeme sayfası açılamadı", data.error);
      }
    } catch {
      error("Bağlantı hatası");
    } finally {
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/subscription/portal", { method: "POST" });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        error("Fatura portalı açılamadı");
      }
    } catch {
      error("Bağlantı hatası");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl" style={{ color: "var(--text-primary)" }}>
          Abonelik
        </h1>
        <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          İhtiyacınıza göre plan seçin
        </p>
      </div>

      {/* Current plan info */}
      {currentPlan !== "free" && (
        <Card gradient className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Mevcut Plan</p>
            <p className="font-display font-bold text-xl mt-0.5" style={{ color: "var(--text-primary)" }}>
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
            </p>
            {user?.subscription?.currentPeriodEnd && (
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Yenileme: {new Date(user.subscription.currentPeriodEnd).toLocaleDateString("tr-TR")}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={handleManageBilling}
            loading={loading === "portal"}
          >
            Faturayı Yönet
          </Button>
        </Card>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map(([planId, config]) => {
          const Icon = PLAN_ICONS[planId as keyof typeof PLAN_ICONS];
          const color = PLAN_COLORS[planId as keyof typeof PLAN_COLORS];
          const isCurrentPlan = currentPlan === planId;
          const isPremium = planId === "premium";

          return (
            <div
              key={planId}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col transition-all duration-200",
                isPremium ? "border-[var(--accent-violet)]" : isCurrentPlan ? "border-[var(--accent-cyan)]" : "border-[var(--border-subtle)]",
                "bg-[var(--bg-card)]"
              )}
              style={isPremium ? { boxShadow: "0 0 30px rgba(124,58,237,0.15)" } : {}}
            >
              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="premium" size="md">En Popüler</Badge>
                </div>
              )}

              <div className="mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: color + "20", color }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="font-display font-bold text-lg capitalize" style={{ color: "var(--text-primary)" }}>
                  {planId}
                </h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display font-bold text-3xl" style={{ color: "var(--text-primary)" }}>
                    ${config.priceMonthly}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>/ay</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {config.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color }} />
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <div className="text-center py-2.5 rounded-lg text-sm font-medium" style={{ background: color + "15", color }}>
                  Mevcut Plan ✓
                </div>
              ) : planId === "free" ? (
                <div className="text-center py-2.5 rounded-lg text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  Ücretsiz
                </div>
              ) : (
                <Button
                  variant={isPremium ? "primary" : "outline"}
                  fullWidth
                  loading={loading === planId}
                  onClick={() => handleUpgrade(planId)}
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                >
                  {planId.charAt(0).toUpperCase() + planId.slice(1)}'a Geç
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <Card>
        <h2 className="font-display font-semibold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
          Sık Sorulan Sorular
        </h2>
        <div className="space-y-4">
          {[
            { q: "İstediğim zaman iptal edebilir miyim?", a: "Evet, aboneliğinizi istediğiniz zaman iptal edebilirsiniz. Mevcut dönem sonuna kadar kullanmaya devam edebilirsiniz." },
            { q: "Ödeme güvenli mi?", a: "Evet. Tüm ödemeler Stripe altyapısı üzerinden SSL şifreli olarak işlenir." },
            { q: "Ücretsiz planın limitleri nelerdir?", a: "Günde 3 özet, 5MB dosya boyutu limiti ve 7 günlük geçmiş erişimi." },
          ].map((faq, i) => (
            <div key={i} className="pb-4 last:pb-0 last:border-0 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="font-medium text-sm mb-1" style={{ color: "var(--text-primary)" }}>{faq.q}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
