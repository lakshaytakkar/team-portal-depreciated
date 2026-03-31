import { useState } from "react";
import { Plus, LayoutList, KanbanSquare, Calendar, AlertCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiWhatsapp } from "react-icons/si";
import { Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ds/status-badge";
import { leads, tourPackages, type Lead, type LeadStatus } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { EVENTS_COLOR } from "@/lib/events-config";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  DetailModal,
  DetailSection,
} from "@/components/layout";
import { PersonCell } from "@/components/ui/avatar-cells";

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const sourceConfig: Record<string, { label: string; color: string }> = {
  website: { label: "Website", color: "bg-blue-100 text-blue-700" },
  whatsapp: { label: "WhatsApp", color: "bg-green-100 text-green-700" },
  referral: { label: "Referral", color: "bg-purple-100 text-purple-700" },
  social: { label: "Social", color: "bg-pink-100 text-pink-700" },
  walk_in: { label: "Walk-in", color: "bg-amber-100 text-amber-700" },
  phone: { label: "Phone", color: "bg-indigo-100 text-indigo-700" },
};

const kanbanColumns: { key: LeadStatus; label: string; headerColor: string }[] = [
  { key: "new", label: "New", headerColor: "border-b-2 border-blue-400" },
  { key: "contacted", label: "Contacted", headerColor: "border-b-2 border-purple-400" },
  { key: "interested", label: "Interested", headerColor: "border-b-2 border-amber-400" },
  { key: "booked", label: "Booked", headerColor: "border-b-2 border-green-400" },
  { key: "cold", label: "Cold", headerColor: "border-b-2 border-slate-400" },
  { key: "lost", label: "Lost", headerColor: "border-b-2 border-red-300" },
];

const statusVariantMap: Record<string, "success" | "info" | "warning" | "neutral" | "error"> = {
  new: "info",
  contacted: "neutral",
  interested: "warning",
  booked: "success",
  cold: "neutral",
  lost: "error",
};

