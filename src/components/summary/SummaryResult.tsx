"use client";

import { useState } from "react";
import {
  FileText,
  List,
  Tag,
  CheckSquare,
  HelpCircle,
  Layers,
  Stethoscope,
  Star,
  Copy,
  Download,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, formatDateRelative } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import type { Summary, QuizQuestion, Flashcard, Task } from "@/types";
import { MODE_CONFIG } from "@/types";

interface SummaryResultProps {
  summary: Summary;
  onFavoriteToggle?: (id: string, favorited: boolean) => void;
}

type Tab = "summary" | "bullets" | "keywords" | "tasks" | "quiz" | "flashcards" | "medical";

export default function SummaryResult({ summary, onFavoriteToggle }: SummaryResultProps) {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [expandedDetail, setExpandedDetail] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const { success, error } = useToast();

  const modeConfig = MODE_CONFIG[summary.mode];
  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number; hidden?: boolean }[] = [
    { id: "summary", label: "Özet", icon: FileText },
    { id: "bullets", label: "Maddeler", icon: List, count: (summary.bulletPoints as string[])?.length },
    { id: "keywords", label: "Anahtar", icon: Tag, count: (summary.keywords as string[])?.length },
    { id: "tasks", label: "Görevler", icon: CheckSquare, count: (summary.tasks as Task[])?.length, hidden: summary.mode !== "business" },
    { id: "quiz", label: "Quiz", icon: HelpCircle, count: (summary.quiz as QuizQuestion[])?.length, hidden: summary.mode === "general" },
    { id: "flashcards", label: "Kartlar", icon: Layers, count: (summary.flashcards as Flashcard[])?.length, hidden: summary.mode !== "lesson" && summary.mode !== "academic" },
    { id: "medical", label: "Terimler", icon: Stethoscope, count: (summary.medicalTerms as object[])?.length, hidden: summary.mode !== "medical" },
  ];

  const visibleTabs = tabs.filter((t) => !t.hidden && (t.count === undefined || t.count > 0 || t.id === "summary"));

  const handleCopy = async () => {
    const text = [
      summary.shortSummary,
      "\n\n",
      summary.detailedSummary,
      "\n\nAnahtar Kelimeler: ",
      (summary.keywords as string[])?.join(", "),
    ].join("");
    await navigator.clipboard.writeText(text);
    success("Kopyalandı!");
  };

  const handleFavorite = async () => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId: summary.id }),
      });
      const data = await res.json();
      if (data.success) {
        onFavoriteToggle?.(summary.id, data.favorited);
        success(data.favorited ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
      }
    } catch {
      error("İşlem başarısız");
    }
  };

  const quizQuestions = summary.quiz as QuizQuestion[] || [];
  const flashcards = summary.flashcards as Flashcard[] || [];
  const tasks = summary.tasks as Task[] || [];
  const bulletPoints = summary.bulletPoints as string[] || [];
  const keywords = summary.keywords as string[] || [];
  const importantSentences = summary.importantSentences as string[] || [];

  const quizScore = quizSubmitted
    ? quizQuestions.filter((q, i) => quizAnswers[i] === q.correctIndex).length
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[white]"
                style={{ background: modeConfig.color }}
              >
                <FileText size={12} />
              </div>
              <Badge variant="info" size="sm">{modeConfig.label}</Badge>
              <span className="text-xs text-[var(--text-muted)]">
                {formatDateRelative(summary.createdAt)}
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-[var(--text-primary)] truncate">
              {summary.title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              {summary.shortSummary}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              icon={<Heart size={14} className={summary.isFavorite ? "fill-[var(--accent-rose)] text-[var(--accent-rose)]" : ""} />}
              onClick={handleFavorite}
            >
            </Button>
            <Button variant="ghost" size="sm" icon={<Copy size={14} />} onClick={handleCopy} />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <Stat label="Kelime" value={summary.detailedSummary?.split(" ").length || 0} />
          <Stat label="Token" value={summary.tokensUsed || 0} />
          <Stat label="Süre" value={summary.processingTimeMs ? `${(summary.processingTimeMs / 1000).toFixed(1)}s` : "-"} />
          <Stat label="Model" value={summary.aiModel?.split("-")[0] || "-"} />
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-sm whitespace-nowrap transition-all duration-150 shrink-0",
              activeTab === tab.id
                ? "bg-[var(--accent-cyan-dim)] text-[var(--accent-cyan)] border border-[var(--border-strong)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-xs bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Card>
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-semibold text-[var(--text-primary)] mb-3">Detaylı Özet</h3>
              <div
                className={cn(
                  "text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap overflow-hidden transition-all duration-300",
                  !expandedDetail && "max-h-48"
                )}
              >
                {summary.detailedSummary}
              </div>
              {(summary.detailedSummary?.length || 0) > 400 && (
                <button
                  onClick={() => setExpandedDetail(!expandedDetail)}
                  className="mt-2 flex items-center gap-1 text-sm text-[var(--accent-cyan)] hover:underline"
                >
                  {expandedDetail ? <><ChevronUp size={14} />Kısalt</> : <><ChevronDown size={14} />Devamını oku</>}
                </button>
              )}
            </div>

            {importantSentences.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-[var(--text-muted)] mb-2 flex items-center gap-2">
                  <Star size={14} className="text-[var(--accent-amber)]" />
                  Önemli Cümleler
                </h4>
                <div className="space-y-2">
                  {importantSentences.map((s, i) => (
                    <div
                      key={i}
                      className="text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-[var(--accent-cyan)] py-0.5"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "bullets" && (
          <div className="space-y-2">
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-3">Madde Madde Özet</h3>
            {bulletPoints.map((point, i) => (
              <div key={i} className="flex gap-3 items-start p-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-elevated)] transition-colors">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-violet)] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[white] text-[10px] font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "keywords" && (
          <div>
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-3">Anahtar Kelimeler</h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-sm text-[var(--text-secondary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors cursor-default"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-2">
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-3">Görevler ve Aksiyonlar</h3>
            {tasks.map((task, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  task.priority === "high" ? "bg-[var(--accent-rose)]" : task.priority === "medium" ? "bg-[var(--accent-amber)]" : "bg-[var(--accent-emerald)]"
                )} />
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-primary)]">{task.text}</p>
                  <div className="flex gap-3 mt-1">
                    {task.deadline && <span className="text-xs text-[var(--text-muted)]">📅 {task.deadline}</span>}
                    {task.assignee && <span className="text-xs text-[var(--text-muted)]">👤 {task.assignee}</span>}
                  </div>
                </div>
                <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "success"} size="sm">
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-[var(--text-primary)]">Quiz</h3>
              {quizSubmitted && (
                <Badge variant={quizScore / quizQuestions.length >= 0.7 ? "success" : "warning"}>
                  {quizScore}/{quizQuestions.length} Doğru
                </Badge>
              )}
            </div>
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="space-y-3">
                <p className="font-medium text-sm text-[var(--text-primary)]">
                  <span className="text-[var(--accent-cyan)] mr-2">{qi + 1}.</span>
                  {q.question}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))}
                      className={cn(
                        "text-left text-sm p-3 rounded-[var(--radius-md)] border transition-all",
                        !quizSubmitted && quizAnswers[qi] === oi
                          ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan-dim)] text-[var(--accent-cyan)]"
                          : quizSubmitted && oi === q.correctIndex
                          ? "border-[var(--accent-emerald)] bg-[rgba(16,185,129,0.1)] text-[var(--accent-emerald)]"
                          : quizSubmitted && quizAnswers[qi] === oi && oi !== q.correctIndex
                          ? "border-[var(--accent-rose)] bg-[rgba(244,63,94,0.1)] text-[var(--accent-rose)]"
                          : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)]"
                      )}
                    >
                      <span className="font-medium mr-2">
                        {["A", "B", "C", "D"][oi]}.
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
                {quizSubmitted && q.explanation && (
                  <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] p-2 rounded-[var(--radius-sm)]">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}
            {!quizSubmitted && quizQuestions.length > 0 && (
              <Button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                fullWidth
              >
                Cevapları Gönder
              </Button>
            )}
          </div>
        )}

        {activeTab === "flashcards" && flashcards.length > 0 && (
          <div className="text-center">
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4">
              Flashcard {currentFlashcard + 1}/{flashcards.length}
            </h3>
            <div
              className="min-h-40 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 cursor-pointer flex items-center justify-center transition-all duration-300 hover:border-[var(--accent-cyan)]"
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
            >
              <div className="text-center">
                <p className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-wider">
                  {flashcardFlipped ? "Arka" : "Ön"}
                </p>
                <p className="text-lg text-[var(--text-primary)] font-semibold">
                  {flashcardFlipped
                    ? flashcards[currentFlashcard].back
                    : flashcards[currentFlashcard].front}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-4">Çevirmek için tıkla</p>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setCurrentFlashcard(Math.max(0, currentFlashcard - 1)); setFlashcardFlipped(false); }}
                disabled={currentFlashcard === 0}
              >
                ← Önceki
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setCurrentFlashcard(Math.min(flashcards.length - 1, currentFlashcard + 1)); setFlashcardFlipped(false); }}
                disabled={currentFlashcard === flashcards.length - 1}
              >
                Sonraki →
              </Button>
            </div>
          </div>
        )}

        {activeTab === "medical" && (
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-3">Tıbbi Terimler</h3>
            {(summary.medicalTerms as { term: string; definition: string; pronunciation?: string }[] || []).map((term, i) => (
              <div key={i} className="p-3 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-[var(--accent-emerald)]">{term.term}</span>
                  {term.pronunciation && (
                    <span className="text-xs text-[var(--text-muted)] italic">/{term.pronunciation}/</span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{term.definition}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
