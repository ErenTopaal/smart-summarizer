"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validators";
import Badge from "@/components/ui/Badge";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      language: user?.language || "tr",
      timezone: user?.timezone || "UTC",
    },
  });

  const onSubmit = async (data: ProfileUpdateInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        await refresh();
        success("Profil güncellendi!");
      } else {
        error(result.error || "Güncelleme başarısız");
      }
    } catch {
      error("Bağlantı hatası");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl" style={{ color: "var(--text-primary)" }}>Profil</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Hesap bilgilerinizi yönetin</p>
      </div>

      {/* Avatar */}
      <Card>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))", color: "white" }}>
              {user?.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                initials
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--bg-elevated)", border: "2px solid var(--bg-base)" }}>
              <Camera size={12} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{user?.name || "Kullanıcı"}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user?.subscription?.plan === "premium" ? "premium" : user?.subscription?.plan === "pro" ? "info" : "default"}>
                {(user?.subscription?.plan || "free").toUpperCase()}
              </Badge>
              {user?.emailVerified && (
                <Badge variant="success">E-posta Doğrulandı</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card>
        <h2 className="font-display font-semibold mb-5" style={{ color: "var(--text-primary)" }}>Kişisel Bilgiler</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Ad Soyad</label>
              <input
                {...register("name")}
                className="w-full px-4 py-2.5 rounded-lg text-sm border focus:outline-none transition-colors"
                style={{ background: "var(--bg-card)", borderColor: errors.name ? "var(--accent-rose)" : "var(--border-default)", color: "var(--text-primary)" }}
              />
              {errors.name && <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Kullanıcı Adı</label>
              <input
                {...register("username")}
                className="w-full px-4 py-2.5 rounded-lg text-sm border focus:outline-none transition-colors"
                style={{ background: "var(--bg-card)", borderColor: errors.username ? "var(--accent-rose)" : "var(--border-default)", color: "var(--text-primary)" }}
                placeholder="kullanici_adi"
              />
              {errors.username && <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{errors.username.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Hakkımda</label>
            <textarea
              {...register("bio")}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg text-sm border focus:outline-none resize-none transition-colors"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              placeholder="Kendinizi tanıtın..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Dil</label>
              <select
                {...register("language")}
                className="w-full px-4 py-2.5 rounded-lg text-sm border focus:outline-none"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Saat Dilimi</label>
              <select
                {...register("timezone")}
                className="w-full px-4 py-2.5 rounded-lg text-sm border focus:outline-none"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">New York (UTC-5)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" loading={saving} icon={<Save size={14} />}>
              Kaydet
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
