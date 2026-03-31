import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import {
  ArrowLeft,
  Copy,
  CreditCard,
  Edit,
  TicketCheck,
  User,
  Building2,
  GraduationCap,
  Shield,
  Briefcase,
  Clock,
  StickyNote,
  Check,
  ChevronRight,
  Lock,
  Unlock,
  LogIn,
  BookOpen,
  Store,
  Package,
  UserCircle,
  Send,
  Filter,
} from "lucide-react";
import { PageShell } from "@/components/layout";
import { PageTransition } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ds/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  type DetailedUser,
  type LLCStatus,
  LLC_STAGES,
  detailedUsers,
  getDetailedUser,
  externalUsers,
} from "@/lib/mock-data-sales";
import { SALES_COLOR } from "@/lib/sales-config";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTimestamp = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const planColors: Record<string, { variant: "success" | "error" | "warning" | "neutral" | "info" }> = {
  free: { variant: "neutral" },
  starter: { variant: "info" },
  pro: { variant: "warning" },
  enterprise: { variant: "success" },
};

const statusColors: Record<string, { variant: "success" | "error" | "warning" | "neutral" | "info" }> = {
  active: { variant: "success" },
  churned: { variant: "error" },
  trial: { variant: "info" },
  paused: { variant: "warning" },
};

const roleColors: Record<string, { variant: "success" | "error" | "warning" | "neutral" | "info" }> = {
  user: { variant: "neutral" },
  mentor: { variant: "info" },
  admin: { variant: "warning" },
};

const activityIcons: Record<string, typeof LogIn> = {
  login: LogIn,
  purchase: CreditCard,
  course: BookOpen,
  llc: Building2,
  support: TicketCheck,
  store: Store,
  product: Package,
  profile: UserCircle,
};

