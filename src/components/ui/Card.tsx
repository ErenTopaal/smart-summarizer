import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  hover = false,
  glow = false,
  gradient = false,
  padding = "md",
  onClick,
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)]",
        "shadow-[var(--shadow-card)]",
        paddings[padding],
        hover && "transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-[0_8px_32px_rgba(124,58,237,0.1)] cursor-pointer",
        glow && "hover:shadow-[var(--shadow-glow-cyan)]",
        gradient && "bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-display font-semibold text-[var(--text-primary)]", className)}>
      {children}
    </h3>
  );
}
