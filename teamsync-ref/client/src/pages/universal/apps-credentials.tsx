import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Search,
  ExternalLink,
  Shield,
  AlertTriangle,
  Clock,
  Globe,
  Database,
  CreditCard,
  Cpu,
  BarChart3,
  MessageCircle,
  Palette,
  FileText,
  Users,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Mail,
  Key,
  Link2,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import {
  SiReplit,
  SiSupabase,
  SiGithub,
  SiStripe,
  SiVercel,
  SiOpenai,
  SiPosthog,
  SiCloudflare,
  SiFigma,
  SiNotion,
  SiAnthropic,
  SiResend,
  SiSlack,
  SiGmail,
  SiWhatsapp,
  SiZoom,
  SiCanva,
  SiJira,
  SiGoogledrive,
  SiGooglecalendar,
  SiGoogleads,
  SiMeta,
  SiRazorpay,
  SiZoho,
} from "react-icons/si";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import { sharedExternalApps, quickAddTemplates, type ExternalApp } from "@/lib/mock-data-shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type IconComponent = LucideIcon | ((props: { className?: string }) => JSX.Element);

const siIconMap: Record<string, IconComponent> = {
  SiReplit: (props: { className?: string }) => <SiReplit className={props.className} />,
  SiSupabase: (props: { className?: string }) => <SiSupabase className={props.className} />,
  SiGithub: (props: { className?: string }) => <SiGithub className={props.className} />,
  SiStripe: (props: { className?: string }) => <SiStripe className={props.className} />,
  SiVercel: (props: { className?: string }) => <SiVercel className={props.className} />,
  SiOpenai: (props: { className?: string }) => <SiOpenai className={props.className} />,
  SiPosthog: (props: { className?: string }) => <SiPosthog className={props.className} />,
  SiCloudflare: (props: { className?: string }) => <SiCloudflare className={props.className} />,
  SiFigma: (props: { className?: string }) => <SiFigma className={props.className} />,
  SiNotion: (props: { className?: string }) => <SiNotion className={props.className} />,
  SiAnthropic: (props: { className?: string }) => <SiAnthropic className={props.className} />,
  SiResend: (props: { className?: string }) => <SiResend className={props.className} />,
  SiSlack: (props: { className?: string }) => <SiSlack className={props.className} />,
  SiGmail: (props: { className?: string }) => <SiGmail className={props.className} />,
  SiWhatsapp: (props: { className?: string }) => <SiWhatsapp className={props.className} />,
  SiZoom: (props: { className?: string }) => <SiZoom className={props.className} />,
  SiCanva: (props: { className?: string }) => <SiCanva className={props.className} />,
  SiJira: (props: { className?: string }) => <SiJira className={props.className} />,
  SiGoogledrive: (props: { className?: string }) => <SiGoogledrive className={props.className} />,
  SiGooglecalendar: (props: { className?: string }) => <SiGooglecalendar className={props.className} />,
  SiGoogleads: (props: { className?: string }) => <SiGoogleads className={props.className} />,
  SiMeta: (props: { className?: string }) => <SiMeta className={props.className} />,
  SiRazorpay: (props: { className?: string }) => <SiRazorpay className={props.className} />,
  SiZoho: (props: { className?: string }) => <SiZoho className={props.className} />,
};

function getIcon(iconName: string): IconComponent {
  if (siIconMap[iconName]) return siIconMap[iconName];
  return Globe;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  hosting: Globe,
  database: Database,
  ai: Cpu,
  payment: CreditCard,
  analytics: BarChart3,
  communication: MessageCircle,
  design: Palette,
  docs: FileText,
  crm: Users,
  hr: Users,
  productivity: Briefcase,
  other: Globe,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", icon: Shield },
  expired: { label: "Expired", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", icon: AlertTriangle },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300", icon: Clock },
};

