import { type ReactNode, type ElementType } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CoverMediaGridItem {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  badge?: ReactNode;
  onClick?: () => void;
}

interface CoverMediaGridProps {
  items: CoverMediaGridItem[];
  cols?: 2 | 3 | 4;
  emptyMessage?: string;
  className?: string;
}

const gridColClasses: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function CoverMediaGrid({ items, cols = 3, emptyMessage = "No items", className }: CoverMediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground" data-testid="cover-media-grid-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", gridColClasses[cols], className)} data-testid="cover-media-grid">
      {items.map((item) => (
        <Card
          key={item.id}
          className={cn(
            "overflow-visible",
            item.onClick && "cursor-pointer hover-elevate"
          )}
          onClick={item.onClick}
          data-testid={`cover-media-card-${item.id}`}
        >
          <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" data-testid="cover-media-title">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate" data-testid="cover-media-subtitle">{item.subtitle}</p>
                )}
              </div>
              {item.badge && <div className="shrink-0">{item.badge}</div>}
            </div>
            {item.meta && (
              <div className="mt-2 text-xs text-muted-foreground" data-testid="cover-media-meta">
                {item.meta}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export interface SmallImageGridItem {
  id: string;
  image?: string;
  icon?: ElementType;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
}

interface SmallImageGridProps {
  items: SmallImageGridItem[];
  cols?: 2 | 3;
  emptyMessage?: string;
  className?: string;
}

export function SmallImageGrid({ items, cols = 2, emptyMessage = "No items", className }: SmallImageGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground" data-testid="small-image-grid-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", gridColClasses[cols], className)} data-testid="small-image-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.id}
            className={cn(
              "flex items-center gap-4 p-4 overflow-visible",
              item.onClick && "cursor-pointer hover-elevate"
            )}
            onClick={item.onClick}
            data-testid={`small-image-card-${item.id}`}
          >
            {item.image ? (
              <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              </div>
            ) : Icon ? (
              <div
                className="flex items-center justify-center h-14 w-14 rounded-lg shrink-0"
                style={{ backgroundColor: item.iconBg, color: item.iconColor }}
              >
                <Icon className="h-6 w-6" />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" data-testid="small-image-title">{item.title}</p>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>
              )}
              {item.meta && (
                <div className="mt-1 text-xs text-muted-foreground">{item.meta}</div>
              )}
            </div>
            {item.actions && (
              <div className="shrink-0 flex items-center gap-1">{item.actions}</div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export interface ButtonGridItem {
  id: string;
  icon: ElementType;
  iconBg?: string;
  iconColor?: string;
  label: string;
  description?: string;
  onClick?: () => void;
  href?: string;
}

interface ButtonGridProps {
  items: ButtonGridItem[];
  cols?: 2 | 3 | 4;
  className?: string;
}

export function ButtonGrid({ items, cols = 3, className }: ButtonGridProps) {
  return (
    <div className={cn("grid gap-4", gridColClasses[cols], className)} data-testid="button-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.id}
            className={cn("flex items-start gap-4 p-4 overflow-visible cursor-pointer hover-elevate")}
            onClick={item.onClick}
            data-testid={`button-grid-item-${item.id}`}
          >
            <div
              className="flex items-center justify-center h-10 w-10 rounded-lg shrink-0"
              style={{ backgroundColor: item.iconBg, color: item.iconColor }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium" data-testid="button-grid-label">{item.label}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export interface ShortcutGridItem {
  id: string;
  icon: ElementType;
  iconBg?: string;
  iconColor?: string;
  label: string;
  onClick?: () => void;
}

interface ShortcutGridProps {
  items: ShortcutGridItem[];
  cols?: 3 | 4 | 5 | 6;
  className?: string;
}

const shortcutColClasses: Record<number, string> = {
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-3 sm:grid-cols-5",
  6: "grid-cols-3 sm:grid-cols-6",
};

export function ShortcutGrid({ items, cols = 4, className }: ShortcutGridProps) {
  return (
    <div className={cn("grid gap-3", shortcutColClasses[cols], className)} data-testid="shortcut-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className="flex flex-col items-center gap-2 rounded-xl p-4 hover-elevate transition-colors"
            data-testid={`shortcut-grid-item-${item.id}`}
          >
            <div
              className="flex items-center justify-center h-10 w-10 rounded-lg"
              style={{ backgroundColor: item.iconBg, color: item.iconColor }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-center">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
