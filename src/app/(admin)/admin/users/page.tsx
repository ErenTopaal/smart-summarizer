"use client";

import { useEffect, useState } from "react";
import { Search, Ban, CheckCircle, Shield } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  subscription: { plan: string; status: string } | null;
  summaryCount: number;
}

export default function AdminUsersPage() {
  const { success, error } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), pageSize: "20", ...(search && { search }) });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.items);
        setTotal(data.data.total);
      }
    } catch {
      error("Yükleme başarısız");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [page, search]);

  const handleBan = async (userId: string, banned: boolean) => {
    const reason = banned ? undefined : prompt("Ban sebebi (opsiyonel):");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: banned ? "unban" : "ban", reason }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => u.id === userId ? { ...u, isBanned: !banned } : u)
        );
        success(banned ? "Ban kaldırıldı" : "Kullanıcı banlandı");
      }
    } catch {
      error("İşlem başarısız");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl" style={{ color: "var(--text-primary)" }}>
          Kullanıcı Yönetimi
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{total} kullanıcı</p>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="E-posta veya isim ara..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
        />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Kullanıcı", "Rol", "Plan", "Özetler", "Son Giriş", "Durum", "İşlem"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold px-4 py-3" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded skeleton" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-subtle)" }} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{u.name || "-"}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs" style={{ color: u.role === "admin" ? "var(--accent-cyan)" : "var(--text-muted)" }}>
                        {u.role === "admin" && <Shield size={12} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.subscription?.plan === "premium" ? "premium" : u.subscription?.plan === "pro" ? "info" : "default"} size="sm">
                        {u.subscription?.plan || "free"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{u.summaryCount}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {u.lastLoginAt ? formatDate(u.lastLoginAt) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isBanned ? "danger" : "success"} size="sm">
                        {u.isBanned ? "Banlı" : "Aktif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant={u.isBanned ? "secondary" : "ghost"}
                        icon={u.isBanned ? <CheckCircle size={12} /> : <Ban size={12} />}
                        onClick={() => handleBan(u.id, u.isBanned)}
                        className={u.isBanned ? "" : "hover:text-[var(--accent-rose)]"}
                      >
                        {u.isBanned ? "Unban" : "Ban"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
