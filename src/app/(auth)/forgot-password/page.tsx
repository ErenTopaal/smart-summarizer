"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Zap, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { forgotPasswordSchema } from "@/lib/validators";
import { cn } from "@/lib/utils";

type ForgotInput = { email: string };

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setSent(true);
        success("E-posta gönderildi!");
      } else {
        error(result.error || "İşlem başarısız");
      }
    } catch {
      error("Bağlantı hatası");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-base)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))" }}>
              <Zap size={20} style={{ color: "white" }} />
            </div>
          </div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: "var(--text-primary)" }}>
            Şifremi Unuttum
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            E-postanıza sıfırlama bağlantısı göndereceğiz
          </p>
        </div>

        <div className="rounded-2xl border p-8" style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                <CheckCircle size={32} style={{ color: "var(--accent-emerald)" }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>E-posta gönderildi!</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Spam klasörünüzü de kontrol edin.
                </p>
              </div>
              <Link href="/login" className="block text-center text-sm font-medium hover:underline" style={{ color: "var(--accent-cyan)" }}>
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  E-posta Adresi
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    placeholder="ornek@email.com"
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border transition-colors focus:outline-none",
                      errors.email ? "border-red-500" : "border-[var(--border-default)] focus:border-[var(--accent-cyan)]"
                    )}
                    style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{errors.email.message}</p>}
              </div>

              <Button type="submit" loading={loading} fullWidth>
                Sıfırlama Bağlantısı Gönder
              </Button>

              <Link href="/login" className="flex items-center justify-center gap-2 text-sm hover:underline" style={{ color: "var(--text-muted)" }}>
                <ArrowLeft size={14} />
                Giriş sayfasına dön
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
