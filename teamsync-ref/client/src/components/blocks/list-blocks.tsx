import { type ReactNode, type ElementType, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface EntityCellProps {
  avatar?: string;
  fallback?: string;
  icon?: ElementType;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function EntityCell({
  avatar,
  fallback,
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  className,
}: EntityCellProps) {
  const initials = fallback ?? title.slice(0, 2).toUpperCase();

  return (
    <div className={cn("flex items-center gap-3", className)} data-testid="entity-cell">
      {Icon ? (
        <div
          className="flex items-center justify-center h-9 w-9 rounded-lg shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon className="h-4 w-4" />
        </div>
      ) : (
        <Avatar className="h-9 w-9 shrink-0">
          {avatar && <AvatarImage src={avatar} alt={title} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium truncate" data-testid="entity-cell-title">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate" data-testid="entity-cell-subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export interface StackedListItem {
  id: string;
  avatar?: string;
  fallback?: string;
  icon?: ElementType;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
}

interface StackedListProps {
  items: StackedListItem[];
  emptyMessage?: string;
  className?: string;
}

export function StackedList({ items, emptyMessage = "No items", className }: StackedListProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground" data-testid="stacked-list-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("divide-y", className)} data-testid="stacked-list">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex items-center justify-between gap-3 py-3 px-1",
            item.onClick && "cursor-pointer hover-elevate"
          )}
          onClick={item.onClick}
          data-testid={`stacked-list-item-${item.id}`}
        >
          <EntityCell
            avatar={item.avatar}
            fallback={item.fallback}
            icon={item.icon}
            iconBg={item.iconBg}
            iconColor={item.iconColor}
            title={item.title}
            subtitle={item.subtitle}
            className="min-w-0 flex-1"
          />
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {item.meta && (
              <div className="text-xs text-muted-foreground" data-testid="stacked-list-item-meta">
                {item.meta}
              </div>
            )}
            {item.actions && (
              <div className="flex items-center gap-1" data-testid="stacked-list-item-actions">
                {item.actions}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export interface ColumnedListRow {
  label: string;
  value: ReactNode;
}

interface ColumnedListProps {
  rows: ColumnedListRow[];
  cols?: 1 | 2 | 3;
  className?: string;
}

const colClasses: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

export function ColumnedList({ rows, cols = 2, className }: ColumnedListProps) {
  return (
    <div className={cn("grid gap-x-6 gap-y-3", colClasses[cols], className)} data-testid="columned-list">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-2 py-1.5" data-testid={`columned-list-row-${row.label.toLowerCase().replace(/\s+/g, "-")}`}>
          <span className="text-sm text-muted-foreground shrink-0">{row.label}</span>
          <span className="text-sm font-medium text-right">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export interface ExpandableListItem {
  id: string;
  icon?: ElementType;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  content: ReactNode;
}

interface ExpandableListProps {
  items: ExpandableListItem[];
  defaultOpen?: string[];
  className?: string;
}

export function ExpandableList({ items, defaultOpen = [], className }: ExpandableListProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={cn("divide-y", className)} data-testid="expandable-list">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id} data-testid={`expandable-list-item-${item.id}`}>
            <button
              onClick={() => toggle(item.id)}
              className="flex items-center gap-3 w-full py-3 px-1 text-left hover-elevate"
              data-testid={`expandable-list-trigger-${item.id}`}
            >
              <span className="text-muted-foreground shrink-0">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
              {item.icon && (
                <div
                  className="flex items-center justify-center h-8 w-8 rounded-md shrink-0"
                  style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                )}
              </div>
              {item.badge && <div className="shrink-0">{item.badge}</div>}
            </button>
            {isOpen && (
              <div className="pl-10 pr-2 pb-3" data-testid={`expandable-list-content-${item.id}`}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
