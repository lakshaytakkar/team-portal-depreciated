import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

export function CardSkeleton({ className, lines = 3 }: CardSkeletonProps) {
  return (
    <div
      className={cn("rounded-lg border bg-background p-5", className)}
      data-testid="card-skeleton"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-2/3" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === lines - 1 ? "w-1/2" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}

interface StatsCardSkeletonProps {
  className?: string;
}

export function StatsCardSkeleton({ className }: StatsCardSkeletonProps) {
  return (
    <div
      className={cn("rounded-lg border bg-background p-5", className)}
      data-testid="stats-card-skeleton"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="size-10 shrink-0 rounded-lg" />
      </div>
    </div>
  );
}
