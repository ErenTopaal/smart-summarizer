"use client";

import { createContext, useContext, useCallback, useState, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const duration = toast.duration ?? 4000;
    setToasts((prev) => [...prev.slice(-4), { ...toast, id }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const value: ToastContextValue = {
    toast: addToast,
    success: (title, description) => addToast({ type: "success", title, description }),
    error: (title, description) => addToast({ type: "error", title, description }),
    info: (title, description) => addToast({ type: "info", title, description }),
    warning: (title, description) => addToast({ type: "warning", title, description }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle size={16} className="text-[var(--accent-emerald)]" />,
    error: <AlertCircle size={16} className="text-[var(--accent-rose)]" />,
    info: <Info size={16} className="text-[var(--accent-cyan)]" />,
    warning: <AlertTriangle size={16} className="text-[var(--accent-amber)]" />,
  };

  const borders = {
    success: "border-l-[var(--accent-emerald)]",
    error: "border-l-[var(--accent-rose)]",
    info: "border-l-[var(--accent-cyan)]",
    warning: "border-l-[var(--accent-amber)]",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto w-80 bg-[var(--bg-elevated)] border border-[var(--border-default)] border-l-4 rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-card)] animate-slide-left",
        borders[toast.type]
      )}
    >
      <div className="flex gap-3 items-start">
        <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{toast.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
