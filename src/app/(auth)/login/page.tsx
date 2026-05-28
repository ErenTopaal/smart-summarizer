"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Zap, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const { error: toastError } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      toastError(result.error || "Giriş başarısız");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--accent-cyan)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--accent-violet)" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
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
            Tekrar hoş geldiniz
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8" style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                E-posta
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@email.com"
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-colors focus:outline-none",
                    "border",
                    errors.email ? "border-red-500" : "border-[var(--border-default)] focus:border-[var(--accent-cyan)]"
                  )}
                  style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Şifre
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-colors focus:outline-none",
                    "border",
                    errors.password ? "border-red-500" : "border-[var(--border-default)] focus:border-[var(--accent-cyan)]"
                  )}
                  style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm hover:underline" style={{ color: "var(--accent-cyan)" }}>
                Şifremi unuttum
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Giriş Yap
            </Button>
          </form>

          <div className="mt-6 pt-6 text-center border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Hesabınız yok mu?{" "}
              <Link href="/register" className="font-medium hover:underline" style={{ color: "var(--accent-cyan)" }}>
                Kayıt ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
