export type UserRole = "free_user" | "pro_user" | "premium_user" | "admin";
export type SubscriptionPlan = "free" | "pro" | "premium";
export type SubscriptionStatus = "active" | "inactive" | "canceled" | "past_due" | "trialing";
export type SummaryMode = "lesson" | "business" | "medical" | "legal" | "academic" | "social_media" | "general";
export type FileType = "pdf" | "docx" | "txt" | "pptx" | "mp3" | "wav" | "m4a" | "mp4" | "png" | "jpg" | "jpeg" | "url" | "youtube";
export type FileStatus = "pending" | "processing" | "completed" | "failed";

export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  image: string | null;
  role: UserRole;
  emailVerified: Date | null;
  isActive: boolean;
  isBanned: boolean;
  bio: string | null;
  language: string;
  timezone: string;
  createdAt: Date;
  subscription?: Subscription | null;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  dailySummaryLimit: number;
  fileSizeLimitMB: number;
  monthlyTokenLimit: number;
  tokensUsedThisMonth: number;
  summariesUsedToday: number;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export interface Summary {
  id: string;
  userId: string;
  fileId: string | null;
  title: string;
  mode: SummaryMode;
  inputText: string | null;
  inputUrl: string | null;
  shortSummary: string | null;
  detailedSummary: string | null;
  bulletPoints: string[] | null;
  keywords: string[] | null;
  tasks: Task[] | null;
  quiz: QuizQuestion[] | null;
  flashcards: Flashcard[] | null;
  medicalTerms: MedicalTerm[] | null;
  importantSentences: string[] | null;
  lockedKeywords: string[] | null;
  language: string;
  aiProvider: string | null;
  aiModel: string | null;
  tokensUsed: number;
  processingTimeMs: number | null;
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  file?: UploadedFile | null;
}

export interface UploadedFile {
  id: string;
  userId: string;
  originalName: string;
  storagePath: string;
  storageUrl: string | null;
  mimeType: string;
  fileType: FileType;
  sizeBytes: number;
  status: FileStatus;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  processedAt: Date | null;
  createdAt: Date;
}

export interface Task {
  text: string;
  priority: "high" | "medium" | "low";
  deadline?: string;
  assignee?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface MedicalTerm {
  term: string;
  definition: string;
  pronunciation?: string;
}

export interface AIOutput {
  short_summary: string;
  detailed_summary: string;
  bullet_points: string[];
  keywords: string[];
  tasks: Task[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  medical_terms: MedicalTerm[];
  important_sentences: string[];
}

export interface SummarizeRequest {
  mode: SummaryMode;
  language: string;
  fileId?: string;
  text?: string;
  url?: string;
  lockedKeywords?: string[];
  aiProvider?: "openai" | "anthropic" | "gemini";
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UsageStats {
  summariesToday: number;
  summariesThisMonth: number;
  tokensUsedThisMonth: number;
  totalSummaries: number;
  favoriteCount: number;
  filesUploaded: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  activeUsersToday: number;
  newUsersThisWeek: number;
  totalSummaries: number;
  summariesToday: number;
  totalTokensUsed: number;
  totalRevenue: number;
  activeSubscriptions: number;
  planBreakdown: { plan: string; count: number }[];
  modeBreakdown: { mode: string; count: number }[];
  dailyStats: { date: string; summaries: number; users: number; tokens: number }[];
}

export interface PlanLimits {
  free: PlanConfig;
  pro: PlanConfig;
  premium: PlanConfig;
}

export interface PlanConfig {
  dailySummaryLimit: number;
  fileSizeLimitMB: number;
  monthlyTokenLimit: number;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
}

export const PLAN_LIMITS: PlanLimits = {
  free: {
    dailySummaryLimit: 3,
    fileSizeLimitMB: 5,
    monthlyTokenLimit: 50000,
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "3 özet/gün",
      "5MB dosya limiti",
      "Temel modlar",
      "PDF & TXT desteği",
      "7 gün geçmiş",
    ],
  },
  pro: {
    dailySummaryLimit: 30,
    fileSizeLimitMB: 50,
    monthlyTokenLimit: 500000,
    priceMonthly: 12,
    priceYearly: 99,
    features: [
      "30 özet/gün",
      "50MB dosya limiti",
      "Tüm modlar",
      "Tüm dosya türleri",
      "Sınırsız geçmiş",
      "Quiz & Flashcard",
      "Export (PDF, DOCX)",
      "Öncelikli AI",
    ],
  },
  premium: {
    dailySummaryLimit: -1,
    fileSizeLimitMB: 500,
    monthlyTokenLimit: 5000000,
    priceMonthly: 29,
    priceYearly: 249,
    features: [
      "Sınırsız özet",
      "500MB dosya limiti",
      "Tüm özellikler",
      "GPT-4o / Claude 3.5",
      "Video & Ses işleme",
      "API erişimi",
      "Özel AI ayarları",
      "Öncelikli destek",
    ],
  },
};

export const MODE_CONFIG: Record<SummaryMode, { label: string; icon: string; description: string; color: string }> = {
  general: { label: "Genel", icon: "Sparkles", description: "Genel amaçlı özet", color: "#00d4ff" },
  lesson: { label: "Ders Modu", icon: "GraduationCap", description: "Quiz, flashcard ve akademik analiz", color: "#7c3aed" },
  business: { label: "İş Modu", icon: "Briefcase", description: "Toplantı özeti, görevler, aksiyonlar", color: "#f59e0b" },
  medical: { label: "Tıbbi Mod", icon: "Stethoscope", description: "Tıbbi terminoloji ve semptom analizi", color: "#10b981" },
  legal: { label: "Hukuk Modu", icon: "Scale", description: "Sözleşme analizi ve risk tespiti", color: "#f43f5e" },
  academic: { label: "Akademik Mod", icon: "BookOpen", description: "Akademik özet ve atıf analizi", color: "#8b5cf6" },
  social_media: { label: "Sosyal Medya", icon: "Share2", description: "Viral içerik ve sosyal post", color: "#ec4899" },
};
