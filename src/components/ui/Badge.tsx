import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "premium";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants = {
    default: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
    success: "bg-[rgba(16,185,129,0.15)] text-[var(--accent-emerald)] border-[rgba(16,185,129,0.3)]",
    warning: "bg-[rgba(245,158,11,0.15)] text-[var(--accent-amber)] border-[rgba(245,158,11,0.3)]",
    danger: "bg-[rgba(244,63,94,0.15)] text-[var(--accent-rose)] border-[rgba(244,63,94,0.3)]",
    info: "bg-[var(--accent-cyan-dim)] text-[var(--accent-cyan)] border-[var(--border-strong)]",
    premium: "bg-gradient-to-r from-[rgba(0,212,255,0.15)] to-[rgba(124,58,237,0.15)] text-[var(--accent-cyan)] border-[var(--border-strong)]",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
