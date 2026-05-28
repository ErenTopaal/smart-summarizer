import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  message: string;
} {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  if (!checks.length) return { valid: false, score, message: "Şifre en az 8 karakter olmalı" };
  if (score < 3) return { valid: false, score, message: "Şifre çok zayıf" };
  if (score === 3) return { valid: true, score, message: "Orta güçte şifre" };
  if (score === 4) return { valid: true, score, message: "Güçlü şifre" };
  return { valid: true, score, message: "Çok güçlü şifre" };
}
