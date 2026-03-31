import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Scale } from "@/components/ui/animated";

interface EmptyStateProps {
  illustration?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  illustration,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <Scale initialScale={0.9} duration={0.35}>
    <div className="flex flex-col items-center gap-4 py-12" data-testid="empty-state">
      {illustration && (
        <img
          src={illustration}
          alt=""
          className="size-32 object-contain"
          draggable={false}
        />
      )}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-sm font-medium text-foreground" data-testid="text-empty-title">{title}</p>
        <p className="max-w-xs text-xs text-muted-foreground" data-testid="text-empty-description">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Button size="sm" variant="outline" asChild>
          <Link href={actionHref} data-testid="link-empty-action">{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button size="sm" variant="outline" onClick={onAction} data-testid="button-empty-action">
          {actionLabel}
        </Button>
      )}
    </div>
    </Scale>
  );
}
