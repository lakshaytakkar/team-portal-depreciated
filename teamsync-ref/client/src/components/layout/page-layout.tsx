import { type ReactNode, type ElementType, type ThHTMLAttributes, type TdHTMLAttributes } from "react";
import { Plus, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { PageTransition } from "@/components/ui/animated";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DS } from "@/lib/design-tokens";

// ─────────────────────────────────────────────────────────────────────────────
// PageShell — outer wrapper for all standard pages
// Pattern: PageTransition > div.px-16.py-6.lg:px-24.space-y-6
// ─────────────────────────────────────────────────────────────────────────────

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className, ...rest }: PageShellProps) {
  return (
    <PageTransition className={cn(DS.page.shell, className)} {...rest}>
      {children}
    </PageTransition>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PageHeader — title + subtitle + right-aligned actions
// Title is always text-2xl font-bold font-heading. Never text-xl.
// ─────────────────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between" data-testid="page-header">
      <div>
        <h1 className={DS.typography.pageTitle} data-testid="text-page-title">
          {title}
        </h1>
        {subtitle && (
          <p className={DS.typography.pageSubtitle} data-testid="text-page-subtitle">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2" data-testid="page-header-actions">
          {actions}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HeroBanner — gradient dashboard hero banner
// Always starts every dashboard. Uses vertical brand color.
// ─────────────────────────────────────────────────────────────────────────────

interface HeroBannerMetric {
  label: string;
  value: string | number;
}

interface HeroBannerProps {
  eyebrow: string;
  headline: string;
  tagline: string;
  color: string;
  colorDark: string;
  metrics?: HeroBannerMetric[];
  actions?: ReactNode;
}

export function HeroBanner({
  eyebrow,
  headline,
  tagline,
  color,
  colorDark,
  metrics,
  actions,
}: HeroBannerProps) {
  return (
    <div
      className="rounded-2xl px-8 py-7 text-white relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color} 0%, ${colorDark} 100%)` }}
      data-testid="section-hero-banner"
    >
      <div className="relative z-10">
        <p className="text-sm font-medium opacity-75">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold font-heading tracking-tight">{headline}</h1>
        <p className="mt-1 text-sm opacity-75">{tagline}</p>
        {metrics && metrics.length > 0 && (
          <div className="mt-5 flex items-center gap-8">
            {metrics.map((m) => (
              <div key={m.label} data-testid={`metric-${m.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs opacity-70">{m.label}</div>
              </div>
            ))}
          </div>
        )}
        {actions && (
          <div className="mt-5 flex items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — single KPI card
// Always p-5, w-9 h-9 icon box, text-2xl value, text-xs label.
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon: ElementType;
  iconBg: string;
  iconColor: string;
}

export function StatCard({ label, value, trend, icon: Icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className={cn(DS.card.base, DS.card.stat.padding)} data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={DS.typography.statLabel}>{label}</p>
          <p className={cn("mt-2", DS.typography.statValue)}>{value}</p>
          {trend && (
            <p className={cn("mt-1", DS.typography.statTrend)}>{trend}</p>
          )}
        </div>
        <div
          className={cn("flex items-center justify-center", DS.card.stat.iconBox)}
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon className={DS.card.stat.iconSize} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatGrid — 4-col responsive grid for StatCards
// Always grid-cols-2 lg:grid-cols-4 gap-4. Never 6-col.
// ─────────────────────────────────────────────────────────────────────────────

interface StatGridProps {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 6;
}

export function StatGrid({ children, cols = 4 }: StatGridProps) {
  return (
    <div className={cn("grid", DS.grid.gap, DS.grid.stat[cols])} data-testid="stat-grid">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionCard — dashboard section container
// Always rounded-xl border bg-card with border-b header.
// ─────────────────────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  children: ReactNode;
  noPadding?: boolean;
}

export function SectionCard({ title, viewAllLabel, onViewAll, children, noPadding }: SectionCardProps) {
  return (
    <div className={DS.card.base} data-testid={`section-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className={cn("flex items-center justify-between border-b", DS.card.section.headerPadding)}>
        <h3 className={DS.typography.sectionTitle}>{title}</h3>
        {viewAllLabel && onViewAll && (
          <button
            onClick={onViewAll}
            className={cn(DS.typography.caption, "hover:text-foreground transition-colors")}
            data-testid="btn-view-all"
          >
            {viewAllLabel}
          </button>
        )}
      </div>
      <div className={noPadding ? "" : DS.card.section.bodyPadding}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionGrid — 2 or 3-col grid for dashboard sections
// ─────────────────────────────────────────────────────────────────────────────

interface SectionGridProps {
  children: ReactNode;
  cols?: 2 | 3;
}

export function SectionGrid({ children, cols = 2 }: SectionGridProps) {
  return (
    <div className={cn("grid", DS.grid.gap, DS.grid.section[cols])} data-testid="section-grid">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterPill — locked pill button for filter rows
// Active: brand bg + white text. Inactive: muted bg + muted-foreground text.
// Always rounded-full px-3 py-1 text-xs font-medium. Never px-4 or py-1.5.
// ─────────────────────────────────────────────────────────────────────────────

interface FilterPillProps {
  active: boolean;
  color: string;
  onClick: () => void;
  children: ReactNode;
  testId?: string;
}

export function FilterPill({ active, color, onClick, children, testId }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={DS.pill.base}
      style={
        active
          ? { backgroundColor: color, color: DS.pill.active.color }
          : { backgroundColor: DS.pill.inactive.bg, color: DS.pill.inactive.color }
      }
      data-testid={testId ?? "filter-pill"}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PrimaryAction — locked primary action button
// Always rounded-lg px-4 py-2 text-sm font-medium text-white with brand bg.
// ─────────────────────────────────────────────────────────────────────────────

interface PrimaryActionProps {
  color: string;
  icon?: ElementType;
  onClick?: () => void;
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  testId?: string;
}

export function PrimaryAction({
  color,
  icon: Icon,
  onClick,
  children,
  type = "button",
  disabled,
  testId,
}: PrimaryActionProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={DS.primaryAction.base}
      style={{ backgroundColor: color }}
      data-testid={testId ?? "btn-primary-action"}
    >
      {Icon && <Icon className={DS.primaryAction.iconSize} />}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IndexToolbar — unified search + filter pills + primary action
// Search: w-80 pl-10 h-9 bg-muted/30. Pills: px-3 py-1 rounded-full text-xs.
// ─────────────────────────────────────────────────────────────────────────────

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface IndexToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilter?: (v: string) => void;
  color: string;
  primaryAction?: {
    label: string;
    icon?: ElementType;
    onClick: () => void;
  };
  placeholder?: string;
  extra?: ReactNode;
}

export function IndexToolbar({
  search,
  onSearch,
  filters,
  activeFilter,
  onFilter,
  color,
  primaryAction,
  placeholder = "Search…",
  extra,
}: IndexToolbarProps) {
  return (
    <div className="space-y-3" data-testid="index-toolbar">
      <div className={cn("flex items-center justify-between", DS.toolbar.gap)}>
        <div className={cn("relative", DS.toolbar.search.width)}>
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none", DS.toolbar.search.icon)} />
          <Input
            className={cn(DS.toolbar.search.padding, DS.toolbar.search.height, DS.toolbar.search.bg)}
            placeholder={placeholder}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <div className={cn("flex items-center", DS.toolbar.filterGap)}>
          {extra}
          {primaryAction && (
            <PrimaryAction
              color={color}
              icon={primaryAction.icon ?? Plus}
              onClick={primaryAction.onClick}
              testId="btn-toolbar-primary"
            >
              {primaryAction.label}
            </PrimaryAction>
          )}
        </div>
      </div>
      {filters && filters.length > 0 && onFilter && (
        <div className={cn("flex items-center flex-wrap", DS.toolbar.filterGap)}>
          {filters.map((f) => (
            <FilterPill
              key={f.value}
              active={activeFilter === f.value}
              color={color}
              onClick={() => onFilter(f.value)}
              testId={`pill-filter-${f.value}`}
            >
              {f.label}
              {f.count !== undefined && (
                <span className="ml-1 opacity-70">({f.count})</span>
              )}
            </FilterPill>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DataTableContainer — locked table outer wrapper
// Always rounded-xl border bg-card overflow-hidden. Never Card + shadow-sm.
// ─────────────────────────────────────────────────────────────────────────────

export function DataTableContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(DS.table.container, className)} data-testid="data-table-container">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DataTH — locked table header cell
// Always px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wide
// ─────────────────────────────────────────────────────────────────────────────

type DataTHProps = ThHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right" | "center";
};

export function DataTH({ children, align = "left", className, ...rest }: DataTHProps) {
  return (
    <th
      className={cn(
        DS.table.headerCell,
        align === "left" && "text-left",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DataTD — locked table data cell
// Always px-4 py-3.5. Never py-3 or py-4 alone.
// ─────────────────────────────────────────────────────────────────────────────

type DataTDProps = TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right" | "center";
};

export function DataTD({ children, align = "left", className, ...rest }: DataTDProps) {
  return (
    <td
      className={cn(
        DS.table.dataCell,
        align === "left" && "text-left",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DataTR — locked table row with hover
// Always hover:bg-muted/20 transition-colors. Never muted/30 or muted/50.
// ─────────────────────────────────────────────────────────────────────────────

interface DataTRProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DataTR({ children, onClick, className, ...rest }: DataTRProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        DS.table.row,
        onClick && "cursor-pointer",
        className
      )}
      {...rest}
    >
      {children}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SortableDataTH — clickable column header with sort direction indicator
// Cycles: none → asc → desc → none
// ─────────────────────────────────────────────────────────────────────────────

interface SortableDataTHProps {
  sortKey: string;
  currentSort: { key: string; dir: "asc" | "desc" } | null;
  onSort: (key: string) => void;
  align?: "left" | "right" | "center";
  children: ReactNode;
  className?: string;
}

export function SortableDataTH({ sortKey, currentSort, onSort, align = "left", children, className }: SortableDataTHProps) {
  const isActive = currentSort?.key === sortKey;
  const handleClick = () => onSort(sortKey);

  return (
    <th
      onClick={handleClick}
      className={cn(
        DS.table.headerCell,
        "cursor-pointer select-none hover:text-foreground transition-colors",
        align === "left" && "text-left",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {isActive ? (
          currentSort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        ) : (
          <ArrowUpDown size={10} className="opacity-30" />
        )}
      </span>
    </th>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DetailSection — a labeled section inside DetailModal
// ─────────────────────────────────────────────────────────────────────────────

interface DetailSectionProps {
  title: string;
  children: ReactNode;
}

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <div className={DS.modal.sectionPadding} data-testid={`detail-section-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <h3 className={cn("mb-3", DS.typography.sectionLabel)}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DetailModal — locked large dialog
// Always max-w-2xl p-0 gap-0. Custom header (no DialogHeader). Scrollable body.
// ─────────────────────────────────────────────────────────────────────────────

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function DetailModal({
  open,
  onClose,
  title,
  subtitle,
  headerActions,
  footer,
  children,
}: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={cn(DS.modal.maxWidth, "p-0 gap-0 overflow-hidden")} data-testid="detail-modal">
        <div className={cn("flex items-start justify-between border-b", DS.modal.headerPadding)}>
          <div>
            <h2 className={DS.modal.titleSize} data-testid="modal-title">{title}</h2>
            {subtitle && (
              <p className={cn("mt-0.5", DS.modal.subtitleSize)} data-testid="modal-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <DialogClose asChild>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                data-testid="btn-modal-close"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>
        </div>

        <div className={cn(DS.modal.maxBodyHeight, "overflow-y-auto divide-y")} data-testid="modal-body">
          {children}
        </div>

        <div
          className={cn("flex items-center justify-end gap-2 border-t", DS.modal.footerBg, DS.modal.footerPadding)}
          data-testid="modal-footer"
        >
          {footer}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow — locked detail-page key-value primitive
// Always flex justify-between py-1.5. Label: text-sm text-muted-foreground.
// Value: text-sm font-medium. Use children for custom value rendering.
// FROZEN: Never redefine inline in a page. Always import from here.
// ─────────────────────────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value?: string | number;
  children?: ReactNode;
}

export function InfoRow({ label, value, children }: InfoRowProps) {
  return (
    <div className={cn("flex items-center justify-between", DS.infoRow.padding)} data-testid={`info-row-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <span className={DS.infoRow.labelStyle}>{label}</span>
      {children ?? <span className={DS.infoRow.valueStyle}>{value}</span>}
    </div>
  );
}
