import { type ReactNode, type ElementType } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DS } from "@/lib/design-tokens";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition, Fade } from "@/components/ui/animated";

interface SmallDetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: "sm" | "md";
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
}

export function SmallDetailModal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  footer,
  headerActions,
}: SmallDetailModalProps) {
  const widthClass = size === "sm" ? "max-w-md" : "max-w-lg";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(widthClass, "p-0 gap-0 overflow-hidden [&>button]:hidden")}
        data-testid="small-detail-modal"
      >
        <div className="flex items-start justify-between border-b px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold truncate" data-testid="modal-title">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground truncate" data-testid="modal-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            {headerActions}
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="btn-modal-close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[75vh] px-5 py-4" data-testid="modal-body">
          {children}
        </div>

        {footer && (
          <div
            className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5 py-3"
            data-testid="modal-footer"
          >
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface DetailViewHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ElementType;
  badges?: Array<{ label: string; variant?: "default" | "secondary" | "outline" | "destructive" }>;
  headerActions?: ReactNode;
  onClose?: () => void;
}

function DetailViewHeader({
  title,
  subtitle,
  icon: Icon,
  badges,
  headerActions,
  onClose,
}: DetailViewHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b px-6 py-4 shrink-0">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0 mt-0.5">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold truncate" data-testid="detail-view-title">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground truncate" data-testid="detail-view-subtitle">
              {subtitle}
            </p>
          )}
          {badges && badges.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              {badges.map((b) => (
                <Badge
                  key={b.label}
                  variant={b.variant ?? "secondary"}
                  data-testid={`badge-${b.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {b.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {headerActions}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="btn-detail-close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface TwoColumnLayoutProps {
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

function TwoColumnLayout({ mainContent, sidebarContent }: TwoColumnLayoutProps) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0" data-testid="detail-body">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] divide-y lg:divide-y-0 lg:divide-x h-full">
        <div className="p-6 overflow-y-auto" data-testid="detail-main">
          {mainContent}
        </div>
        <div className="p-5 space-y-4 bg-muted/20" data-testid="detail-sidebar">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
}

interface LargeDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: ElementType;
  badges?: Array<{ label: string; variant?: "default" | "secondary" | "outline" | "destructive" }>;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
  headerActions?: ReactNode;
}

export function LargeDetailSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  badges,
  mainContent,
  sidebarContent,
  headerActions,
}: LargeDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[720px] p-0 flex flex-col gap-0 [&>button]:hidden"
        data-testid="large-detail-sheet"
      >
        <DetailViewHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          badges={badges}
          headerActions={headerActions}
          onClose={() => onOpenChange(false)}
        />
        <TwoColumnLayout mainContent={mainContent} sidebarContent={sidebarContent} />
      </SheetContent>
    </Sheet>
  );
}

interface LargeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: ElementType;
  badges?: Array<{ label: string; variant?: "default" | "secondary" | "outline" | "destructive" }>;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
  headerActions?: ReactNode;
  footerContent?: ReactNode;
}

export function LargeDetailDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  badges,
  mainContent,
  sidebarContent,
  headerActions,
  footerContent,
}: LargeDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden"
        data-testid="large-detail-dialog"
      >
        <DetailViewHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          badges={badges}
          headerActions={headerActions}
          onClose={() => onOpenChange(false)}
        />
        <TwoColumnLayout mainContent={mainContent} sidebarContent={sidebarContent} />
        {footerContent && (
          <div
            className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-3 shrink-0"
            data-testid="detail-footer"
          >
            {footerContent}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface FullPageDetailTabbedProps {
  backLabel: string;
  backPath: string;
  banner: ReactNode;
  tabs: Array<{
    value: string;
    label: string;
    icon?: ElementType;
    content: ReactNode;
    badge?: string | number;
  }>;
  defaultTab?: string;
}

export function FullPageDetailTabbed({
  backLabel,
  backPath,
  banner,
  tabs,
  defaultTab,
}: FullPageDetailTabbedProps) {
  const [, setLocation] = useLocation();

  return (
    <PageTransition className={DS.page.shell} data-testid="full-page-detail-tabbed">
      <Fade>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(backPath)}
          data-testid="btn-back"
        >
          <ArrowLeft className="size-4 mr-2" />
          {backLabel}
        </Button>
      </Fade>

      <Fade>{banner}</Fade>

      <Fade>
        <Tabs defaultValue={defaultTab || tabs[0]?.value || ""} className="mt-2" data-testid="detail-tabs">
          <TabsList className="w-full justify-start gap-1">
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
      </Fade>
    </PageTransition>
  );
}

interface FullPageDetailColumnsProps {
  backLabel: string;
  backPath: string;
  header: ReactNode;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
  sidebarPosition?: "left" | "right";
  ratio?: "7:3" | "6:4" | "3:7";
}

export function FullPageDetailColumns({
  backLabel,
  backPath,
  header,
  mainContent,
  sidebarContent,
  sidebarPosition = "right",
  ratio = "7:3",
}: FullPageDetailColumnsProps) {
  const [, setLocation] = useLocation();

  const ratioClasses: Record<string, string> = {
    "7:3": "lg:grid-cols-[1fr_340px]",
    "6:4": "lg:grid-cols-[3fr_2fr]",
    "3:7": "lg:grid-cols-[340px_1fr]",
  };

  return (
    <PageTransition className={DS.page.shell} data-testid="full-page-detail-columns">
      <Fade>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(backPath)}
          data-testid="btn-back"
        >
          <ArrowLeft className="size-4 mr-2" />
          {backLabel}
        </Button>
      </Fade>

      <Fade>{header}</Fade>

      <Fade>
        <div className={cn("grid grid-cols-1 gap-6", ratioClasses[ratio])} data-testid="detail-columns">
          {sidebarPosition === "left" ? (
            <>
              <div data-testid="detail-sidebar">{sidebarContent}</div>
              <div data-testid="detail-main">{mainContent}</div>
            </>
          ) : (
            <>
              <div data-testid="detail-main">{mainContent}</div>
              <div data-testid="detail-sidebar">{sidebarContent}</div>
            </>
          )}
        </div>
      </Fade>
    </PageTransition>
  );
}

interface SidebarFieldProps {
  label: string;
  children: ReactNode;
  icon?: ElementType;
}

export function SidebarField({ label, children, icon: Icon }: SidebarFieldProps) {
  return (
    <div data-testid={`field-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className={DS.typography.caption}>{label}</span>
      </div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}
