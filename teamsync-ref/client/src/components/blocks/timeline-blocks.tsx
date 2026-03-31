import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: ElementType;
  iconBg?: string;
  iconColor?: string;
  meta?: ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative", className)} data-testid="timeline">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-6">
        {events.map((event, index) => {
          const EventIcon = event.icon || Circle;
          return (
            <div key={event.id} className="relative flex gap-4 pl-0" data-testid={`timeline-event-${event.id}`}>
              <div
                className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-card"
                style={{
                  backgroundColor: event.iconBg,
                  color: event.iconColor,
                  borderColor: event.iconBg || undefined,
                }}
              >
                <EventIcon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="text-sm font-medium" data-testid={`timeline-title-${event.id}`}>
                    {event.title}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap" data-testid={`timeline-time-${event.id}`}>
                    {event.timestamp}
                  </span>
                </div>
                {event.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
                {event.meta && <div className="mt-1.5">{event.meta}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ActivityItem {
  id: string;
  text: string;
  timeAgo: string;
  icon?: ElementType;
  iconBg?: string;
  iconColor?: string;
  actor?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
  maxItems?: number;
}

export function ActivityFeed({ items, className, maxItems }: ActivityFeedProps) {
  const displayed = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className={cn("space-y-3", className)} data-testid="activity-feed">
      {displayed.map((item) => {
        const ItemIcon = item.icon || Circle;
        return (
          <div
            key={item.id}
            className="flex items-start gap-3"
            data-testid={`activity-item-${item.id}`}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: item.iconBg || "hsl(var(--muted))",
                color: item.iconColor || "hsl(var(--muted-foreground))",
              }}
            >
              <ItemIcon className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                {item.actor && <span className="font-medium">{item.actor} </span>}
                <span className="text-muted-foreground">{item.text}</span>
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              {item.timeAgo}
            </span>
          </div>
        );
      })}
    </div>
  );
}
