"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Zap, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [resending, setResending] = useState(false);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token) {
      // Redirect to the API GET endpoint which does the actual verification
      router.replace(`/api/auth/verify-email?token=${token}`);
    }
  }, [token, router]);

  const resendEmail = async () => {
    if (!email) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (result.success) {
        success("Doğrulama e-postası tekrar gönderildi");
      } else {
        toastError(result.error || "Gönderilemedi");
      }
    } catch {
      toastError("Bir hata oluştu");
    } finally {
      setResending(false);
    }
  };

  if (token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: "var(--accent-cyan)" }} />
          <p style={{ color: "var(--text-secondary)" }}>E-posta doğrulanıyor...</p>
        </div>
      </div>
    );
  }

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
        </div>

        <div className="rounded-2xl border p-8 text-center" style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(0, 212, 255, 0.1)" }}>
            <Mail size={32} style={{ color: "var(--accent-cyan)" }} />
          </div>
          <h3 className="font-display font-semibold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
            E-postanızı Kontrol Edin
          </h3>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Kayıt olduğunuz e-posta adresine bir doğrulama bağlantısı gönderdik.
          </p>
          {email && (
            <p className="text-sm font-medium mb-6" style={{ color: "var(--accent-cyan)" }}>
              {email}
            </p>
          )}
          {!email && <div className="mb-6" />}
          {email && (
            <Button onClick={resendEmail} loading={resending} fullWidth variant="outline">
              Tekrar Gönder
            </Button>
          )}

          <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <Link href="/login" className="text-sm hover:underline" style={{ color: "var(--accent-cyan)" }}>
              ← Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent-cyan)" }} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
