"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-secondary)] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-[var(--bg-card)] border rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm transition-all duration-200",
              "focus:outline-none focus:border-[var(--accent-cyan)] focus:ring-1 focus:ring-[var(--accent-cyan)]",
              error
                ? "border-[var(--accent-rose)] focus:border-[var(--accent-rose)] focus:ring-[var(--accent-rose)]"
                : "border-[var(--border-default)] hover:border-[var(--border-strong)]",
              leftIcon ? "pl-10 pr-4 py-2.5" : rightIcon ? "pl-4 pr-10 py-2.5" : "px-4 py-2.5",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[var(--accent-rose)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
