"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Stethoscope,
  Scale,
  BookOpen,
  Share2,
  Link as LinkIcon,
  Type,
  Upload,
  Lock,
  X,
  Play,
  Globe,
} from "lucide-react";
import { cn, isYouTubeUrl, isValidUrl } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Progress from "@/components/ui/Progress";
import FileUploader from "@/components/upload/FileUploader";
import SummaryResult from "@/components/summary/SummaryResult";
import { useToast } from "@/components/ui/Toast";
import type { SummaryMode, Summary } from "@/types";
import { MODE_CONFIG, PLAN_LIMITS } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const MODES: { id: SummaryMode; icon: React.ElementType }[] = [
  { id: "general", icon: Sparkles },
  { id: "lesson", icon: GraduationCap },
  { id: "business", icon: Briefcase },
  { id: "medical", icon: Stethoscope },
  { id: "legal", icon: Scale },
  { id: "academic", icon: BookOpen },
  { id: "social_media", icon: Share2 },
];

type InputType = "file" | "text" | "url";

function SummarizePage() {
  const searchParams = useSearchParams();
  const defaultMode = (searchParams.get("mode") as SummaryMode) || "general";
  const { user } = useAuth();
  const { error: toastError, success } = useToast();

  const [mode, setMode] = useState<SummaryMode>(defaultMode);
  const [inputType, setInputType] = useState<InputType>("file");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [lockedKeywords, setLockedKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [language, setLanguage] = useState("tr");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Summary | null>(null);
  const [processingStep, setProcessingStep] = useState("");

  const plan = user?.subscription?.plan || "free";
  const planConfig = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

  const canAddKeyword = lockedKeywords.length < 10;

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !lockedKeywords.includes(kw) && canAddKeyword) {
      setLockedKeywords((prev) => [...prev, kw]);
      setKeywordInput("");
    }
  };

  const handleFileUploaded = useCallback((file: { id: string }) => {
    setUploadedFileId(file.id);
  }, []);

  const handleFileRemoved = useCallback(() => {
    setUploadedFileId(null);
  }, []);

  const canSubmit = () => {
    if (inputType === "file") return !!uploadedFileId;
    if (inputType === "text") return text.trim().length >= 10;
    if (inputType === "url") return isValidUrl(url) || isYouTubeUrl(url);
    return false;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      toastError("İçerik gerekli", "Lütfen dosya, metin veya URL girin");
      return;
    }

    setProcessing(true);
    setResult(null);

    const steps = [
      "İçerik analiz ediliyor...",
      "AI modeli hazırlanıyor...",
      "Özet oluşturuluyor...",
      "Sonuçlar işleniyor...",
    ];

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      if (stepIdx < steps.length - 1) {
        setProcessingStep(steps[++stepIdx]);
      }
    }, 2000);

    setProcessingStep(steps[0]);

    try {
      const body: Record<string, unknown> = {
        mode,
        language,
        lockedKeywords: lockedKeywords.length > 0 ? lockedKeywords : undefined,
      };

      if (inputType === "file" && uploadedFileId) body.fileId = uploadedFileId;
      if (inputType === "text" && text) body.text = text;
      if (inputType === "url" && url) body.url = url;

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.limitReached) {
          toastError("Limit aşıldı", data.error);
        } else {
          toastError("Özet oluşturulamadı", data.error);
        }
        return;
      }

      setResult(data.data);
      success("Özet hazır!");
    } catch {
      toastError("Bağlantı hatası", "Lütfen tekrar deneyin");
    } finally {
      clearInterval(stepInterval);
      setProcessing(false);
      setProcessingStep("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl" style={{ color: "var(--text-primary)" }}>
          AI Özet Oluştur
        </h1>
        <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Dosya, metin veya URL yükle. AI analiz etsin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Mode selector */}
          <Card>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              ANALIZ MODU
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MODES.map((m) => {
                const config = MODE_CONFIG[m.id];
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all",
                      active
                        ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan-dim)] text-[var(--accent-cyan)]"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <m.icon size={18} />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Input type selector */}
          <Card>
            <div className="flex border rounded-lg overflow-hidden mb-5" style={{ borderColor: "var(--border-default)" }}>
              {[
                { id: "file", label: "Dosya", icon: Upload },
                { id: "text", label: "Metin", icon: Type },
                { id: "url", label: "URL / YouTube", icon: Globe },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setInputType(t.id as InputType)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                    inputType === t.id
                      ? "bg-[var(--accent-cyan-dim)] text-[var(--accent-cyan)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  )}
                >
                  <t.icon size={15} />
                  {t.label}
                </button>
              ))}
            </div>

            {inputType === "file" && (
              user ? (
                <FileUploader
                  onFileUploaded={handleFileUploaded}
                  onFileRemoved={handleFileRemoved}
                  maxSizeMB={planConfig?.fileSizeLimitMB || 5}
                />
              ) : (
                <div className="text-center py-10 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--border-default)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--accent-cyan-dim)" }}>
                    <Upload size={22} style={{ color: "var(--accent-cyan)" }} />
                  </div>
                  <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>Dosya yüklemek için giriş yapın</p>
                  <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Metin ve URL özeti ücretsiz ve giriş gerektirmez</p>
                  <a href="/register" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: "var(--gradient-brand)" }}>
                    Ücretsiz Kayıt Ol
                  </a>
                </div>
              )
            )}

            {inputType === "text" && (
              <div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Özetlemek istediğiniz metni buraya yapıştırın..."
                  rows={10}
                  className="w-full rounded-xl text-sm p-4 resize-none focus:outline-none transition-colors border"
                  style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                />
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {text.length} / 50,000 karakter
                </p>
              </div>
            )}

            {inputType === "url" && (
              <div className="space-y-3">
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://... veya YouTube URL"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm border focus:outline-none transition-colors"
                    style={{
                      background: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["Web Makalesi", "YouTube Video", "Haber", "Blog"].map((ex) => (
                    <span key={ex} className="text-xs px-2 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            loading={processing}
            disabled={!canSubmit()}
            fullWidth
            size="lg"
            icon={<Play size={16} />}
          >
            {processing ? processingStep || "İşleniyor..." : "Özetle"}
          </Button>
        </div>

        {/* Right panel - Options */}
        <div className="space-y-4">
          {/* Language */}
          <Card>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              DİL
            </h3>
            <div className="flex gap-2">
              {[{ value: "tr", label: "Türkçe 🇹🇷" }, { value: "en", label: "English 🇬🇧" }].map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLanguage(l.value)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors",
                    language === l.value
                      ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan-dim)] text-[var(--accent-cyan)]"
                      : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)]"
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Locked keywords */}
          <Card>
            <h3 className="font-semibold text-sm mb-1 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <Lock size={12} />
              KİLİTLİ KELİMELER
            </h3>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Bu kelimeler özetten asla çıkarılmaz
            </p>
            <div className="flex gap-2 mb-3">
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                placeholder="Kelime ekle..."
                className="flex-1 text-xs px-3 py-2 rounded-lg border focus:outline-none transition-colors"
                style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", borderColor: "var(--border-subtle)" }}
                disabled={!canAddKeyword}
              />
              <Button size="sm" onClick={addKeyword} disabled={!keywordInput.trim() || !canAddKeyword}>
                +
              </Button>
            </div>
            {lockedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {lockedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                    style={{ background: "var(--accent-cyan-dim)", color: "var(--accent-cyan)", border: "1px solid var(--border-strong)" }}
                  >
                    <Lock size={8} />
                    {kw}
                    <button onClick={() => setLockedKeywords((p) => p.filter((k) => k !== kw))}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Mode info */}
          <Card gradient>
            <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>
              {MODE_CONFIG[mode].label}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {MODE_CONFIG[mode].description}
            </p>
          </Card>

          {/* Plan usage */}
          <Card>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Günlük kullanım</span>
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {user?.subscription?.summariesUsedToday || 0} / {user?.subscription?.dailySummaryLimit === -1 ? "∞" : user?.subscription?.dailySummaryLimit || 3}
              </span>
            </div>
            <Progress
              value={user?.subscription?.dailySummaryLimit === -1 ? 0 : ((user?.subscription?.summariesUsedToday || 0) / (user?.subscription?.dailySummaryLimit || 3)) * 100}
              size="sm"
              color="cyan"
            />
          </Card>
        </div>
      </div>

      {/* Processing animation */}
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(2,8,16,0.85)", backdropFilter: "blur(8px)" }}>
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 opacity-30 animate-pulse-glow" style={{ borderColor: "var(--accent-cyan)" }} />
              <div className="absolute inset-2 rounded-full border-2 processing-ring" style={{ borderColor: "var(--accent-cyan)" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={28} style={{ color: "var(--accent-cyan)" }} className="animate-pulse" />
              </div>
            </div>
            <div>
              <p className="font-display font-bold text-xl mb-1" style={{ color: "var(--text-primary)" }}>
                AI İşliyor
              </p>
              <p className="text-sm animate-pulse" style={{ color: "var(--accent-cyan)" }}>
                {processingStep}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !processing && (
        <div className="mt-6">
          <SummaryResult summary={result} />
        </div>
      )}
    </div>
  );
}

export default function SummarizePageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20" style={{ color: "var(--text-muted)" }}>Yükleniyor...</div>}>
      <SummarizePage />
    </Suspense>
  );
}
