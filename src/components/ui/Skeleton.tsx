import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("skeleton rounded-[var(--radius-md)]", className)} />
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-7 w-24 mb-1" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
