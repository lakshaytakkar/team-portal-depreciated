import { CardSkeleton } from "@/components/ui/card-skeleton";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  cards?: number;
  columns?: number;
  className?: string;
}

export function PageLoading({ cards = 6, columns = 3, className }: PageLoadingProps) {
  const gridCols =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      className={cn("grid gap-4", gridCols, className)}
      data-testid="page-loading"
    >
      {Array.from({ length: cards }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
