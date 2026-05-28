"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Zap, Lock, CheckCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const resetSchema = z.object({
  password: z.string().min(8, "En az 8 karakter").regex(/[A-Z]/, "Büyük harf içermeli").regex(/[0-9]/, "Rakam içermeli"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Şifreler eşleşmiyor", path: ["confirmPassword"] });

type ResetInput = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({ resolver: zodResolver(resetSchema) });

  useEffect(() => {
    if (!token) {
      toastError("Geçersiz şifre sıfırlama bağlantısı");
    }
  }, [token]);

  const onSubmit = async (data: ResetInput) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const result = await res.json();
      if (result.success) {
        setDone(true);
        success("Şifreniz başarıyla güncellendi");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toastError(result.error || "Şifre sıfırlanamadı");
      }
    } catch {
      toastError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--accent-cyan)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--accent-violet)" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))" }}>
              <Zap size={20} style={{ color: "white" }} />
            </div>
            <span className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>
              Smart Summarizer AI
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: "var(--text-primary)" }}>
            Yeni Şifre Belirle
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Hesabınız için yeni bir şifre oluşturun
          </p>
        </div>

        <div className="rounded-2xl border p-8" style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(16, 185, 129, 0.15)" }}>
                <CheckCircle size={32} style={{ color: "var(--accent-emerald)" }} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
                Şifre Güncellendi!
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Yeni Şifre
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="En az 8 karakter, büyük harf ve rakam"
                    className={cn(
                      "w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-colors focus:outline-none border",
                      errors.password ? "border-red-500" : "border-[var(--border-default)] focus:border-[var(--accent-cyan)]"
                    )}
                    style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
                    {...register("password")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Şifreyi tekrar girin"
                    className={cn(
                      "w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-colors focus:outline-none border",
                      errors.confirmPassword ? "border-red-500" : "border-[var(--border-default)] focus:border-[var(--accent-cyan)]"
                    )}
                    style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
                    {...register("confirmPassword")}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" loading={loading} fullWidth size="lg" disabled={!token}>
                Şifreyi Güncelle
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 text-center border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <Link href="/login" className="text-sm hover:underline" style={{ color: "var(--accent-cyan)" }}>
              ← Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent-cyan)" }} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
