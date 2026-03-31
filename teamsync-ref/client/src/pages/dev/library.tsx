import { useState } from "react";
import {
  Users, TrendingUp, DollarSign, Clock, Plus, Download, Mail,
  BarChart3, Shield
} from "lucide-react";
import { PageShell, PageHeader, HeroBanner, StatCard, StatGrid, SectionCard,
  SectionGrid, FilterPill, PrimaryAction, IndexToolbar, DataTableContainer,
  DataTH, DataTD, DataTR, DetailModal, DetailSection, InfoRow
} from "@/components/layout";
import { DataTable, type Column, type RowAction } from "@/components/ds/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ds/status-badge";
import { cn } from "@/lib/utils";

const BRAND = "#225AEA";

const sampleTableData = [
  { id: "1", name: "Acme Corp", status: "Active", priority: "High", amount: "$12,500", date: "Mar 1, 2026", assignee: "SP" },
  { id: "2", name: "Widget Inc", status: "Pending", priority: "Medium", amount: "$8,200", date: "Mar 3, 2026", assignee: "AK" },
  { id: "3", name: "TechStart LLC", status: "Active", priority: "Low", amount: "$4,800", date: "Mar 5, 2026", assignee: "RK" },
  { id: "4", name: "DataFlow AI", status: "Completed", priority: "High", amount: "$22,100", date: "Feb 28, 2026", assignee: "VS" },
  { id: "5", name: "CloudNine SaaS", status: "Active", priority: "Medium", amount: "$15,300", date: "Mar 7, 2026", assignee: "PK" },
];

const sampleColumns: Column<typeof sampleTableData[0]>[] = [
  { key: "name", header: "Company", sortable: true, render: (r) => <CompanyCell name={r.name} size="xs" /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status as "Active" | "Pending" | "Completed"} /> },
  { key: "priority", header: "Priority", render: (r) => (
    <Badge variant={r.priority === "High" ? "destructive" : r.priority === "Medium" ? "default" : "secondary"}>
      {r.priority}
    </Badge>
  )},
  { key: "amount", header: "Amount", sortable: true, render: (r) => <span className="tabular-nums font-medium">{r.amount}</span> },
  { key: "date", header: "Date", sortable: true },
  { key: "assignee", header: "Assignee", render: (r) => (
    <PersonCell name={r.assignee} size="xs" />
  )},
];

const sampleRowActions: RowAction<typeof sampleTableData[0]>[] = [
  { label: "View Details", onClick: () => {} },
  { label: "Edit", onClick: () => {} },
  { label: "Delete", onClick: () => {}, variant: "destructive", separator: true, confirmMessage: "Are you sure?" },
];

const kanbanColumns = [
  { title: "To Do", color: "#6B7280", items: [
    { id: "k1", title: "Review wireframes", priority: "High", assignee: "SP" },
    { id: "k2", title: "Set up CI pipeline", priority: "Medium", assignee: "AK" },
  ]},
  { title: "In Progress", color: "#3B82F6", items: [
    { id: "k3", title: "API integration", priority: "High", assignee: "RK" },
  ]},
  { title: "Review", color: "#F59E0B", items: [
    { id: "k4", title: "Dashboard redesign", priority: "Low", assignee: "VS" },
    { id: "k5", title: "Auth flow update", priority: "Medium", assignee: "PK" },
  ]},
  { title: "Done", color: "#10B981", items: [
    { id: "k6", title: "Database migration", priority: "High", assignee: "SP" },
  ]},
];

function SectionTitle({ title, description, usedIn }: { title: string; description: string; usedIn: string[] }) {
  return (
    <div className="mb-4 pb-3 border-b">
      <h3 className="text-lg font-bold font-heading" data-testid={`lib-section-${title.toLowerCase().replace(/\s+/g, "-")}`}>{title}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Used in:</span>
        {usedIn.map((p) => (
          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p}</span>
        ))}
      </div>
    </div>
  );
}

function LibSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-6 py-6", className)}>{children}</div>;
}

