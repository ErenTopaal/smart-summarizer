import { v4 as uuidv4 } from "uuid";
import { sanitizeFilename } from "@/lib/utils";

export interface UploadResult {
  path: string;
  url: string;
  size: number;
}

const TOKEN = () => process.env.BLOB_READ_WRITE_TOKEN || "";

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: string
): Promise<UploadResult> {
  const sanitized = sanitizeFilename(originalName);
  const ext = sanitized.split(".").pop();
  const filename = `${uuidv4()}.${ext}`;
  const pathname = `uploads/${userId}/${filename}`;

  const res = await fetch(`https://api.vercel.com/v2/blob?filename=${encodeURIComponent(pathname)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${TOKEN()}`,
      "Content-Type": mimeType,
      "x-content-length": String(buffer.length),
    },
    body: buffer as unknown as BodyInit,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Blob upload failed: ${err}`);
  }

  const data = await res.json() as { url: string; pathname: string };

  return {
    path: data.pathname,
    url: data.url,
    size: buffer.length,
  };
}

export async function deleteFile(url: string): Promise<void> {
  const res = await fetch(`https://api.vercel.com/v2/blob?url=${encodeURIComponent(url)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${TOKEN()}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Blob delete failed: ${err}`);
  }
}

export async function downloadFile(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`File download failed: ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}
