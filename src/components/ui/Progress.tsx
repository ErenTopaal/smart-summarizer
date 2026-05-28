"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md";
  color?: "cyan" | "violet" | "emerald" | "amber" | "rose";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export default function Progress({
  value,
  max = 100,
  size = "md",
  color = "cyan",
  showLabel = false,
  label,
  className,
}: ProgressProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    cyan: "from-[var(--accent-cyan)] to-[var(--accent-violet)]",
    violet: "from-[var(--accent-violet)] to-[#a855f7]",
    emerald: "from-[var(--accent-emerald)] to-[#34d399]",
    amber: "from-[var(--accent-amber)] to-[#fbbf24]",
    rose: "from-[var(--accent-rose)] to-[#fb7185]",
  };

  const heights = { sm: "h-1", md: "h-2" };

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-[var(--text-muted)]">{label}</span>
          <span className="text-xs font-medium text-[var(--text-secondary)]">{Math.round(percent)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out",
            colors[color]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
