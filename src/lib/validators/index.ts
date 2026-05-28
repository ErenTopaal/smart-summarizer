import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı").max(100),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(100)
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
    .regex(/[0-9]/, "Şifre en az bir rakam içermeli"),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
    .regex(/[0-9]/, "Şifre en az bir rakam içermeli"),
});

export const summarizeSchema = z.object({
  mode: z.enum(["lesson", "business", "medical", "legal", "academic", "social_media", "general"]),
  language: z.string().default("tr"),
  fileId: z.string().optional(),
  text: z.string().min(10, "İçerik en az 10 karakter olmalı").max(50000).optional(),
  url: z.string().url("Geçerli bir URL girin").optional(),
  lockedKeywords: z.array(z.string()).max(10).optional(),
  aiProvider: z.enum(["openai", "anthropic", "gemini"]).optional(),
}).refine((data) => data.fileId || data.text || data.url, {
  message: "Dosya, metin veya URL gerekli",
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  username: z.string().min(3).max(50).regex(/^[a-z0-9_-]+$/, "Sadece küçük harf, rakam, _ ve - kullanılabilir").optional(),
  bio: z.string().max(500).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

export const uploadSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type SummarizeInput = z.infer<typeof summarizeSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
