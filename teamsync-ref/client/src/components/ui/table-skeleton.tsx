import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showCheckbox?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showCheckbox = true,
  className,
}: TableSkeletonProps) {
  return (
    <div
      className={cn("flex flex-col rounded-lg border bg-background", className)}
      data-testid="table-skeleton"
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <Skeleton className="h-8 w-60" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-[120px]" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              {showCheckbox && (
                <th className="w-10 px-3 py-2.5">
                  <Skeleton className="size-4 rounded-sm" />
                </th>
              )}
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-3 py-2.5 text-left">
                  <Skeleton className="h-3.5 w-20" />
                </th>
              ))}
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b last:border-b-0">
                {showCheckbox && (
                  <td className="w-10 px-3 py-3">
                    <Skeleton className="size-4 rounded-sm" />
                  </td>
                )}
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-3 py-3">
                    {colIdx === 0 ? (
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="size-8 shrink-0 rounded-full" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </div>
                    ) : colIdx === columns - 1 ? (
                      <Skeleton className="h-5 w-16 rounded-full" />
                    ) : (
                      <Skeleton className="h-3.5 w-24" />
                    )}
                  </td>
                ))}
                <td className="w-10 px-3 py-3">
                  <Skeleton className="size-7 rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
        <Skeleton className="h-3.5 w-40" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="size-7 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
