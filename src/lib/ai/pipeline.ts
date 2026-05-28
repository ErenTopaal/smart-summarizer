import prisma from "@/lib/db";
import { generateAI } from "./providers";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import {
  extractTextFromFile,
  extractTextFromUrl,
  extractYouTubeTranscript,
  truncateForAI,
} from "./extractors";
import { downloadFile } from "@/lib/storage/blob";
import { isYouTubeUrl, extractYouTubeId } from "@/lib/utils";
import type { SummaryMode, AIOutput, FileType } from "@/types";

export interface ProcessSummaryParams {
  userId: string;
  summaryId: string;
  mode: SummaryMode;
  language: string;
  fileId?: string;
  text?: string;
  url?: string;
  lockedKeywords?: string[];
  aiProvider?: "openai" | "anthropic" | "gemini";
  plan?: string;
}

export async function processSummary(params: ProcessSummaryParams): Promise<AIOutput> {
  const {
    userId,
    summaryId,
    mode,
    language,
    fileId,
    text,
    url,
    lockedKeywords,
    aiProvider = "openai",
    plan = "free",
  } = params;

  const startTime = Date.now();

  // Update status to processing
  await prisma.summary.update({
    where: { id: summaryId },
    data: { aiProvider },
  });

  if (fileId) {
    await prisma.file.update({
      where: { id: fileId },
      data: { status: "processing" },
    });
  }

  try {
    let content = "";

    if (fileId) {
      const file = await prisma.file.findUnique({ where: { id: fileId } });
      if (!file) throw new Error("Dosya bulunamadı");

      const buffer = await downloadFile(file.storagePath);
      content = await extractTextFromFile(buffer, file.fileType as FileType, file.mimeType);

      await prisma.file.update({
        where: { id: fileId },
        data: { status: "completed", processedAt: new Date() },
      });
    } else if (url) {
      if (isYouTubeUrl(url)) {
        const videoId = extractYouTubeId(url);
        if (!videoId) throw new Error("Geçersiz YouTube URL");
        content = await extractYouTubeTranscript(videoId);
      } else {
        content = await extractTextFromUrl(url);
      }
    } else if (text) {
      content = text;
    }

    if (!content || content.trim().length < 10) {
      throw new Error("İçerik çok kısa veya boş");
    }

    const truncated = truncateForAI(content);
    const systemPrompt = buildSystemPrompt(mode, language);
    const userPrompt = buildUserPrompt(truncated, mode, lockedKeywords);

    const result = await generateAI(systemPrompt, userPrompt, aiProvider, plan);
    const processingTimeMs = Date.now() - startTime;

    // Update summary with results
    await prisma.summary.update({
      where: { id: summaryId },
      data: {
        shortSummary: result.output.short_summary,
        detailedSummary: result.output.detailed_summary,
        bulletPoints: result.output.bullet_points,
        keywords: result.output.keywords,
        tasks: result.output.tasks as never,
        quiz: result.output.quiz as never,
        flashcards: result.output.flashcards as never,
        medicalTerms: result.output.medical_terms as never,
        importantSentences: result.output.important_sentences,
        aiProvider: result.provider,
        aiModel: result.model,
        tokensUsed: result.tokensUsed,
        processingTimeMs,
      },
    });

    // Update usage stats
    await updateUsageStats(userId, result.tokensUsed, result.provider, result.model);

    return result.output;
  } catch (error) {
    if (fileId) {
      await prisma.file.update({
        where: { id: fileId },
        data: { status: "failed", errorMessage: String(error) },
      });
    }
    throw error;
  }
}

async function updateUsageStats(
  userId: string,
  tokensUsed: number,
  provider: string,
  model: string
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const subscription = await prisma.subscription.findUnique({ where: { userId } });

  if (subscription) {
    const needsReset = new Date(subscription.lastResetDate) < today;

    await prisma.subscription.update({
      where: { userId },
      data: {
        tokensUsedThisMonth: { increment: tokensUsed },
        summariesUsedToday: needsReset ? 1 : { increment: 1 },
        lastResetDate: needsReset ? today : undefined,
      },
    });
  }

  await prisma.usageLog.create({
    data: {
      userId,
      action: "summarize",
      resourceType: "summary",
      tokensUsed,
      costUsd: calculateCost(tokensUsed, provider, model),
      metadata: { provider, model },
    },
  });
}

function calculateCost(tokens: number, provider: string, model: string): number {
  const pricing: Record<string, number> = {
    "gpt-4o": 0.000005,
    "gpt-4o-mini": 0.00000015,
    "claude-3-5-sonnet-20241022": 0.000003,
    "claude-3-5-haiku-20241022": 0.0000008,
    "gemini-1.5-pro": 0.00000125,
    "gemini-1.5-flash": 0.000000075,
  };

  return tokens * (pricing[model] || 0.000001);
}
