import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { sanitizeFilename } from "@/lib/utils";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "smart-summarizer-files";

export interface UploadResult {
  path: string;
  url: string;
  size: number;
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: string
): Promise<UploadResult> {
  const sanitized = sanitizeFilename(originalName);
  const ext = sanitized.split(".").pop();
  const filename = `${uuidv4()}.${ext}`;
  const path = `uploads/${userId}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return {
    path,
    url: data.publicUrl,
    size: buffer.length,
  };
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data) throw new Error("Could not generate signed URL");
  return data.signedUrl;
}

export async function downloadFile(path: string): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) throw new Error(`Storage download failed: ${error?.message}`);
  return Buffer.from(await data.arrayBuffer());
}

export { supabase };
