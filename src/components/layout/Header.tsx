"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Menu, ChevronDown, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || "?";

  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-4 px-5 sticky top-0 z-30">
      <button
        onClick={onMenuToggle}
        className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Özet ara..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <button className="relative p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--accent-cyan)] rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden" style={{ background: "var(--gradient-brand)" }}>
                  {user.image ? (
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-[var(--text-primary)] leading-none">{user.name || "Kullanıcı"}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{user.subscription?.plan?.toUpperCase() || "FREE"}</p>
                </div>
                <ChevronDown size={14} className={cn("text-[var(--text-muted)] transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 border rounded-[var(--radius-md)] shadow-[var(--shadow-card)] overflow-hidden z-50" style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                  <div className="p-3 border-b border-[var(--border-subtle)]">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                  {[
                    { href: "/profile", label: "Profil" },
                    { href: "/billing", label: "Abonelik" },
                    { href: "/settings", label: "Ayarlar" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-[var(--border-subtle)]">
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="w-full text-left px-3 py-2 text-sm text-[var(--accent-rose)] hover:bg-[rgba(225,29,72,0.06)] transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-[var(--radius-md)] transition-colors border border-[var(--border-default)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <LogIn size={14} />
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-[var(--radius-md)] text-white transition-colors hover:opacity-90"
              style={{ background: "var(--gradient-brand)" }}
            >
              Ücretsiz Başla
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
