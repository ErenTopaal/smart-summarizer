import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIOutput } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AIGenerateResult {
  output: AIOutput;
  tokensUsed: number;
  provider: string;
  model: string;
}

const EMPTY_OUTPUT: AIOutput = {
  short_summary: "",
  detailed_summary: "",
  bullet_points: [],
  keywords: [],
  tasks: [],
  quiz: [],
  flashcards: [],
  medical_terms: [],
  important_sentences: [],
};

function parseAIResponse(text: string): AIOutput {
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1] : text;

  try {
    const parsed = JSON.parse(jsonStr.trim());
    return {
      short_summary: parsed.short_summary || "",
      detailed_summary: parsed.detailed_summary || "",
      bullet_points: Array.isArray(parsed.bullet_points) ? parsed.bullet_points : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
      flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
      medical_terms: Array.isArray(parsed.medical_terms) ? parsed.medical_terms : [],
      important_sentences: Array.isArray(parsed.important_sentences) ? parsed.important_sentences : [],
    };
  } catch {
    return { ...EMPTY_OUTPUT, short_summary: text.slice(0, 500) };
  }
}

export async function generateWithOpenAI(
  systemPrompt: string,
  userPrompt: string,
  model = "gpt-4o-mini"
): Promise<AIGenerateResult> {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
    max_tokens: 4096,
  });

  const text = response.choices[0]?.message?.content || "";
  const tokensUsed = response.usage?.total_tokens || 0;

  return {
    output: parseAIResponse(text),
    tokensUsed,
    provider: "openai",
    model,
  };
}

export async function generateWithAnthropic(
  systemPrompt: string,
  userPrompt: string,
  model = "claude-3-5-haiku-20241022"
): Promise<AIGenerateResult> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  return {
    output: parseAIResponse(text),
    tokensUsed,
    provider: "anthropic",
    model,
  };
}

export async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  model = "gemini-1.5-flash"
): Promise<AIGenerateResult> {
  const genModel = gemini.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
  });

  const result = await genModel.generateContent(userPrompt);
  const text = result.response.text();
  const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;

  return {
    output: parseAIResponse(text),
    tokensUsed,
    provider: "gemini",
    model,
  };
}

export async function generateAI(
  systemPrompt: string,
  userPrompt: string,
  preferredProvider: "openai" | "anthropic" | "gemini" = "openai",
  plan: string = "free"
): Promise<AIGenerateResult> {
  const modelMap = {
    openai: plan === "premium" ? "gpt-4o" : "gpt-4o-mini",
    anthropic: plan === "premium" ? "claude-3-5-sonnet-20241022" : "claude-3-5-haiku-20241022",
    gemini: plan === "premium" ? "gemini-1.5-pro" : "gemini-1.5-flash",
  };

  const providers = [preferredProvider, "openai", "anthropic", "gemini"].filter(
    (v, i, a) => a.indexOf(v) === i
  ) as ("openai" | "anthropic" | "gemini")[];

  for (const provider of providers) {
    try {
      switch (provider) {
        case "openai":
          if (process.env.OPENAI_API_KEY) {
            return await generateWithOpenAI(systemPrompt, userPrompt, modelMap.openai);
          }
          break;
        case "anthropic":
          if (process.env.ANTHROPIC_API_KEY) {
            return await generateWithAnthropic(systemPrompt, userPrompt, modelMap.anthropic);
          }
          break;
        case "gemini":
          if (process.env.GEMINI_API_KEY) {
            return await generateWithGemini(systemPrompt, userPrompt, modelMap.gemini);
          }
          break;
      }
    } catch (error) {
      console.error(`AI provider ${provider} failed:`, error);
      continue;
    }
  }

  throw new Error("Tüm AI sağlayıcıları başarısız oldu");
}
