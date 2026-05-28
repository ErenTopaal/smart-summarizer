"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Zap, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { error: toastError, success } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    const result = await registerUser(data.name, data.email, data.password);
    if (result.success) {
      success("Hesap oluşturuldu! E-postanızı doğrulayın.");
      router.push("/dashboard");
    } else {
      toastError(result.error || "Kayıt başarısız");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--accent-violet)" }} />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--accent-cyan)" }} />
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
            Hesap oluştur
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Ücretsiz başla, istediğinde yükselt
          </p>
        </div>

        <div className="rounded-2xl border p-8" style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          {/* Free plan features */}
          <div className="mb-6 p-3 rounded-lg flex items-center gap-3" style={{ background: "var(--accent-cyan-dim)", border: "1px solid var(--border-strong)" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--accent-cyan)" }}>
              <span className="text-[10px] font-bold" style={{ color: "white" }}>✓</span>
            </div>
            <p className="text-sm" style={{ color: "var(--accent-cyan)" }}>
              Ücretsiz plan: Günde 3 özet, 5MB dosya, 6 mod
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: "name", label: "Ad Soyad", type: "text", placeholder: "Ad Soyad", icon: User },
              { name: "email", label: "E-posta", type: "email", placeholder: "ornek@email.com", icon: Mail },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-colors focus:outline-none border",
                      errors[field.name as keyof RegisterInput] ? "border-red-500" : "border-[var(--border-default)] focus:border-[var(--accent-cyan)]"
                    )}
                    style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
                    {...register(field.name as keyof RegisterInput)}
                  />
                </div>
                {errors[field.name as keyof RegisterInput] && (
                  <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>
                    {errors[field.name as keyof RegisterInput]?.message}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Şifre
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="En az 8 karakter, büyük harf ve rakam"
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-colors focus:outline-none border",
                    errors.password ? "border-red-500" : "border-[var(--border-default)] focus:border-[var(--accent-cyan)]"
                  )}
                  style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
              Ücretsiz Hesap Oluştur
            </Button>
          </form>

          <div className="mt-6 pt-6 text-center border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--accent-cyan)" }}>
                Giriş yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
