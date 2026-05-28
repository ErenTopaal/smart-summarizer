"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { Shield, Bell, Eye, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { success } = useToast();
  const [notifications, setNotifications] = useState({ email: true, weekly: true });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-3xl" style={{ color: "var(--text-primary)" }}>Ayarlar</h1>

      <Card>
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Bell size={16} style={{ color: "var(--accent-cyan)" }} />
          Bildirimler
        </h2>
        <div className="space-y-4">
          {[
            { key: "email", label: "E-posta bildirimleri", desc: "Yeni özellikler ve güncellemeler" },
            { key: "weekly", label: "Haftalık özet", desc: "Haftalık kullanım raporunuz" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`w-11 h-6 rounded-full transition-all relative ${notifications[item.key as keyof typeof notifications] ? "bg-[var(--accent-cyan)]" : "bg-[var(--bg-elevated)]"}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications[item.key as keyof typeof notifications] ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Shield size={16} style={{ color: "var(--accent-cyan)" }} />
          Güvenlik
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Şifre Değiştir</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Son değişiklik: bilinmiyor</p>
            </div>
            <Button variant="secondary" size="sm">Değiştir</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Aktif Oturumlar</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Tüm cihazlardan çıkış yap</p>
            </div>
            <Button variant="secondary" size="sm">Oturumları Kapat</Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--accent-rose)" }}>
          <Trash2 size={16} />
          Tehlikeli Bölge
        </h2>
        <div className="p-4 rounded-lg" style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.2)" }}>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Hesabı Sil</p>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
          </p>
          <Button variant="danger" size="sm">Hesabımı Sil</Button>
        </div>
      </Card>
    </div>
  );
}
