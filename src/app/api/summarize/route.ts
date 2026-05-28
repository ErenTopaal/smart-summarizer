import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyJWT } from "@/lib/auth/jwt";
import { generateAI } from "@/lib/ai/providers";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";
import { extractTextFromUrl, extractYouTubeTranscript, truncateForAI } from "@/lib/ai/extractors";
import { processSummary } from "@/lib/ai/pipeline";
import { isYouTubeUrl, extractYouTubeId } from "@/lib/utils";
import prisma from "@/lib/db";
import { summarizeSchema } from "@/lib/validators";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = summarizeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { mode, language, fileId, text, url, lockedKeywords, aiProvider } = validated.data;

    // Try to get auth (optional)
    let user: JWTPayload | null = null;
    const token = await getTokenFromRequest(req);
    if (token) {
      user = await verifyJWT(token);
    }

    // Guest mode: process without DB saving (text and URL only)
    if (!user) {
      if (fileId) {
        return NextResponse.json(
          { success: false, error: "Dosya yüklemek için giriş yapmanız gerekiyor" },
          { status: 401 }
        );
      }

      let content = "";
      if (url) {
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
        return NextResponse.json({ success: false, error: "İçerik çok kısa veya boş" }, { status: 400 });
      }

      const truncated = truncateForAI(content);
      const systemPrompt = buildSystemPrompt(mode, language);
      const userPrompt = buildUserPrompt(truncated, mode, lockedKeywords);
      const result = await generateAI(systemPrompt, userPrompt, aiProvider || "openai", "free");

      return NextResponse.json({
        success: true,
        data: {
          id: null,
          mode,
          language,
          output: result.output,
          aiProvider: result.provider,
          aiModel: result.model,
        },
      });
    }

    // Authenticated mode: full flow with DB saving
    const subscription = await prisma.subscription.findUnique({ where: { userId: user.sub } });

    if (!subscription) {
      return NextResponse.json({ success: false, error: "Abonelik bulunamadı" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const needsReset = new Date(subscription.lastResetDate) < today;
    const summariesUsedToday = needsReset ? 0 : subscription.summariesUsedToday;

    if (subscription.dailySummaryLimit !== -1 && summariesUsedToday >= subscription.dailySummaryLimit) {
      return NextResponse.json(
        { success: false, error: `Günlük ${subscription.dailySummaryLimit} özet limitinize ulaştınız`, limitReached: true },
        { status: 429 }
      );
    }

    if (subscription.tokensUsedThisMonth >= subscription.monthlyTokenLimit) {
      return NextResponse.json(
        { success: false, error: "Aylık token limitinize ulaştınız", limitReached: true },
        { status: 429 }
      );
    }

    let title = "Yeni Özet";
    if (fileId) {
      const file = await prisma.file.findUnique({ where: { id: fileId } });
      title = file?.originalName.replace(/\.[^.]+$/, "") || "Dosya Özeti";
    } else if (url) {
      title = url.slice(0, 60);
    } else if (text) {
      title = text.slice(0, 60) + (text.length > 60 ? "..." : "");
    }

    const summary = await prisma.summary.create({
      data: {
        userId: user.sub,
        fileId: fileId || null,
        title,
        mode,
        language,
        inputText: text || null,
        inputUrl: url || null,
        lockedKeywords: lockedKeywords || undefined,
        aiProvider: aiProvider || "openai",
      },
    });

    const output = await processSummary({
      userId: user.sub,
      summaryId: summary.id,
      mode,
      language,
      fileId,
      text,
      url,
      lockedKeywords,
      aiProvider: aiProvider || "openai",
      plan: subscription.plan,
    });

    const updatedSummary = await prisma.summary.findUnique({
      where: { id: summary.id },
      include: { file: true },
    });

    return NextResponse.json({ success: true, data: { ...updatedSummary, output } });
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json(
      { success: false, error: String(error) || "Özet oluşturulamadı" },
      { status: 500 }
    );
  }
}
