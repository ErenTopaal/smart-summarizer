"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File, Image, Music, Video, FileText, AlertCircle } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import Progress from "@/components/ui/Progress";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  fileType: string;
  storageUrl?: string;
  status: "uploading" | "ready" | "error";
  error?: string;
  progress?: number;
}

interface FileUploaderProps {
  onFileUploaded: (file: UploadedFile) => void;
  onFileRemoved?: (id: string) => void;
  accept?: Record<string, string[]>;
  maxSizeMB?: number;
  maxFiles?: number;
}

const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
  "audio/m4a": [".m4a"],
  "video/mp4": [".mp4"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  txt: FileText,
  pptx: FileText,
  mp3: Music,
  wav: Music,
  m4a: Music,
  mp4: Video,
  png: Image,
  jpg: Image,
  jpeg: Image,
};

const FILE_COLORS: Record<string, string> = {
  pdf: "text-red-400",
  docx: "text-blue-400",
  txt: "text-gray-400",
  pptx: "text-orange-400",
  mp3: "text-purple-400",
  wav: "text-purple-400",
  m4a: "text-purple-400",
  mp4: "text-pink-400",
  png: "text-green-400",
  jpg: "text-green-400",
  jpeg: "text-green-400",
};

export default function FileUploader({
  onFileUploaded,
  onFileRemoved,
  maxSizeMB = 50,
  maxFiles = 1,
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { error: toastError } = useToast();

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const tempId = Math.random().toString(36).slice(2);
    const ext = file.name.split(".").pop()?.toLowerCase() || "txt";

    const tempFile: UploadedFile = {
      id: tempId,
      name: file.name,
      size: file.size,
      type: file.type,
      fileType: ext,
      status: "uploading",
      progress: 0,
    };

    setUploadedFiles((prev) => [...prev, tempFile]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === tempId ? { ...f, status: "error", error: data.error } : f
          )
        );
        toastError("Yükleme başarısız", data.error);
        return null;
      }

      const uploaded: UploadedFile = {
        ...tempFile,
        id: data.data.id,
        status: "ready",
        storageUrl: data.data.storageUrl,
        progress: 100,
      };

      setUploadedFiles((prev) => prev.map((f) => (f.id === tempId ? uploaded : f)));
      return uploaded;
    } catch {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, status: "error", error: "Yükleme başarısız" } : f
        )
      );
      return null;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      for (const file of acceptedFiles.slice(0, maxFiles)) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          toastError(
            "Dosya çok büyük",
            `Maksimum dosya boyutu ${maxSizeMB}MB`
          );
          continue;
        }

        const uploaded = await uploadFile(file);
        if (uploaded) onFileUploaded(uploaded);
      }
    },
    [maxSizeMB, maxFiles, onFileUploaded]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
  });

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    onFileRemoved?.(id);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-[var(--radius-xl)] p-8 transition-all duration-200 cursor-pointer",
          "flex flex-col items-center justify-center gap-4 text-center",
          isDragActive && !isDragReject
            ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan-dim)]"
            : isDragReject
            ? "border-[var(--accent-rose)] bg-[rgba(244,63,94,0.05)]"
            : "border-[var(--border-default)] hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan-dim)]"
        )}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200",
            isDragActive
              ? "bg-[var(--accent-cyan)] scale-110"
              : "bg-[var(--bg-elevated)]"
          )}
        >
          <Upload
            size={28}
            className={isDragActive ? "text-[white]" : "text-[var(--text-muted)]"}
          />
        </div>

        <div>
          <p className="font-semibold text-[var(--text-primary)]">
            {isDragActive ? "Bırak!" : "Dosya sürükle veya tıkla"}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            PDF, DOCX, TXT, PPTX, MP3, MP4, PNG, JPG
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Maks {maxSizeMB}MB
          </p>
        </div>

        {/* Accepted formats */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {["PDF", "DOCX", "TXT", "MP3", "MP4", "PNG"].map((fmt) => (
            <span
              key={fmt}
              className="text-xs px-2 py-0.5 bg-[var(--bg-elevated)] rounded-full text-[var(--text-muted)] border border-[var(--border-subtle)]"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => {
            const ext = file.fileType;
            const Icon = FILE_ICONS[ext] || File;
            const color = FILE_COLORS[ext] || "text-gray-400";

            return (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-[var(--radius-md)] border transition-colors",
                  file.status === "ready"
                    ? "bg-[var(--bg-card)] border-[var(--border-subtle)]"
                    : file.status === "error"
                    ? "bg-[rgba(244,63,94,0.05)] border-[rgba(244,63,94,0.3)]"
                    : "bg-[var(--bg-card)] border-[var(--border-subtle)]"
                )}
              >
                <div className={cn("shrink-0", color)}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatBytes(file.size)}
                    </span>
                    {file.status === "uploading" && (
                      <Progress value={file.progress || 0} size="sm" className="w-20" />
                    )}
                    {file.status === "ready" && (
                      <span className="text-xs text-[var(--accent-emerald)]">Hazır</span>
                    )}
                    {file.status === "error" && (
                      <span className="flex items-center gap-1 text-xs text-[var(--accent-rose)]">
                        <AlertCircle size={10} />
                        {file.error}
                      </span>
                    )}
                  </div>
                </div>
                {file.status !== "uploading" && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-rose)] transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
