import type { SummaryMode } from "@/types";

export function buildSystemPrompt(mode: SummaryMode, language: string): string {
  const lang = language === "tr" ? "Türkçe" : "English";
  const baseInstruction = `Sen gelişmiş bir AI analiz asistanısın. Yanıtlarını YALNIZCA geçerli JSON formatında ver. Başka hiçbir metin ekleme. Çıktı dili: ${lang}.`;

  const modeInstructions: Record<SummaryMode, string> = {
    general: `Verilen içeriği genel amaçlı analiz et. Açık ve anlaşılır bir özet hazırla.`,
    lesson: `Verilen içeriği eğitim perspektifinden analiz et. Konu başlıkları, öğrenme hedefleri, quiz soruları ve flashcard'lar oluştur. Akademik terminolojiyi koru ama açıkla.`,
    business: `Verilen içeriği iş/toplantı perspektifinden analiz et. Karar noktaları, görevler, aksiyonlar, sorumlular ve deadlineları çıkar. Profesyonel ve özlü ol.`,
    medical: `Verilen içeriği tıbbi perspektiften analiz et. Tıbbi terimleri açıkla, semptomları listele, tanı ve tedavi bilgilerini ayırt et. BU BİR TAVSIYE DEĞİLDİR uyarısını ekle.`,
    legal: `Verilen içeriği hukuki perspektiften analiz et. Kritik maddeleri, yükümlülükleri, riskleri ve önemli tarihleri çıkar. BU HUKUK DANIŞMANLIĞI DEĞİLDİR uyarısını ekle.`,
    academic: `Verilen içeriği akademik perspektiften analiz et. Hipotez, metodoloji, bulgular, sonuçlar ve kaynakları ayırt et. Akademik yazım standartlarını uygula.`,
    social_media: `Verilen içeriği sosyal medya içeriğine dönüştür. Viral potansiyel taşıyan kısa özetler, hashtag'ler ve engaging içerik oluştur.`,
  };

  return `${baseInstruction}\n\n${modeInstructions[mode]}`;
}

export function buildUserPrompt(
  content: string,
  mode: SummaryMode,
  lockedKeywords?: string[]
): string {
  const keywordInstruction =
    lockedKeywords && lockedKeywords.length > 0
      ? `\n\n⚠️ KRİTİK KURAL: Aşağıdaki anahtar kelimeler özetten ASLA çıkarılmaz ve mutlaka dahil edilir: ${lockedKeywords.join(", ")}`
      : "";

  const outputSchema = `
JSON ÇIKTI ŞEMASI (tüm alanları doldur, boş array kullanma):
{
  "short_summary": "2-3 cümle kısa özet",
  "detailed_summary": "Kapsamlı detaylı özet (min 200 kelime)",
  "bullet_points": ["madde 1", "madde 2", "..."],
  "keywords": ["anahtar kelime 1", "..."],
  "tasks": [{"text": "görev", "priority": "high|medium|low", "deadline": "varsa", "assignee": "varsa"}],
  "quiz": [{"question": "soru", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "açıklama"}],
  "flashcards": [{"front": "kavram", "back": "açıklama"}],
  "medical_terms": [{"term": "terim", "definition": "tanım", "pronunciation": "okunuş"}],
  "important_sentences": ["önemli cümle 1", "..."]
}`;

  return `İçeriği analiz et ve JSON formatında çıktı ver.${keywordInstruction}

İÇERİK:
${content}

${outputSchema}`;
}

export function buildTextExtractionPrompt(fileType: string): string {
  return `Bu ${fileType} dosyasından tüm metni çıkar ve düzenle. Görsel öğeleri, başlıkları ve vurgulanmış metni [HIGHLIGHTED: metin] formatında işaretle.`;
}