function DataTableFullExample() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  return (
    <div className="space-y-4">
      <SectionTitle
        title="DataTable (Full-Featured)"
        description="Shared DataTable from @/components/ds/data-table — search, sort, filters, pagination, row actions, bulk select, empty states."
        usedIn={["Tickets", "Clients", "Pipeline", "Employees", "Orders", "Budget", "Attendees"]}
      />
      <DataTable
        data={sampleTableData}
        columns={sampleColumns}
        searchPlaceholder="Search companies..."
        rowActions={sampleRowActions}
        filters={[
          { label: "Status", key: "status", options: ["Active", "Pending", "Completed"] },
          { label: "Priority", key: "priority", options: ["High", "Medium", "Low"] },
        ]}
        pageSize={5}
        emptyTitle="No companies found"
        emptyDescription="Try adjusting your search or filters."
      />
    </div>
  );
}

function ManualTableExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Manual Table (Layout Primitives)"
        description="DataTableContainer + DataTH/DataTD/DataTR from @/components/layout — for complex custom layouts. Used when DataTable is too rigid."
        usedIn={["HRMS Employees", "CRM Contacts", "Finance Ledger", "OMS Orders", "ATS Jobs"]}
      />
      <DataTableContainer>
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <DataTH>Employee</DataTH>
              <DataTH>Department</DataTH>
              <DataTH>Role</DataTH>
              <DataTH align="right">Salary</DataTH>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[
              { name: "Sneha Patel", dept: "Engineering", role: "Lead", salary: "₹18,50,000" },
              { name: "Arjun Mehta", dept: "Design", role: "Senior", salary: "₹14,20,000" },
              { name: "Priya Kapoor", dept: "Marketing", role: "Manager", salary: "₹16,00,000" },
            ].map((e) => (
              <DataTR key={e.name}>
                <DataTD>
                  <PersonCell name={e.name} size="sm" />
                </DataTD>
                <DataTD><span className="text-sm">{e.dept}</span></DataTD>
                <DataTD><Badge variant="secondary">{e.role}</Badge></DataTD>
                <DataTD align="right"><span className="text-sm font-medium tabular-nums">{e.salary}</span></DataTD>
              </DataTR>
            ))}
          </tbody>
        </table>
      </DataTableContainer>
    </div>
  );
}

function IndexToolbarExample() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  return (
    <div className="space-y-4">
      <SectionTitle
        title="IndexToolbar"
        description="Unified search + filter pills + primary action bar from @/components/layout. Standard page-top toolbar."
        usedIn={["Tickets", "Tasks", "Employees", "Contacts", "Resources", "All Index Pages"]}
      />
      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={[
          { value: "all", label: "All", count: 42 },
          { value: "active", label: "Active", count: 28 },
          { value: "pending", label: "Pending", count: 9 },
          { value: "closed", label: "Closed", count: 5 },
        ]}
        activeFilter={filter}
        onFilter={setFilter}
        color={BRAND}
        primaryAction={{ label: "New Item", icon: Plus, onClick: () => {} }}
        placeholder="Search records..."
      />
    </div>
  );
}

function MetricsExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Metrics & Stats"
        description="HeroBanner for dashboards, StatCard + StatGrid for KPI rows. From @/components/layout."
        usedIn={["All Dashboards", "Tickets Header", "Tasks Header", "Reports"]}
      />
      <HeroBanner
        eyebrow="Good morning, Sneha Patel"
        headline="Component Library"
        tagline="All reusable blocks and patterns used across TeamSync"
        color={BRAND}
        colorDark="#1a47bb"
        metrics={[
          { label: "Components", value: 24 },
          { label: "Pages", value: 85 },
          { label: "Verticals", value: 17 },
        ]}
      />
      <StatGrid cols={4}>
        <StatCard label="Total Revenue" value="$142,500" trend="+12.5% this month" icon={DollarSign} iconBg="#EEF2FF" iconColor={BRAND} />
        <StatCard label="Active Users" value="1,284" trend="+8% from last week" icon={Users} iconBg="#F0FDF4" iconColor="#10B981" />
        <StatCard label="Open Tasks" value="47" trend="5 overdue" icon={Clock} iconBg="#FFFBEB" iconColor="#F59E0B" />
        <StatCard label="Completion Rate" value="94.2%" trend="2.1% improvement" icon={TrendingUp} iconBg="#FEF2F2" iconColor="#EF4444" />
      </StatGrid>
    </div>
  );
}

function KanbanExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Kanban Board"
        description="Drag-free column-based board for task/pipeline management. Used in Tasks (board view), CRM Pipeline, Formation Pipeline."
        usedIn={["Tasks (Board)", "CRM Pipeline", "Formation Pipeline", "ATS Applications", "ETS Pipeline"]}
      />
      <div className="grid grid-cols-4 gap-3">
        {kanbanColumns.map((col) => (
          <div key={col.title} className="rounded-xl bg-muted/30 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-xs font-semibold">{col.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.map((item) => (
                <div key={item.id} className="rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow cursor-pointer">
                  <p className="text-sm font-medium">{item.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={item.priority === "High" ? "destructive" : item.priority === "Medium" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                      {item.priority}
                    </Badge>
                    <PersonCell name={item.assignee} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormsExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Forms & Inputs"
        description="Standard form controls — Input, Select, Textarea, Checkbox, Switch, Label. All from @/components/ui/."
        usedIn={["New Ticket Dialog", "Add Task Dialog", "Client Intake", "All FormDialogs"]}
      />
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h4 className="text-sm font-semibold">Text Inputs</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="lib-name">Full Name</Label>
              <Input id="lib-name" placeholder="Enter full name" data-testid="input-lib-name" />
            </div>
            <div>
              <Label htmlFor="lib-email">Email Address</Label>
              <Input id="lib-email" type="email" placeholder="name@company.com" data-testid="input-lib-email" />
            </div>
            <div>
              <Label htmlFor="lib-desc">Description</Label>
              <Textarea id="lib-desc" placeholder="Write a brief description..." rows={3} data-testid="input-lib-desc" />
            </div>
          </div>
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h4 className="text-sm font-semibold">Selection Controls</h4>
          <div className="space-y-3">
            <div>
              <Label>Department</Label>
              <Select>
                <SelectTrigger data-testid="select-lib-dept"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 py-2">
              <Checkbox id="lib-agree" data-testid="checkbox-lib-agree" />
              <Label htmlFor="lib-agree" className="text-sm">I agree to the terms</Label>
            </div>
            <div className="flex items-center justify-between py-2">
              <Label className="text-sm">Enable notifications</Label>
              <Switch data-testid="switch-lib-notif" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModalExample() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Detail Modal"
        description="DetailModal + DetailSection + InfoRow from @/components/layout. Standard record detail overlay."
        usedIn={["Ticket Detail", "Client Detail", "Order Detail", "Employee Detail", "Event Detail"]}
      />
      <Button onClick={() => setOpen(true)} data-testid="btn-open-detail-modal">
        Open Detail Modal
      </Button>
      <DetailModal
        open={open}
        onClose={() => setOpen(false)}
        title="Acme Corp — Formation"
        subtitle="Client #CLT-001 · Active since Jan 2026"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="btn-modal-cancel">Cancel</Button>
            <Button style={{ backgroundColor: BRAND }} className="text-white" data-testid="btn-modal-save">Save Changes</Button>
          </>
        }
      >
        <DetailSection title="Overview">
          <div className="space-y-1">
            <InfoRow label="Entity Type" value="LLC" />
            <InfoRow label="State" value="Delaware" />
            <InfoRow label="Filing Date" value="Jan 15, 2026" />
            <InfoRow label="Status">
              <StatusBadge status="Active" />
            </InfoRow>
          </div>
        </DetailSection>
        <DetailSection title="Contact Information">
          <div className="space-y-1">
            <InfoRow label="Primary Contact" value="John Smith" />
            <InfoRow label="Email" value="john@acmecorp.com" />
            <InfoRow label="Phone" value="+1 (555) 123-4567" />
          </div>
        </DetailSection>
      </DetailModal>
    </div>
  );
}

function BadgesExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Badges & Status"
        description="StatusBadge from @/components/ds/, Badge variants from @/components/ui/. Consistent status indicators."
        usedIn={["All Tables", "Kanban Cards", "Detail Pages", "Dashboards"]}
      />
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">StatusBadge (semantic)</p>
          <div className="flex items-center gap-2 flex-wrap">
            {(["Active", "Pending", "Completed", "Cancelled", "In Progress", "On Hold", "Rejected", "Draft", "Overdue"] as const).map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Badge variants</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function ButtonsExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Buttons"
        description="Button variants from @/components/ui/ + PrimaryAction from @/components/layout."
        usedIn={["All Pages", "Toolbars", "Modals", "Forms"]}
      />
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Shadcn Button variants</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">PrimaryAction (brand-colored)</p>
          <div className="flex items-center gap-2">
            <PrimaryAction color={BRAND} icon={Plus} onClick={() => {}}>New Record</PrimaryAction>
            <PrimaryAction color="#10B981" icon={Download} onClick={() => {}}>Export</PrimaryAction>
            <PrimaryAction color="#E91E63" icon={Mail} onClick={() => {}}>Send Email</PrimaryAction>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">FilterPill (toggle buttons)</p>
          <div className="flex items-center gap-2">
            <FilterPill active={true} color={BRAND} onClick={() => {}}>All Items (24)</FilterPill>
            <FilterPill active={false} color={BRAND} onClick={() => {}}>Active (18)</FilterPill>
            <FilterPill active={false} color={BRAND} onClick={() => {}}>Pending (6)</FilterPill>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCardsExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Section Cards & Grid"
        description="SectionCard + SectionGrid from @/components/layout. Standard dashboard content containers."
        usedIn={["All Dashboards", "Analytics Pages", "Reports"]}
      />
      <SectionGrid cols={2}>
        <SectionCard title="Recent Activity" viewAllLabel="View All" onViewAll={() => {}}>
          <div className="space-y-3">
            {[
              { action: "Created new ticket", user: "Sneha Patel", time: "30m ago" },
              { action: "Updated project status", user: "Arjun Mehta", time: "1h ago" },
              { action: "Exported sales report", user: "Vikram Singh", time: "3h ago" },
            ].map((a) => (
              <div key={a.action} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{a.user}</span>
                  <span className="text-muted-foreground"> {a.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Manage Team", icon: Users, desc: "Add or edit members" },
              { label: "View Reports", icon: BarChart3, desc: "Analytics overview" },
              { label: "System Settings", icon: Shield, desc: "Configure preferences" },
              { label: "Export Data", icon: Download, desc: "Download records" },
            ].map((q) => (
              <div key={q.label} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 cursor-pointer transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <q.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{q.label}</p>
                  <p className="text-xs text-muted-foreground">{q.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </SectionGrid>
    </div>
  );
}

function LoadingStatesExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Loading & Skeleton States"
        description="Spinner, PageSpinner from @/components/ui/spinner. Skeleton from @/components/ui/skeleton."
        usedIn={["All Pages (loading)", "Data fetching", "Lazy-loaded sections"]}
      />
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 text-center space-y-3">
          <p className="text-xs font-medium text-muted-foreground mb-3">Spinners</p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <Spinner className="size-3 mx-auto" />
              <p className="text-[9px] text-muted-foreground mt-2">Inline</p>
            </div>
            <div className="text-center">
              <Spinner className="size-4 mx-auto" />
              <p className="text-[9px] text-muted-foreground mt-2">Default</p>
            </div>
            <div className="text-center">
              <Spinner className="size-8 mx-auto" />
              <p className="text-[9px] text-muted-foreground mt-2">Page</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <p className="text-xs font-medium text-muted-foreground mb-3">Stat Skeleton</p>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-2 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <p className="text-xs font-medium text-muted-foreground mb-3">Card Skeleton</p>
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <p className="text-xs font-medium text-muted-foreground mb-3">Table Skeleton</p>
        <div className="space-y-3">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-3 flex-1" />)}
          </div>
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex gap-4 py-2 border-t">
              {[1, 2, 3, 4].map((col) => <Skeleton key={col} className="h-4 flex-1" />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AvatarExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Avatars & Stacks"
        description="Avatar from @/components/ui/avatar. Sizes from 3XL to XS, with fallback initials. Used for user identification."
        usedIn={["Team Page", "All Tables", "Chat", "Kanban Cards", "Activity Feeds"]}
      />
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Sizes</p>
          <div className="flex items-end gap-3">
            {[
              { size: "h-14 w-14", label: "3XL", textSize: "text-lg" },
              { size: "h-11 w-11", label: "2XL", textSize: "text-base" },
              { size: "h-9 w-9", label: "XL", textSize: "text-sm" },
              { size: "h-8 w-8", label: "LG", textSize: "text-xs" },
              { size: "h-7 w-7", label: "MD", textSize: "text-[10px]" },
              { size: "h-5 w-5", label: "SM", textSize: "text-[8px]" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <Avatar className={s.size}>
                  <AvatarFallback className={cn(s.textSize, "bg-primary/10 text-primary font-medium")}>SP</AvatarFallback>
                </Avatar>
                <p className="text-[9px] text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Stacked (overlapping)</p>
          <div className="flex -space-x-2">
            {["SP", "AK", "RK", "VS", "PK"].map((initials, i) => (
              <Avatar key={initials} className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
              </Avatar>
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
              +3
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PagePatternsExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Page Patterns"
        description="Standard page compositions used across TeamSync. Each pattern combines layout primitives into a full page structure."
        usedIn={["Every vertical page follows one of these patterns"]}
      />
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            name: "Index Page",
            desc: "PageShell → PageHeader → StatGrid → IndexToolbar → DataTable",
            example: "Tickets, Employees, Orders, Contacts",
            color: "#3B82F6",
          },
          {
            name: "Dashboard Page",
            desc: "PageShell → HeroBanner → StatGrid → SectionGrid[SectionCards]",
            example: "All 17 vertical dashboards",
            color: "#10B981",
          },
          {
            name: "Detail Page",
            desc: "PageShell → Breadcrumb → Header → Tabs[Sections] or DetailModal",
            example: "Client Detail, Event Detail, Order Detail",
            color: "#8B5CF6",
          },
          {
            name: "Kanban Page",
            desc: "PageShell → PageHeader → FilterRow → Column Grid → Cards",
            example: "Tasks Board, CRM Pipeline, Formation Pipeline",
            color: "#F59E0B",
          },
          {
            name: "Chat Page",
            desc: "Full-height layout → Sidebar (channels) → Message area → Input",
            example: "Universal Chat (all verticals)",
            color: "#EC4899",
          },
          {
            name: "Form Page",
            desc: "PageShell → PageHeader → Card → FormFields → Actions",
            example: "Client Intake, Proposals, Settings",
            color: "#6366F1",
          },
        ].map((p) => (
          <div key={p.name} className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              <h4 className="text-sm font-semibold">{p.name}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t">
              <span className="font-medium">Examples:</span> {p.example}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabsExample() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Tabs"
        description="Tabs from @/components/ui/tabs. Used for multi-section views on detail pages and settings."
        usedIn={["Event Detail", "Employee Detail", "Candidate Detail", "Settings", "Components Guide"]}
      />
      <Tabs defaultValue="overview" className="rounded-xl border bg-card p-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-lib-overview">Overview</TabsTrigger>
          <TabsTrigger value="details" data-testid="tab-lib-details">Details</TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-lib-activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <p className="text-sm text-muted-foreground">Overview tab content. Use for primary information display.</p>
        </TabsContent>
        <TabsContent value="details" className="pt-4">
          <p className="text-sm text-muted-foreground">Details tab content. Use for secondary/technical information.</p>
        </TabsContent>
        <TabsContent value="activity" className="pt-4">
          <p className="text-sm text-muted-foreground">Activity tab content. Use for logs, timeline, and history.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function LibraryContent() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Badge variant="outline" className="text-xs">{24} blocks</Badge>
        <Badge variant="outline" className="text-xs">{6} page patterns</Badge>
      </div>
      <Tabs defaultValue="data" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="data" data-testid="tab-lib-data">Data Display</TabsTrigger>
          <TabsTrigger value="layout" data-testid="tab-lib-layout">Layout & Metrics</TabsTrigger>
          <TabsTrigger value="inputs" data-testid="tab-lib-inputs">Forms & Inputs</TabsTrigger>
          <TabsTrigger value="feedback" data-testid="tab-lib-feedback">Feedback & Loading</TabsTrigger>
          <TabsTrigger value="patterns" data-testid="tab-lib-patterns">Page Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-8">
          <DataTableFullExample />
          <Separator />
          <ManualTableExample />
          <Separator />
          <KanbanExample />
          <Separator />
          <TabsExample />
        </TabsContent>

        <TabsContent value="layout" className="space-y-8">
          <MetricsExample />
          <Separator />
          <SectionCardsExample />
          <Separator />
          <IndexToolbarExample />
        </TabsContent>

        <TabsContent value="inputs" className="space-y-8">
          <FormsExample />
          <Separator />
          <ButtonsExample />
          <Separator />
          <BadgesExample />
          <Separator />
          <AvatarExample />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-8">
          <LoadingStatesExample />
          <Separator />
          <DetailModalExample />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-8">
          <PagePatternsExample />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DevLibrary() {
  return (
    <PageShell>
      <PageHeader
        title="Component & Pages Library"
        subtitle="Living design system — all reusable blocks and page patterns used across TeamSync"
      />
      <LibraryContent />
    </PageShell>
  );
}
