"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-md)] select-none";

    const variants = {
      primary:
        "bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[white] hover:opacity-90 hover:shadow-[var(--shadow-button)] active:scale-[0.98]",
      secondary:
        "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] active:scale-[0.98]",
      ghost:
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-[0.98]",
      danger:
        "bg-[var(--accent-rose)] text-white hover:opacity-90 active:scale-[0.98]",
      outline:
        "border border-[var(--accent-cyan)] text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan-dim)] active:scale-[0.98]",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 h-8",
      md: "text-sm px-4 py-2 h-10",
      lg: "text-base px-6 py-3 h-12",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === "sm" ? 12 : size === "lg" ? 18 : 14} />
        ) : (
          icon && iconPosition === "left" && icon
        )}
        {children}
        {!loading && icon && iconPosition === "right" && icon}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
