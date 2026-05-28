import type { FileType } from "@/types";

export async function extractTextFromFile(
  buffer: Buffer,
  fileType: FileType,
  mimeType: string
): Promise<string> {
  switch (fileType) {
    case "pdf":
      return extractFromPDF(buffer);
    case "docx":
      return extractFromDocx(buffer);
    case "txt":
      return buffer.toString("utf-8");
    case "pptx":
      return extractFromPPTX(buffer);
    case "png":
    case "jpg":
    case "jpeg":
      return extractFromImage(buffer);
    default:
      return buffer.toString("utf-8");
  }
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("PDF dosyası okunamadı");
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error("DOCX dosyası okunamadı");
  }
}

async function extractFromPPTX(buffer: Buffer): Promise<string> {
  try {
    // PPTX is a ZIP file containing XML
    const JSZip = await import("jszip").catch(() => null);
    if (!JSZip) return "PPTX içeriği çıkarılamadı";

    const zip = await JSZip.default.loadAsync(buffer);
    const slideFiles = Object.keys(zip.files).filter((name) =>
      name.match(/ppt\/slides\/slide\d+\.xml/)
    );

    const texts: string[] = [];
    for (const slideFile of slideFiles) {
      const content = await zip.files[slideFile].async("string");
      const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g) || [];
      texts.push(textMatches.map((m) => m.replace(/<[^>]+>/g, "")).join(" "));
    }

    return texts.join("\n\n");
  } catch (error) {
    console.error("PPTX extraction error:", error);
    return buffer.toString("utf-8").replace(/<[^>]+>/g, " ");
  }
}

async function extractFromImage(buffer: Buffer): Promise<string> {
  try {
    // Use Sharp to preprocess, then try OCR
    const sharp = await import("sharp");
    const processedBuffer = await sharp
      .default(buffer)
      .resize({ width: 2000, withoutEnlargement: true })
      .greyscale()
      .normalize()
      .png()
      .toBuffer();

    // Return a placeholder that will be processed by vision AI
    return `[IMAGE_CONTENT:${processedBuffer.toString("base64").slice(0, 100)}...]`;
  } catch {
    return "[IMAGE: OCR işlemi başarısız]";
  }
}

export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SmartSummarizer/1.0)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    return cleanHtml(html);
  } catch (error) {
    throw new Error(`URL içeriği alınamadı: ${error}`);
  }
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15000);
}

export async function extractYouTubeTranscript(videoId: string): Promise<string> {
  try {
    // Use YouTube transcript API (no API key needed for public videos)
    const response = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await response.text();

    // Extract captions track URL from HTML
    const captionMatch = html.match(/"captionTracks":\[.*?"baseUrl":"([^"]+)"/);
    if (!captionMatch) {
      return `[YouTube Video ID: ${videoId}] - Altyazı bulunamadı. Video başlığı veya açıklaması üzerinden özet oluşturuluyor.`;
    }

    const captionUrl = captionMatch[1].replace(/\\u0026/g, "&");
    const captionResponse = await fetch(captionUrl);
    const captionXml = await captionResponse.text();

    const texts = captionXml.match(/<text[^>]*>([^<]*)<\/text>/g) || [];
    return texts
      .map((t) => t.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean)
      .join(" ")
      .slice(0, 15000);
  } catch {
    return `[YouTube Video ID: ${videoId}] - Transkript alınamadı`;
  }
}

export function truncateForAI(text: string, maxTokens = 8000): string {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;

  // Smart truncation: keep beginning and end
  const halfChars = maxChars / 2;
  return (
    text.slice(0, halfChars) +
    "\n\n[... içerik kısaltıldı ...]\n\n" +
    text.slice(-halfChars / 2)
  );
}