function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const loading = useSimulatedLoading();
  const [activeTab, setActiveTab] = useState("overview");

  const user = useMemo(() => {
    if (!id) return undefined;
    const detailed = getDetailedUser(id);
    if (detailed) return detailed;
    const basic = externalUsers.find((u) => u.id === id);
    if (!basic) return undefined;
    return {
      ...basic,
      phone: "",
      role: "user" as const,
      batchName: "Unassigned",
      weekNumber: 0,
      llcStatus: "pending" as LLCStatus,
      llcName: "",
      llcState: "",
      shopifyConnected: basic.storesConnected > 0,
      shopifyDomain: "",
      pipelineStage: "new" as const,
      progress: 0,
      city: "",
      country: "",
      ein: "",
      website: "",
      instagram: "",
      tiktok: "",
      llcMilestones: {},
      courses: [],
      featureAccess: [],
      activityLog: [],
      adminNotes: [],
      paymentLinks: [],
      supportTickets: [],
    } satisfies DetailedUser;
  }, [id]);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [featureOverrides, setFeatureOverrides] = useState<Record<string, boolean>>({});
  const [activityFilter, setActivityFilter] = useState("all");

  if (loading) {
    return (
      <PageShell>
        <PageTransition>
          <UserDetailSkeleton />
        </PageTransition>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <PageTransition>
          <div className="flex flex-col items-center justify-center py-20 space-y-4" data-testid="user-not-found">
            <User className="size-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">User Not Found</h2>
            <p className="text-sm text-muted-foreground">The user with ID "{id}" could not be found.</p>
            <Button variant="outline" onClick={() => navigate("/usdrop/users")} data-testid="button-back-users">
              <ArrowLeft className="size-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </PageTransition>
      </PageShell>
    );
  }

  const copyWhatsApp = () => {
    const msg = `Hi ${user.name}, this is a message from USDrop AI support. How can we help you today?`;
    navigator.clipboard.writeText(msg);
    toast({ title: "Copied", description: "WhatsApp message copied to clipboard" });
  };

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const filteredActivity = user.activityLog.filter(
    (a) => activityFilter === "all" || a.type === activityFilter,
  );

  return (
    <PageShell>
      <PageTransition>
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/usdrop/users")}
            data-testid="button-back-users"
          >
            <ArrowLeft className="size-4 mr-1" />
            Back to Users
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="text-lg font-semibold" style={{ backgroundColor: SALES_COLOR + "20", color: SALES_COLOR }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold font-heading" data-testid="text-user-name">{user.name}</h1>
                <p className="text-sm text-muted-foreground" data-testid="text-user-email">{user.email}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <StatusBadge status={user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} variant={planColors[user.plan]?.variant} />
                  <StatusBadge status={user.status.charAt(0).toUpperCase() + user.status.slice(1)} variant={statusColors[user.status]?.variant} />
                  <StatusBadge status={user.role.charAt(0).toUpperCase() + user.role.slice(1)} variant={roleColors[user.role]?.variant} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={copyWhatsApp} data-testid="button-copy-whatsapp">
                <Copy className="size-4 mr-1" />
                Copy WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Ticket", description: "Create ticket flow would open here" })} data-testid="button-create-ticket">
                <TicketCheck className="size-4 mr-1" />
                Create Ticket
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Payment Link", description: "Payment link sender would open here" })} data-testid="button-send-payment">
                <CreditCard className="size-4 mr-1" />
                Send Payment Link
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditProfileOpen(true)} data-testid="button-edit-profile">
                <Edit className="size-4 mr-1" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => setChangePlanOpen(true)} data-testid="button-change-plan">
                <Shield className="size-4 mr-1" />
                Change Plan
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto" data-testid="user-detail-tabs">
              <TabsTrigger value="overview" data-testid="tab-overview"><User className="size-4 mr-1" /> Overview</TabsTrigger>
              <TabsTrigger value="llc" data-testid="tab-llc"><Building2 className="size-4 mr-1" /> LLC Status</TabsTrigger>
              <TabsTrigger value="learning" data-testid="tab-learning"><GraduationCap className="size-4 mr-1" /> Learning</TabsTrigger>
              <TabsTrigger value="access" data-testid="tab-access"><Shield className="size-4 mr-1" /> Feature Access</TabsTrigger>
              <TabsTrigger value="business" data-testid="tab-business"><Briefcase className="size-4 mr-1" /> Business Info</TabsTrigger>
              <TabsTrigger value="activity" data-testid="tab-activity"><Clock className="size-4 mr-1" /> Activity Log</TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-notes"><StickyNote className="size-4 mr-1" /> Notes & History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-6" data-testid="tab-content-overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Phone</span><p className="font-medium" data-testid="text-phone">{user.phone || "N/A"}</p></div>
                    <div><span className="text-muted-foreground">Location</span><p className="font-medium" data-testid="text-location">{user.city && user.country ? `${user.city}, ${user.country}` : "N/A"}</p></div>
                    <div><span className="text-muted-foreground">Signup Date</span><p className="font-medium">{formatDate(user.signupDate)}</p></div>
                    <div><span className="text-muted-foreground">Last Login</span><p className="font-medium">{formatDate(user.lastLogin)}</p></div>
                    <div><span className="text-muted-foreground">Stores Connected</span><p className="font-medium">{user.storesConnected}</p></div>
                    <div><span className="text-muted-foreground">Products Imported</span><p className="font-medium">{user.productsImported}</p></div>
                  </div>
                </Card>

                <Card className="p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Business Snapshot</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Batch</span><p className="font-medium" data-testid="text-batch">{user.batchName}</p></div>
                    <div><span className="text-muted-foreground">Week</span><p className="font-medium" data-testid="text-week">{user.weekNumber}</p></div>
                    <div><span className="text-muted-foreground">LLC Status</span><p className="font-medium">{LLC_STAGES.find((s) => s.key === user.llcStatus)?.label || user.llcStatus}</p></div>
                    <div><span className="text-muted-foreground">Shopify</span><p className="font-medium">{user.shopifyConnected ? "Connected" : "Not Connected"}</p></div>
                    <div><span className="text-muted-foreground">Pipeline</span><p className="font-medium capitalize">{user.pipelineStage.replace("_", " ")}</p></div>
                    <div><span className="text-muted-foreground">Revenue</span><p className="font-medium">{formatCurrency(user.revenue)}</p></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-medium">{user.progress}%</span>
                    </div>
                    <Progress value={user.progress} className="h-2" data-testid="progress-overview" />
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="llc" className="mt-4 space-y-6" data-testid="tab-content-llc">
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">LLC Timeline</h3>
                    {user.llcName && <p className="text-sm font-medium mt-1">{user.llcName} ({user.llcState})</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: "Move to Next Stage", description: "This would advance the LLC to the next milestone" })}
                    data-testid="button-next-stage"
                  >
                    <ChevronRight className="size-4 mr-1" />
                    Move to Next Stage
                  </Button>
                </div>
                <div className="relative pl-6">
                  {LLC_STAGES.map((stage, idx) => {
                    const milestoneDate = user.llcMilestones[stage.key];
                    const isComplete = !!milestoneDate;
                    const isCurrent = user.llcStatus === stage.key;
                    return (
                      <div key={stage.key} className="relative pb-6 last:pb-0" data-testid={`llc-milestone-${stage.key}`}>
                        <div
                          className={cn(
                            "absolute left-[-18px] top-1 size-3.5 rounded-full border-2",
                            isComplete
                              ? "border-emerald-500 bg-emerald-500"
                              : isCurrent
                                ? "border-amber-500 bg-amber-500"
                                : "border-muted-foreground/30 bg-background",
                          )}
                        />
                        {idx < LLC_STAGES.length - 1 && (
                          <div
                            className={cn(
                              "absolute left-[-13px] top-5 w-0.5 h-full",
                              isComplete ? "bg-emerald-500/40" : "bg-muted-foreground/15",
                            )}
                          />
                        )}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className={cn("text-sm font-medium", isCurrent && "font-semibold")}>{stage.label}</p>
                            {milestoneDate && (
                              <p className="text-xs text-muted-foreground">{formatDate(milestoneDate)}</p>
                            )}
                            {isCurrent && !isComplete && (
                              <Badge variant="secondary" className="mt-1 text-xs bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Current Stage</Badge>
                            )}
                          </div>
                          {isComplete && <Check className="size-4 text-emerald-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="learning" className="mt-4 space-y-6" data-testid="tab-content-learning">
              {user.courses.length === 0 ? (
                <Card className="p-8 text-center">
                  <GraduationCap className="size-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No courses enrolled yet</p>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                      <p className="text-2xl font-bold">{user.courses.length}</p>
                      <p className="text-xs text-muted-foreground">Enrolled Courses</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <p className="text-2xl font-bold">{user.courses.filter((c) => c.progress === 100).length}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <p className="text-2xl font-bold">{Math.round(user.courses.reduce((sum, c) => sum + c.progress, 0) / user.courses.length)}%</p>
                      <p className="text-xs text-muted-foreground">Avg. Progress</p>
                    </Card>
                  </div>
                  <div className="space-y-3">
                    {user.courses.map((course) => (
                      <Card key={course.courseId} className="p-4" data-testid={`course-progress-${course.courseId}`}>
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div>
                            <p className="text-sm font-medium">{course.courseTitle}</p>
                            <p className="text-xs text-muted-foreground">{course.completedModules}/{course.totalModules} modules</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{course.progress}%</p>
                            <p className="text-xs text-muted-foreground">Last: {formatDate(course.lastAccessed)}</p>
                          </div>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="access" className="mt-4 space-y-6" data-testid="tab-content-access">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Feature Access Rules</h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const overrides: Record<string, boolean> = {};
                      user.featureAccess.forEach((f) => { overrides[f.key] = true; });
                      setFeatureOverrides(overrides);
                      toast({ title: "Unlocked All", description: "All features unlocked for this user" });
                    }}
                    data-testid="button-unlock-all"
                  >
                    <Unlock className="size-4 mr-1" />
                    Unlock All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFeatureOverrides({});
                      toast({ title: "Reset", description: "Features reset to plan defaults" });
                    }}
                    data-testid="button-lock-defaults"
                  >
                    <Lock className="size-4 mr-1" />
                    Reset to Defaults
                  </Button>
                </div>
              </div>
              <Card>
                <div className="divide-y">
                  {user.featureAccess.map((feature) => {
                    const isEnabled = featureOverrides[feature.key] !== undefined ? featureOverrides[feature.key] : feature.enabled;
                    return (
                      <div key={feature.key} className="flex items-center justify-between px-4 py-3" data-testid={`feature-${feature.key}`}>
                        <div>
                          <p className="text-sm font-medium">{feature.label}</p>
                          <p className="text-xs text-muted-foreground">Required plan: {feature.plan}</p>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) =>
                            setFeatureOverrides((prev) => ({ ...prev, [feature.key]: checked }))
                          }
                          data-testid={`toggle-${feature.key}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="mt-4 space-y-6" data-testid="tab-content-business">
              <Card className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">LLC Name</label>
                    <Input defaultValue={user.llcName} data-testid="input-llc-name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">EIN</label>
                    <Input defaultValue={user.ein} placeholder="XX-XXXXXXX" data-testid="input-ein" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Website</label>
                    <Input defaultValue={user.website} placeholder="https://" data-testid="input-website" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Shopify Domain</label>
                    <Input defaultValue={user.shopifyDomain} placeholder="store.myshopify.com" data-testid="input-shopify-domain" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Instagram</label>
                    <Input defaultValue={user.instagram} placeholder="@handle" data-testid="input-instagram" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">TikTok</label>
                    <Input defaultValue={user.tiktok} placeholder="@handle" data-testid="input-tiktok" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    style={{ backgroundColor: SALES_COLOR }}
                    className="text-white border-transparent"
                    onClick={() => toast({ title: "Saved", description: "Business information updated" })}
                    data-testid="button-save-business"
                  >
                    Save Changes
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 space-y-4" data-testid="tab-content-activity">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="size-4 text-muted-foreground" />
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-40" data-testid="select-activity-filter">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">{filteredActivity.length} entries</span>
              </div>
              {filteredActivity.length === 0 ? (
                <Card className="p-8 text-center">
                  <Clock className="size-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No activity logs found</p>
                </Card>
              ) : (
                <Card>
                  <div className="divide-y">
                    {filteredActivity.map((entry) => {
                      const Icon = activityIcons[entry.type] || Clock;
                      return (
                        <div key={entry.id} className="flex items-start gap-3 px-4 py-3" data-testid={`activity-${entry.id}`}>
                          <div className="mt-0.5 flex items-center justify-center size-7 rounded-md bg-muted">
                            <Icon className="size-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{entry.description}</p>
                            <p className="text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs capitalize">{entry.type}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-4 space-y-6" data-testid="tab-content-notes">
              <Card className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admin Notes</h3>
                <div className="flex gap-2">
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note about this user..."
                    className="resize-none text-sm"
                    rows={3}
                    data-testid="textarea-admin-note"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (noteText.trim()) {
                        toast({ title: "Note Added", description: "Admin note saved successfully" });
                        setNoteText("");
                      }
                    }}
                    data-testid="button-add-note"
                  >
                    <Send className="size-4 mr-1" />
                    Add Note
                  </Button>
                </div>
                <Separator />
                {user.adminNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No admin notes yet</p>
                ) : (
                  <div className="space-y-3">
                    {user.adminNotes.map((note) => (
                      <div key={note.id} className="rounded-md border p-3" data-testid={`admin-note-${note.id}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium">{note.author}</p>
                          <p className="text-xs text-muted-foreground">{formatTimestamp(note.createdAt)}</p>
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Payment Link History</h3>
                {user.paymentLinks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No payment links sent</p>
                ) : (
                  <div className="divide-y">
                    {user.paymentLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between py-3" data-testid={`payment-link-${link.id}`}>
                        <div>
                          <p className="text-sm font-medium">{link.description}</p>
                          <p className="text-xs text-muted-foreground">Sent: {formatTimestamp(link.sentAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(link.amount)}</p>
                          <StatusBadge
                            status={link.status.charAt(0).toUpperCase() + link.status.slice(1)}
                            variant={link.status === "paid" ? "success" : link.status === "expired" ? "error" : "info"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Support Ticket History</h3>
                {user.supportTickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No support tickets</p>
                ) : (
                  <div className="divide-y">
                    {user.supportTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between py-3" data-testid={`ticket-${ticket.id}`}>
                        <div>
                          <p className="text-sm font-medium">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground">{ticket.id} &middot; {formatDate(ticket.createdDate)}</p>
                        </div>
                        <StatusBadge status={ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent data-testid="dialog-edit-profile">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Name</label>
                <Input defaultValue={user.name} data-testid="input-edit-name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Email</label>
                <Input defaultValue={user.email} data-testid="input-edit-email" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Phone</label>
                <Input defaultValue={user.phone} data-testid="input-edit-phone" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditProfileOpen(false)} data-testid="button-cancel-edit">Cancel</Button>
              <Button
                style={{ backgroundColor: SALES_COLOR }}
                className="text-white border-transparent"
                onClick={() => {
                  setEditProfileOpen(false);
                  toast({ title: "Profile Updated", description: "User profile has been saved" });
                }}
                data-testid="button-save-edit"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
          <DialogContent data-testid="dialog-change-plan">
            <DialogHeader>
              <DialogTitle>Change Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Current plan: <span className="font-medium capitalize">{user.plan}</span></p>
              <Select defaultValue={user.plan}>
                <SelectTrigger data-testid="select-new-plan">
                  <SelectValue placeholder="Select new plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter ($29/mo)</SelectItem>
                  <SelectItem value="pro">Pro ($79/mo)</SelectItem>
                  <SelectItem value="enterprise">Enterprise ($199/mo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setChangePlanOpen(false)} data-testid="button-cancel-plan">Cancel</Button>
              <Button
                style={{ backgroundColor: SALES_COLOR }}
                className="text-white border-transparent"
                onClick={() => {
                  setChangePlanOpen(false);
                  toast({ title: "Plan Changed", description: "User plan has been updated" });
                }}
                data-testid="button-save-plan"
              >
                Update Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </PageShell>
  );
}
