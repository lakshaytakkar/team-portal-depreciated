import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
      <div>
        <h2 className="text-xl font-semibold font-heading tracking-tight" data-testid="text-section-title">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[15px] text-muted-foreground" data-testid="text-section-description">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {children}
        {actionLabel && onAction && (
          <Button size="sm" onClick={onAction} data-testid="button-page-action">
            {actionIcon || <Plus className="mr-1.5 size-3.5" />}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
