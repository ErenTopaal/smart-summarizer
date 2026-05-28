"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  History,
  Heart,
  User,
  Settings,
  CreditCard,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/summarize", icon: Sparkles, label: "Özetle", badge: "AI" },
  { href: "/history", icon: History, label: "Geçmiş" },
  { href: "/favorites", icon: Heart, label: "Favoriler" },
];

const bottomItems = [
  { href: "/profile", icon: User, label: "Profil" },
  { href: "/settings", icon: Settings, label: "Ayarlar" },
  { href: "/billing", icon: CreditCard, label: "Abonelik" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const plan = user?.subscription?.plan || "free";
  const planColors = {
    free: "default" as const,
    pro: "info" as const,
    premium: "premium" as const,
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gradient-brand)" }}>
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
            Smart<br />
            <span className="text-gradient">Summarizer</span>
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border flex items-center justify-center transition-colors z-10"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-muted)" }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Main nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-all duration-150",
                active
                  ? "border"
                  : ""
              )}
              style={active ? {
                background: "var(--accent-cyan-dim)",
                color: "var(--accent-cyan)",
                borderColor: "var(--border-strong)",
              } : {
                color: "var(--text-muted)",
              }}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <Badge variant="info" size="sm">{item.badge}</Badge>
              )}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-all duration-150",
              pathname.startsWith("/admin") ? "border" : ""
            )}
            style={pathname.startsWith("/admin") ? {
              background: "rgba(225,29,72,0.08)",
              color: "var(--accent-rose)",
              borderColor: "rgba(225,29,72,0.2)",
            } : {
              color: "var(--text-muted)",
            }}
          >
            <Shield size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Admin Panel</span>}
          </Link>
        )}
      </nav>

      {/* Plan indicator - only for logged-in users */}
      {!collapsed && user && (
        <div className="mx-3 mb-3 p-3 rounded-[var(--radius-md)] border" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Plan</span>
            <Badge variant={planColors[plan as keyof typeof planColors]} size="sm">
              {plan.toUpperCase()}
            </Badge>
          </div>
          {plan === "free" && (
            <Link href="/billing" className="block text-xs text-center hover:underline" style={{ color: "var(--accent-cyan)" }}>
              Pro'ya Yükselt →
            </Link>
          )}
        </div>
      )}

      {/* Guest CTA */}
      {!collapsed && !user && (
        <div className="mx-3 mb-3 p-3 rounded-[var(--radius-md)] border" style={{ background: "var(--accent-cyan-dim)", borderColor: "var(--border-default)" }}>
          <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Geçmiş & favoriler için giriş yapın</p>
          <Link href="/login" className="block w-full text-center text-xs font-medium py-1.5 rounded-lg transition-colors" style={{ background: "var(--accent-cyan)", color: "white" }}>
            Giriş Yap
          </Link>
        </div>
      )}

      {/* Bottom nav */}
      <div className="p-3 border-t space-y-1" style={{ borderColor: "var(--border-subtle)" }}>
        {user ? (
          <>
            {bottomItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-150"
                  style={{ color: active ? "var(--accent-cyan)" : "var(--text-muted)" }}
                >
                  <item.icon size={16} className="shrink-0" />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-150"
              style={{ color: "var(--text-muted)" }}
            >
              <LogOut size={16} className="shrink-0" />
              {!collapsed && <span className="text-sm">Çıkış Yap</span>}
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] transition-all" style={{ color: "var(--accent-cyan)" }}>
              <LogIn size={16} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Giriş Yap</span>}
            </Link>
            <Link href="/register" className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] transition-all" style={{ color: "var(--text-muted)" }}>
              <User size={16} className="shrink-0" />
              {!collapsed && <span className="text-sm">Kayıt Ol</span>}
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
