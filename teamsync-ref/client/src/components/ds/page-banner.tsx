import { Button } from "@/components/ui/button";
import { Fade } from "@/components/ui/animated";

interface PageBannerProps {
  title: string;
  description?: string;
  iconSrc: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageBanner({ title, description, iconSrc, actionLabel, onAction }: PageBannerProps) {
  return (
    <Fade direction="down" distance={10} duration={0.3}>
    <div
      className="mb-5 flex items-center gap-4 rounded-xl bg-primary/90 px-5 py-4"
      data-testid="page-banner"
    >
      <img
        src={iconSrc}
        alt=""
        className="size-16 shrink-0 object-contain drop-shadow-lg"
        loading="eager"
        decoding="async"
        draggable={false}
      />
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold font-heading text-white" data-testid="banner-title">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-white/75" data-testid="banner-description">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button
          size="sm"
          variant="secondary"
          className="shrink-0 bg-white/15 text-white border-0 hover:bg-white/25"
          onClick={onAction}
          data-testid="banner-action"
        >
          {actionLabel}
        </Button>
      )}
    </div>
    </Fade>
  );
}
