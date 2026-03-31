import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, CheckCheck, Filter, Loader2 } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { PageShell, PageHeader, StatGrid, StatCard } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useVertical } from "@/lib/vertical-store";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  type AppNotification,
  type NotificationType,
} from "@/lib/mock-data-shared";
import {
  TYPE_CONFIG,
} from "@/components/layout/notification-panel";

interface CoreNotification {
  id: string;
  vertical_id: string | null;
  user_id: string | null;
  type: string;
  title: string;
  description: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs === 1) return "1 hr ago";
  if (diffHrs < 24) return `${diffHrs} hrs ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

function mapToAppNotification(n: CoreNotification): AppNotification {
  return {
    id: n.id,
    verticalId: n.vertical_id ?? "",
    type: n.type as NotificationType,
    title: n.title,
    description: n.description ?? "",
    time: formatRelativeTime(n.created_at),
    url: n.action_url ?? "/",
    isRead: n.is_read,
  };
}

type FilterTab = "all" | "unread" | NotificationType;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all",         label: "All" },
  { value: "unread",      label: "Unread" },
  { value: "order",       label: "Orders" },
  { value: "fulfillment", label: "Fulfillment" },
  { value: "inventory",   label: "Inventory" },
  { value: "finance",     label: "Finance" },
  { value: "retailer",    label: "Retailers" },
  { value: "application", label: "Applications" },
  { value: "quotation",   label: "Quotations" },
  { value: "system",      label: "System" },
];

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { currentVertical } = useVertical();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const queryKey = ["/api/core/notifications", `?verticalId=${currentVertical.id}`];

  const { data: rawNotifications = [], isLoading } = useQuery<CoreNotification[]>({
    queryKey,
  });

  const notifications: AppNotification[] = useMemo(
    () => rawNotifications.map(mapToAppNotification),
    [rawNotifications]
  );

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/core/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/core/notifications/read-all?verticalId=${currentVertical.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const todayCount = notifications.slice(0, 5).length;

  const filtered = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const todayNotifs  = filtered.filter((_, i) => notifications.indexOf(filtered[i]) < 5);
  const earlierNotifs = filtered.filter((_, i) => notifications.indexOf(filtered[i]) >= 5);

  function markRead(id: string, url: string) {
    markReadMutation.mutate(id);
    setLocation(url);
  }

  function markAllRead() {
    markAllReadMutation.mutate();
  }

  function toggleRead(id: string) {
    markReadMutation.mutate(id);
  }

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<NotificationType, number>> = {};
    for (const n of notifications) {
      counts[n.type] = (counts[n.type] ?? 0) + 1;
    }
    return counts;
  }, [notifications]);

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Notifications"
          subtitle={`Activity feed for ${currentVertical.name}`}
          actions={
            unreadCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                disabled={markAllReadMutation.isPending}
                data-testid="btn-mark-all-read-page"
              >
                {markAllReadMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="mr-2 h-4 w-4" />
                )}
                Mark all read
              </Button>
            ) : undefined
          }
        />

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4 border-b last:border-b-0">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <StatGrid cols={4}>
              <StatCard
                label="Total"
                value={notifications.length}
                icon={Bell}
                iconBg="#F1F5F9"
                iconColor="#64748B"
              />
              <StatCard
                label="Unread"
                value={unreadCount}
                icon={Bell}
                iconBg={unreadCount > 0 ? "#DBEAFE" : "#F1F5F9"}
                iconColor={unreadCount > 0 ? "#2563EB" : "#64748B"}
                trend={unreadCount > 0 ? "Needs attention" : "All caught up"}
              />
              <StatCard
                label="Today"
                value={todayCount}
                icon={Bell}
                iconBg="#F0FDF4"
                iconColor="#16A34A"
              />
              <StatCard
                label="This Week"
                value={notifications.length}
                icon={Bell}
                iconBg="#FFF7ED"
                iconColor="#EA580C"
              />
            </StatGrid>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {FILTER_TABS.map((tab) => {
                  const count =
                    tab.value === "all"
                      ? notifications.length
                      : tab.value === "unread"
                      ? unreadCount
                      : typeCounts[tab.value as NotificationType] ?? 0;

                  if (count === 0 && tab.value !== "all" && tab.value !== "unread") return null;

                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveFilter(tab.value)}
                      data-testid={`filter-${tab.value}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                        activeFilter === tab.value
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
                      )}
                    >
                      {tab.label}
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-full min-w-[18px] h-[18px] px-1 text-[10px] font-bold",
                          activeFilter === tab.value
                            ? "bg-background/20 text-background"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                    <Bell className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-medium">No notifications in this category</p>
                    <p className="text-xs">Try selecting a different filter above</p>
                  </div>
                ) : (
                  <>
                    {todayNotifs.length > 0 && (
                      <div>
                        <div className="px-5 py-2 bg-muted/40 border-b">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Today
                          </span>
                        </div>
                        {todayNotifs.map((n) => (
                          <FullNotificationRow
                            key={n.id}
                            n={n}
                            onRead={markRead}
                            onToggleRead={toggleRead}
                          />
                        ))}
                      </div>
                    )}
                    {earlierNotifs.length > 0 && (
                      <div>
                        <div className="px-5 py-2 bg-muted/40 border-b">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Earlier
                          </span>
                        </div>
                        {earlierNotifs.map((n) => (
                          <FullNotificationRow
                            key={n.id}
                            n={n}
                            onRead={markRead}
                            onToggleRead={toggleRead}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </Fade>
    </PageShell>
  );
}

function FullNotificationRow({
  n,
  onRead,
  onToggleRead,
}: {
  n: AppNotification;
  onRead: (id: string, url: string) => void;
  onToggleRead: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[n.type];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-4 px-5 py-4 border-b last:border-b-0 group transition-colors",
        !n.isRead ? "bg-blue-50/40 dark:bg-blue-950/20" : "hover:bg-muted/30"
      )}
      data-testid={`notification-full-${n.id}`}
    >
      <div
        className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center mt-0.5"
        style={{ backgroundColor: cfg.bg, color: cfg.color }}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              {!n.isRead && (
                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
              )}
              <p className={cn("text-sm", !n.isRead ? "font-semibold" : "font-medium")}>
                {n.title}
              </p>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 shrink-0"
                style={{ color: cfg.color, borderColor: `${cfg.color}40`, backgroundColor: cfg.bg }}
              >
                {cfg.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {n.description}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">{n.time}</p>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7 px-2.5"
          onClick={() => onRead(n.id, n.url)}
          data-testid={`btn-go-to-${n.id}`}
        >
          View
        </Button>
        {!n.isRead && (
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7 px-2.5 text-muted-foreground"
            onClick={() => onToggleRead(n.id)}
            data-testid={`btn-toggle-read-${n.id}`}
          >
            Mark read
          </Button>
        )}
      </div>
    </div>
  );
}
