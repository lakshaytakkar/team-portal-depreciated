import { type ReactNode, type ElementType, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";

export interface SimpleTableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => ReactNode;
}

interface SimpleTableProps<T = Record<string, unknown>> {
  columns: SimpleTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
}

const alignClasses: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function SimpleTable<T extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = "No data",
  className,
  onRowClick,
}: SimpleTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedRows = sortKey
    ? [...rows].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      })
    : rows;

  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground" data-testid="simple-table-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Card className={cn("overflow-visible", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="simple-table">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 font-medium text-muted-foreground",
                    alignClasses[col.align || "left"],
                    col.sortable && "cursor-pointer select-none"
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  data-testid={`table-header-${col.key}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="inline-flex">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "border-b last:border-b-0 transition-colors hover-elevate",
                  onRowClick && "cursor-pointer"
                )}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                data-testid={`table-row-${rowIndex}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3",
                      alignClasses[col.align || "left"]
                    )}
                    data-testid={`table-cell-${col.key}-${rowIndex}`}
                  >
                    {col.render
                      ? col.render(row[col.key], row, rowIndex)
                      : (row[col.key] as ReactNode) ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export interface QuickLinkItem {
  id: string;
  icon: ElementType;
  iconBg?: string;
  iconColor?: string;
  label: string;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  onClick?: () => void;
  href?: string;
}

interface QuickLinksBlockProps {
  items: QuickLinkItem[];
  cols?: 2 | 3 | 4;
  emptyMessage?: string;
  className?: string;
}

const qlColClasses: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function QuickLinksBlock({
  items,
  cols = 3,
  emptyMessage = "No links",
  className,
}: QuickLinksBlockProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground" data-testid="quick-links-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", qlColClasses[cols], className)} data-testid="quick-links-block">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.id}
            className={cn(
              "flex items-start gap-4 p-4 overflow-visible cursor-pointer hover-elevate"
            )}
            onClick={item.onClick}
            data-testid={`quick-link-${item.id}`}
          >
            <div
              className="flex items-center justify-center h-10 w-10 rounded-lg shrink-0"
              style={{ backgroundColor: item.iconBg, color: item.iconColor }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium" data-testid={`quick-link-label-${item.id}`}>
                  {item.label}
                </p>
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant || "secondary"}
                    className="text-[10px]"
                    data-testid={`quick-link-badge-${item.id}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p
                  className="text-xs text-muted-foreground mt-0.5 line-clamp-2"
                  data-testid={`quick-link-desc-${item.id}`}
                >
                  {item.description}
                </p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
