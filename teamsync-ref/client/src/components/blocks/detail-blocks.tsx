import { type ReactNode, type ElementType, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DetailBannerAction {
  label: string;
  icon?: ElementType;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
}

interface DetailBannerChip {
  label: string;
  value: string;
  icon?: ElementType;
}

interface DetailBannerProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  avatarFallback?: string;
  icon?: ElementType;
  iconBg?: string;
  iconColor?: string;
  badges?: Array<{ label: string; variant?: "default" | "secondary" | "outline" | "destructive" }>;
  chips?: DetailBannerChip[];
  actions?: DetailBannerAction[];
  children?: ReactNode;
}

export function DetailBanner({
  title,
  subtitle,
  avatar,
  avatarFallback,
  icon: Icon,
  iconBg,
  iconColor,
  badges,
  chips,
  actions,
  children,
}: DetailBannerProps) {
  return (
    <div className="rounded-xl border bg-card p-6" data-testid="detail-banner">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          {avatar !== undefined || avatarFallback ? (
            <Avatar className="h-14 w-14">
              {avatar && <AvatarImage src={avatar} alt={title} />}
              <AvatarFallback className="text-lg font-semibold">
                {avatarFallback || title.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : Icon ? (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-lg"
              style={{ backgroundColor: iconBg, color: iconColor }}
            >
              <Icon className="h-6 w-6" />
            </div>
          ) : null}

          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="text-detail-title">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground" data-testid="text-detail-subtitle">
                {subtitle}
              </p>
            )}
            {badges && badges.length > 0 && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {badges.map((b) => (
                  <Badge key={b.label} variant={b.variant ?? "secondary"} data-testid={`badge-${b.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    {b.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {actions.map((a) => {
              const ActionIcon = a.icon;
              return (
                <button
                  key={a.label}
                  onClick={a.onClick}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    a.variant === "outline"
                      ? "border border-border text-foreground hover-elevate"
                      : a.variant === "ghost"
                        ? "text-muted-foreground hover-elevate"
                        : "bg-primary text-primary-foreground hover-elevate"
                  )}
                  data-testid={`btn-${a.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {ActionIcon && <ActionIcon className="h-4 w-4" />}
                  {a.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {chips && chips.length > 0 && (
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          {chips.map((c) => {
            const ChipIcon = c.icon;
            return (
              <div key={c.label} className="flex items-center gap-1.5 text-sm" data-testid={`chip-${c.label.toLowerCase().replace(/\s+/g, "-")}`}>
                {ChipIcon && <ChipIcon className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="text-muted-foreground">{c.label}:</span>
                <span className="font-medium">{c.value}</span>
              </div>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
}

interface InfoProperty {
  label: string;
  value: ReactNode;
  icon?: ElementType;
}

interface InfoPropertyGridProps {
  properties: InfoProperty[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function InfoPropertyGrid({ properties, columns = 2, className }: InfoPropertyGridProps) {
  const colClasses: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", colClasses[columns], className)} data-testid="info-property-grid">
      {properties.map((p) => {
        const PropIcon = p.icon;
        return (
          <div key={p.label} className="py-1.5" data-testid={`info-prop-${p.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <div className="flex items-center gap-1.5">
              {PropIcon && <PropIcon className="h-3.5 w-3.5 text-muted-foreground" />}
              <span className="text-sm text-muted-foreground">{p.label}</span>
            </div>
            <div className="mt-0.5 text-sm font-medium">{p.value}</div>
          </div>
        );
      })}
    </div>
  );
}

interface TabItem {
  value: string;
  label: string;
  icon?: ElementType;
  content: ReactNode;
  badge?: string | number;
}

interface TabContainerProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function TabContainer({ tabs, defaultTab, className }: TabContainerProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value || "");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("w-full", className)} data-testid="tab-container">
      <TabsList className="w-full justify-start gap-1" data-testid="tab-list">
        {tabs.map((t) => {
          const TabIcon = t.icon;
          return (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="gap-1.5"
              data-testid={`tab-trigger-${t.value}`}
            >
              {TabIcon && <TabIcon className="h-4 w-4" />}
              {t.label}
              {t.badge !== undefined && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {t.badge}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.value} value={t.value} className="mt-4" data-testid={`tab-content-${t.value}`}>
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