function LeadKanbanCard({ lead }: { lead: Lead }) {
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = lead.follow_up_date < today && lead.status !== "booked" && lead.status !== "lost";
  const isToday = lead.follow_up_date === today;
  const pkg = tourPackages.find((p) => p.id === lead.interested_package_id);
  const src = sourceConfig[lead.source];

  return (
    <div
      className="rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:shadow-sm"
      data-testid={`card-lead-${lead.id}`}
    >
      <PersonCell name={lead.name} size="xs" className="mb-0.5" />
      <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-tight">{lead.business_type} · {lead.city}</p>

      {pkg && (
        <p className="text-[10px] bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 rounded px-1.5 py-0.5 mb-2 line-clamp-1 font-bold">
          {pkg.name}
        </p>
      )}

      <div className="flex items-center gap-1.5 mb-2">
        {src && <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter ${src.color}`}>{src.label}</span>}
        <span
          className={`ml-auto text-[10px] font-bold flex items-center gap-0.5 ${isOverdue ? "text-red-500" : isToday ? "text-amber-500" : "text-muted-foreground"}`}
        >
          <Calendar className="size-3" />
          {formatDate(lead.follow_up_date)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t pt-2 mt-2">
        <a href={`tel:${lead.phone}`} className="text-[10px] font-bold text-blue-500 hover:underline">
          {lead.phone}
        </a>
        <a
          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="ghost" size="icon" className="size-7 text-green-600">
            <SiWhatsapp className="size-3.5" />
          </Button>
        </a>
      </div>
    </div>
  );
}

export default function EventsLeads() {
  const loading = useSimulatedLoading(650);
  const { toast } = useToast();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const totalLeads = leads.length;
  const newToday = leads.filter((l) => l.created_at === today).length;
  const followUpsDue = leads.filter((l) => l.follow_up_date <= today && !["booked", "lost"].includes(l.status)).length;
  const conversionRate = Math.round((leads.filter((l) => l.status === "booked").length / leads.length) * 100);

  const getLeadsByStatus = (status: LeadStatus) => leads.filter((l) => 
    l.status === status && (search === "" || l.name.toLowerCase().includes(search.toLowerCase()) || l.city.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Leads & Pipeline"
          subtitle={`${totalLeads} total leads · ${conversionRate}% conversion rate`}
          actions={
            <div className="flex items-center gap-2">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={view === "kanban" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setView("kanban")}
                >
                  <KanbanSquare className="size-4 mr-2" /> Kanban
                </Button>
                <Button
                  variant={view === "table" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setView("table")}
                >
                  <LayoutList className="size-4 mr-2" /> Table
                </Button>
              </div>
              <Button
                onClick={() => setDialogOpen(true)}
                className="gap-2 text-white"
                style={{ backgroundColor: EVENTS_COLOR }}
                data-testid="button-add-lead"
              >
                <Plus className="size-4" /> Add Lead
              </Button>
            </div>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          <StatCard label="Total Leads" value={totalLeads} icon={Users} iconBg="rgba(33, 150, 243, 0.1)" iconColor="#2196F3" />
          <StatCard label="New Today" value={newToday} icon={Calendar} iconBg="rgba(37, 99, 235, 0.1)" iconColor="#2563EB" />
          <StatCard label="Follow-ups Due" value={followUpsDue} icon={AlertCircle} iconBg="rgba(255, 152, 0, 0.1)" iconColor="#FF9800" />
          <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={Users} iconBg="rgba(233, 30, 99, 0.1)" iconColor={EVENTS_COLOR} />
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search leads by name or city..."
          color={EVENTS_COLOR}
        />
      </Fade>

      {view === "kanban" ? (
        <Fade>
          <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-400px)] min-h-[500px]">
            {kanbanColumns.map((col) => {
              const colLeads = getLeadsByStatus(col.key);
              return (
                <div key={col.key} className={`min-w-[240px] flex flex-col rounded-xl border bg-muted/30 ${col.headerColor}`}>
                  <div className="flex items-center justify-between px-3 py-3">
                    <span className="text-xs font-bold uppercase tracking-wider">{col.label}</span>
                    <Badge variant="secondary" className="rounded-full h-5 px-1.5 text-[10px] font-bold">{colLeads.length}</Badge>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {colLeads.map((lead) => (
                      <LeadKanbanCard key={lead.id} lead={lead} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Fade>
      ) : (
        <Fade>
          <DataTableContainer>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <DataTH>Name</DataTH>
                  <DataTH>Phone</DataTH>
                  <DataTH>City</DataTH>
                  <DataTH>Business Type</DataTH>
                  <DataTH>Package</DataTH>
                  <DataTH>Source</DataTH>
                  <DataTH>Status</DataTH>
                  <DataTH>Follow-up</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.filter(l => search === "" || l.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <DataTR key={item.id}>
                    <DataTD><PersonCell name={item.name} size="sm" /></DataTD>
                    <DataTD className="font-medium text-blue-600">{item.phone}</DataTD>
                    <DataTD>{item.city}</DataTD>
                    <DataTD className="text-xs font-medium uppercase text-muted-foreground">{item.business_type}</DataTD>
                    <DataTD className="text-xs max-w-[150px] line-clamp-1">
                      {tourPackages.find(p => p.id === item.interested_package_id)?.name}
                    </DataTD>
                    <DataTD>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter ${sourceConfig[item.source]?.color}`}>
                        {item.source}
                      </span>
                    </DataTD>
                    <DataTD>
                      <StatusBadge status={item.status} variant={statusVariantMap[item.status]} />
                    </DataTD>
                    <DataTD className="font-bold text-xs">
                      {formatDate(item.follow_up_date)}
                    </DataTD>
                  </DataTR>
                ))}
              </tbody>
            </table>
          </DataTableContainer>
        </Fade>
      )}

      <DetailModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add New Lead"
        subtitle="Register a new interest in the pipeline"
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              style={{ backgroundColor: EVENTS_COLOR }} 
              className="text-white hover:opacity-90"
              onClick={() => setDialogOpen(false)}
            >
              Add Lead
            </Button>
          </>
        }
      >
        <DetailSection title="Contact Information">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Full Name</Label>
              <Input placeholder="Client full name" />
            </div>
            <div className="grid gap-1.5">
              <Label>Phone</Label>
              <Input placeholder="+91 98xxx xxxxx" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="client@email.com" />
            </div>
            <div className="grid gap-1.5">
              <Label>Business Type</Label>
              <Input placeholder="e.g. Textile Importer" />
            </div>
          </div>
        </DetailSection>
        <DetailSection title="Sourcing Interest">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Interested Package</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {tourPackages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Follow-up Date</Label>
              <Input type="date" />
            </div>
          </div>
        </DetailSection>
      </DetailModal>
    </PageShell>
  );
}