const ENV_COLORS: Record<string, string> = {
  production: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  staging: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  dev: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function formatCategory(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function UniversalAppsCredentials() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const loading = useSimulatedLoading(400);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<ExternalApp | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const allApps = useMemo(() => {
    if (!vertical) return [];
    const globalApps = sharedExternalApps.filter((a) => a.isGlobal);
    const verticalApps = sharedExternalApps.filter((a) => a.verticalId === vertical.id);
    return [...globalApps, ...verticalApps];
  }, [vertical]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allApps.forEach((a) => set.add(a.category));
    return Array.from(set).sort();
  }, [allApps]);

  const filtered = useMemo(() => {
    let result = allApps;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.appName.toLowerCase().includes(q) ||
          a.notes.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.email && a.email.toLowerCase().includes(q))
      );
    }
    if (categoryFilter !== "all") result = result.filter((a) => a.category === categoryFilter);
    if (statusFilter !== "all") result = result.filter((a) => a.status === statusFilter);
    if (scopeFilter === "global") result = result.filter((a) => a.isGlobal);
    if (scopeFilter === "vertical") result = result.filter((a) => !a.isGlobal);
    return result;
  }, [allApps, searchQuery, categoryFilter, statusFilter, scopeFilter]);

  const globalCount = allApps.filter((a) => a.isGlobal).length;
  const verticalCount = allApps.filter((a) => !a.isGlobal).length;
  const withCredentials = allApps.filter((a) => a.email || a.apiKeyHint).length;
  const activeCount = allApps.filter((a) => a.status === "active").length;

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      toast({ title: "Copied", description: "Value copied to clipboard." });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const togglePassword = (appId: string) => {
    setShowPasswords((prev) => ({ ...prev, [appId]: !prev[appId] }));
  };

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-64" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold font-heading" data-testid="text-page-title">
                Apps & Credentials
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                External app directory and credential vault for {vertical?.shortName || "your team"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search apps, emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                  data-testid="input-search-apps"
                />
              </div>
              <Button size="sm" onClick={() => setQuickAddOpen(true)} data-testid="button-quick-add">
                <Plus className="size-4 mr-1.5" />
                Quick Add
              </Button>
            </div>
          </div>

          <Fade>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryCard label="Total Apps" value={allApps.length} color="text-foreground" testId="stat-total" />
              <SummaryCard label="With Credentials" value={withCredentials} color="text-blue-600 dark:text-blue-400" testId="stat-credentials" />
              <SummaryCard label="Global Apps" value={globalCount} color="text-emerald-600 dark:text-emerald-400" testId="stat-global" />
              <SummaryCard label={`${vertical?.shortName || "Vertical"} Apps`} value={verticalCount} color="text-purple-600 dark:text-purple-400" testId="stat-vertical" />
            </div>
          </Fade>

          <div className="flex flex-wrap gap-2">
            <FilterChip label="All" active={scopeFilter === "all"} onClick={() => setScopeFilter("all")} testId="filter-scope-all" />
            <FilterChip label="Global" active={scopeFilter === "global"} onClick={() => setScopeFilter("global")} testId="filter-scope-global" />
            <FilterChip label={vertical?.shortName || "Vertical"} active={scopeFilter === "vertical"} onClick={() => setScopeFilter("vertical")} testId="filter-scope-vertical" />
            <div className="w-px bg-border mx-1" />
            <FilterChip label="All Categories" active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} testId="filter-category-all" />
            {categories.map((c) => (
              <FilterChip key={c} label={formatCategory(c)} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} testId={`filter-category-${c}`} />
            ))}
            <div className="w-px bg-border mx-1" />
            <FilterChip label="All Status" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} testId="filter-status-all" />
            <FilterChip label="Active" active={statusFilter === "active"} onClick={() => setStatusFilter("active")} testId="filter-status-active" />
            <FilterChip label="Expired" active={statusFilter === "expired"} onClick={() => setStatusFilter("expired")} testId="filter-status-expired" />
            <FilterChip label="Pending" active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} testId="filter-status-pending" />

            <span className="text-xs text-muted-foreground ml-auto self-center" data-testid="text-result-count">
              {filtered.length} of {allApps.length} apps
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground" data-testid="text-empty-state">
              <Globe className="size-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No apps found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <Stagger staggerDelay={0.04}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((app) => (
                  <StaggerItem key={app.id}>
                    <AppCard
                      app={app}
                      verticalColor={vertical?.color}
                      onSelect={() => setSelectedApp(app)}
                      showPassword={showPasswords[app.id]}
                      onTogglePassword={() => togglePassword(app.id)}
                      onCopy={handleCopy}
                      copiedField={copiedField}
                    />
                  </StaggerItem>
                ))}
              </div>
            </Stagger>
          )}
        </div>
      </PageTransition>

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-lg">
          {selectedApp && (
            <AppDetailDialog
              app={selectedApp}
              verticalColor={vertical?.color}
              showPassword={showPasswords[selectedApp.id]}
              onTogglePassword={() => togglePassword(selectedApp.id)}
              onCopy={handleCopy}
              copiedField={copiedField}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle data-testid="text-quick-add-title">Quick Add App</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-3">
            Choose a popular app to add with pre-filled details:
          </p>
          <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
            {quickAddTemplates.map((tmpl) => {
              const TmplIcon = getIcon(tmpl.iconName);
              return (
                <button
                  key={tmpl.appName}
                  onClick={() => {
                    toast({ title: `${tmpl.appName} added`, description: "Fill in your credentials in the app card." });
                    setQuickAddOpen(false);
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-center"
                  data-testid={`button-quick-add-${tmpl.appName.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <TmplIcon className="size-5 text-muted-foreground" />
                  <span className="text-xs font-medium truncate w-full">{tmpl.appName}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function SummaryCard({ label, value, color, testId }: { label: string; value: number; color: string; testId: string }) {
  return (
    <Card className="border bg-card" data-testid={testId}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`text-2xl font-bold font-heading mt-1 ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function FilterChip({ label, active, onClick, testId }: { label: string; active: boolean; onClick: () => void; testId: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
      data-testid={testId}
    >
      {label}
    </button>
  );
}

function AppCard({
  app,
  verticalColor,
  onSelect,
  showPassword,
  onTogglePassword,
  onCopy,
  copiedField,
}: {
  app: ExternalApp;
  verticalColor?: string;
  onSelect: () => void;
  showPassword?: boolean;
  onTogglePassword: () => void;
  onCopy: (text: string, fieldId: string) => void;
  copiedField: string | null;
}) {
  const Icon = getIcon(app.iconName);
  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.active;
  const StatusIcon = statusCfg.icon;
  const CatIcon = CATEGORY_ICONS[app.category] || Globe;

  return (
    <Card
      className="border bg-card hover:shadow-md transition-shadow group cursor-pointer"
      data-testid={`card-app-${app.id}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div
            className="size-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: verticalColor ? `${verticalColor}15` : "hsl(var(--muted))" }}
          >
            <Icon className="size-5" style={{ color: verticalColor || "hsl(var(--foreground))" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold truncate" data-testid={`text-app-name-${app.id}`}>
                {app.appName}
              </h3>
              {app.loginUrl && (
                <a
                  href={app.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`link-login-${app.id}`}
                >
                  <ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" />
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{app.notes}</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${statusCfg.color} border-0`}>
            <StatusIcon className="size-3 mr-1" />
            {statusCfg.label}
          </Badge>
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${ENV_COLORS[app.environment] || ""} border-0`}>
            {app.environment}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
            <CatIcon className="size-3 mr-1" />
            {formatCategory(app.category)}
          </Badge>
          {app.isGlobal && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-0">
              Global
            </Badge>
          )}
        </div>

        {(app.email || app.apiKeyHint) && (
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            {app.email && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50">
                <Mail className="size-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate flex-1 font-mono">{app.email}</span>
                <button
                  onClick={() => onCopy(app.email!, `email-${app.id}`)}
                  className="shrink-0"
                  data-testid={`button-copy-email-${app.id}`}
                >
                  {copiedField === `email-${app.id}` ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
            )}
            {app.password && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50">
                <Key className="size-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
                  {showPassword ? "S3cur3P@ss#2026" : app.password}
                </span>
                <button
                  onClick={onTogglePassword}
                  className="shrink-0"
                  data-testid={`button-toggle-password-${app.id}`}
                >
                  {showPassword ? (
                    <EyeOff className="size-3 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="size-3 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
            )}
            {!app.email && app.apiKeyHint && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50">
                <Shield className="size-3 text-muted-foreground shrink-0" />
                <span className="text-xs font-mono text-muted-foreground">{app.apiKeyHint}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AppDetailDialog({
  app,
  verticalColor,
  showPassword,
  onTogglePassword,
  onCopy,
  copiedField,
}: {
  app: ExternalApp;
  verticalColor?: string;
  showPassword?: boolean;
  onTogglePassword: () => void;
  onCopy: (text: string, fieldId: string) => void;
  copiedField: string | null;
}) {
  const Icon = getIcon(app.iconName);
  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.active;

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div
            className="size-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: verticalColor ? `${verticalColor}15` : "hsl(var(--muted))" }}
          >
            <Icon className="size-6" style={{ color: verticalColor || "hsl(var(--foreground))" }} />
          </div>
          <div>
            <DialogTitle className="text-lg" data-testid="text-detail-app-name">{app.appName}</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {app.isGlobal ? "Global App" : `${formatCategory(app.category)}`} · {statusCfg.label}
            </p>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 mt-3">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Description</Label>
          <p className="text-sm text-foreground mt-1" data-testid="text-detail-notes">{app.notes}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Login Credentials</Label>

          {app.loginUrl && (
            <CredentialRow
              icon={Link2}
              label="Login URL"
              value={app.loginUrl}
              fieldId={`detail-url-${app.id}`}
              onCopy={onCopy}
              copiedField={copiedField}
              isLink
            />
          )}

          {app.email && (
            <CredentialRow
              icon={Mail}
              label="Email / Username"
              value={app.email}
              fieldId={`detail-email-${app.id}`}
              onCopy={onCopy}
              copiedField={copiedField}
            />
          )}

          {app.password && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border">
              <Key className="size-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Password</p>
                <p className="text-sm font-mono text-foreground truncate">
                  {showPassword ? "S3cur3P@ss#2026" : app.password}
                </p>
              </div>
              <button
                onClick={onTogglePassword}
                className="shrink-0 p-1"
                data-testid={`button-detail-toggle-password-${app.id}`}
              >
                {showPassword ? (
                  <EyeOff className="size-3.5 text-muted-foreground hover:text-foreground" />
                ) : (
                  <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
              <button
                onClick={() => onCopy("S3cur3P@ss#2026", `detail-pwd-${app.id}`)}
                className="shrink-0 p-1"
                data-testid={`button-detail-copy-password-${app.id}`}
              >
                {copiedField === `detail-pwd-${app.id}` ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </div>
          )}

          {app.apiKeyHint && (
            <CredentialRow
              icon={Shield}
              label="API Key"
              value={app.apiKeyHint}
              fieldId={`detail-api-${app.id}`}
              onCopy={onCopy}
              copiedField={copiedField}
            />
          )}
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <Badge variant="outline" className={`text-xs px-2.5 py-0.5 ${statusCfg.color} border-0`}>
            {statusCfg.label}
          </Badge>
          <Badge variant="outline" className={`text-xs px-2.5 py-0.5 ${ENV_COLORS[app.environment] || ""} border-0`}>
            {app.environment}
          </Badge>
          {app.isGlobal && (
            <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-0">
              Global
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          {app.loginUrl && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => window.open(app.loginUrl, "_blank")}
              data-testid="button-detail-login"
            >
              <ExternalLink className="size-4 mr-1.5" />
              Open Login
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(app.url, "_blank")}
            data-testid="button-detail-open"
          >
            <Globe className="size-4 mr-1.5" />
            Open App
          </Button>
        </div>
      </div>
    </>
  );
}

function CredentialRow({
  icon: Icon,
  label,
  value,
  fieldId,
  onCopy,
  copiedField,
  isLink,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  fieldId: string;
  onCopy: (text: string, fieldId: string) => void;
  copiedField: string | null;
  isLink?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border">
      <Icon className="size-3.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-primary hover:underline truncate block"
            data-testid={`link-${fieldId}`}
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-mono text-foreground truncate">{value}</p>
        )}
      </div>
      <button
        onClick={() => onCopy(value, fieldId)}
        className="shrink-0 p-1"
        data-testid={`button-copy-${fieldId}`}
      >
        {copiedField === fieldId ? (
          <Check className="size-3.5 text-emerald-500" />
        ) : (
          <Copy className="size-3.5 text-muted-foreground hover:text-foreground" />
        )}
      </button>
    </div>
  );
}