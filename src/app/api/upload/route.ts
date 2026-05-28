import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { uploadFile } from "@/lib/storage/blob";
import prisma from "@/lib/db";
import { getFileTypeFromMime } from "@/lib/utils";
import type { JWTPayload } from "@/lib/auth/jwt";
import type { FileType } from "@/types";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "audio/mpeg",
  "audio/wav",
  "audio/m4a",
  "audio/mp4",
  "video/mp4",
  "image/png",
  "image/jpeg",
];

export async function POST(req: NextRequest) {
  return requireAuth(req, async (_req: NextRequest, user: JWTPayload) => {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: user.sub },
      });

      if (!subscription) {
        return NextResponse.json(
          { success: false, error: "Abonelik bilgisi bulunamadı" },
          { status: 403 }
        );
      }

      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: "Dosya bulunamadı" }, { status: 400 });
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Bu dosya türü desteklenmiyor" },
          { status: 400 }
        );
      }

      const maxBytes = subscription.fileSizeLimitMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return NextResponse.json(
          {
            success: false,
            error: `Dosya boyutu ${subscription.fileSizeLimitMB}MB limitini aşıyor`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadFile(buffer, file.name, file.type, user.sub);

      const fileType = getFileTypeFromMime(file.type) as FileType;

      const dbFile = await prisma.file.create({
        data: {
          userId: user.sub,
          originalName: file.name,
          storagePath: uploadResult.path,
          storageUrl: uploadResult.url,
          mimeType: file.type,
          fileType,
          sizeBytes: file.size,
          status: "pending",
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: dbFile.id,
          originalName: dbFile.originalName,
          storageUrl: dbFile.storageUrl,
          fileType: dbFile.fileType,
          sizeBytes: dbFile.sizeBytes,
          status: dbFile.status,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { success: false, error: "Dosya yüklenemedi" },
        { status: 500 }
      );
    }
  });
}
