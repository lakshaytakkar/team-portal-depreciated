import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, User2, CheckCircle2, CalendarDays, Plus } from "lucide-react";
import {
  supransLeads as initialLeads,
  VERTICAL_REP_MAP,
  type SupransLead,
} from "@/lib/mock-data-suprans";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  DetailModal,
  DetailSection,
} from "@/components/layout";
import { verticals } from "@/lib/verticals-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonCell } from "@/components/ui/avatar-cells";

const SERVICE_LABELS: Record<string, string> = {
  "company-formation": "Company Formation",
  "tour-booking": "Tour Booking",
  "ecommerce-setup": "E-Commerce Setup",
  "event-management": "Event Management",
  "hr-consulting": "HR Consulting",
  "franchise": "Franchise",
};

const VERTICAL_OPTIONS = [
  { value: "legalnations", label: "LegalNations", color: "#225AEA" },
  { value: "goyotours", label: "GoyoTours", color: "#E91E63" },
  { value: "usdrop", label: "USDrop AI", color: "#F34147" },
  { value: "eventhub", label: "EventHub", color: "#7C3AED" },
  { value: "hrms", label: "HRMS", color: "#0EA5E9" },
  { value: "ets", label: "EazyToSell", color: "#F97316" },
];

const VERTICAL_META: Record<string, { label: string; color: string }> = Object.fromEntries(
  VERTICAL_OPTIONS.map((v) => [v.value, { label: v.label, color: v.color }])
);

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export default function SupransAssignments() {
  const { toast } = useToast();
  const [pendingLeads, setPendingLeads] = useState<SupransLead[]>(
    initialLeads.filter((l) => l.status === "enriched")
  );
  const [assignedLeads] = useState<SupransLead[]>(
    initialLeads.filter((l) => l.status === "assigned")
  );
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<SupransLead | null>(null);
  const [assignVertical, setAssignVertical] = useState("");
  const [assignRep, setAssignRep] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  const vertical = verticals.find((v) => v.id === "suprans")!;

  const filteredPending = pendingLeads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      SERVICE_LABELS[l.service]?.toLowerCase().includes(search.toLowerCase())
  );

  function openAssign(lead: SupransLead) {
    setSelectedLead(lead);
    setAssignVertical(lead.assignedVertical || "");
    setAssignRep("");
    setFollowUpDate("");
    setAssignNotes("");
  }

  function handleAssign() {
    if (!selectedLead || !assignVertical || !assignRep) return;
    setPendingLeads((prev) => prev.filter((l) => l.id !== selectedLead.id));
    toast({
      title: "Lead assigned",
      description: `${selectedLead.name} assigned to ${assignRep} (${VERTICAL_META[assignVertical]?.label}).`,
    });
    setSelectedLead(null);
  }

  const availableReps = assignVertical ? VERTICAL_REP_MAP[assignVertical] || [] : [];

  return (
    <PageShell>
      <PageHeader
        title="Assignments"
        subtitle="Assign enriched leads to business vertical reps"
      />

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        color={vertical.color}
        placeholder="Search enriched leads..."
      />

      {filteredPending.length > 0 && (
        <DataTableContainer className="mb-8">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">
              Ready to Assign{" "}
              <span className="text-muted-foreground font-normal">
                ({filteredPending.length})
              </span>
            </h2>
          </div>
          <div className="divide-y">
            {filteredPending.map((lead) => {
              const vertMeta = lead.assignedVertical ? VERTICAL_META[lead.assignedVertical] : null;
              return (
                <div
                  key={lead.id}
                  className="p-4 flex items-center gap-4"
                  data-testid={`row-pending-${lead.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <PersonCell name={lead.name} size="sm" />
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          PRIORITY_COLORS[lead.priority]
                        )}
                      >
                        {lead.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                      <span>{SERVICE_LABELS[lead.service]}</span>
                      {vertMeta && (
                        <span className="flex items-center gap-1">
                          →{" "}
                          <span style={{ color: vertMeta.color }} className="font-medium">
                            {vertMeta.label}
                          </span>
                        </span>
                      )}
                    </div>
                    {lead.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5 italic truncate max-w-sm">
                        {lead.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => openAssign(lead)}
                    className="shrink-0"
                    style={{ backgroundColor: vertical.color }}
                    data-testid={`button-assign-${lead.id}`}
                  >
                    Assign Rep
                  </Button>
                </div>
              );
            })}
          </div>
        </DataTableContainer>
      )}

      {filteredPending.length === 0 && (
        <div className="rounded-xl border bg-card py-12 text-center text-muted-foreground text-sm mb-8">
          All enriched leads have been assigned.
        </div>
      )}

      <DataTableContainer>
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-semibold text-sm">
            Recently Assigned{" "}
            <span className="text-muted-foreground font-normal">({assignedLeads.length})</span>
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <DataTH>Lead</DataTH>
              <DataTH>Service</DataTH>
              <DataTH>Vertical</DataTH>
              <DataTH>Assigned Rep</DataTH>
              <DataTH>Date</DataTH>
              <DataTH>Status</DataTH>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assignedLeads.map((lead) => {
              const vertMeta = lead.assignedVertical ? VERTICAL_META[lead.assignedVertical] : null;
              return (
                <DataTR key={lead.id} data-testid={`row-assigned-${lead.id}`}>
                  <DataTD>
                    <PersonCell name={lead.name} subtitle={lead.email} size="sm" />
                  </DataTD>
                  <DataTD className="text-muted-foreground text-xs">
                    {SERVICE_LABELS[lead.service]}
                  </DataTD>
                  <DataTD>
                    {vertMeta && (
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: vertMeta.color }}
                      >
                        {vertMeta.label}
                      </span>
                    )}
                  </DataTD>
                  <DataTD>
                    {lead.assignedRep ? (
                      <PersonCell name={lead.assignedRep} size="sm" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </DataTD>
                  <DataTD className="text-xs text-muted-foreground">
                    {lead.assignedAt ? format(new Date(lead.assignedAt), "dd MMM yyyy") : "—"}
                  </DataTD>
                  <DataTD>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                      assigned
                    </span>
                  </DataTD>
                </DataTR>
              );
            })}
          </tbody>
        </table>
      </DataTableContainer>

      <DetailModal
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title="Assign Lead"
        subtitle={selectedLead?.name}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setSelectedLead(null)}>
              Cancel
            </Button>
            <Button
              className="text-white"
              onClick={handleAssign}
              disabled={!assignVertical || !assignRep}
              style={{ backgroundColor: vertical.color }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Assign Lead
            </Button>
          </div>
        }
      >
        {selectedLead && (
          <>
            <DetailSection title="Lead Context">
              <div className="space-y-1">
                <div className="font-medium text-sm">{SERVICE_LABELS[selectedLead.service]}</div>
                {selectedLead.notes && (
                  <p className="text-muted-foreground italic text-xs">{selectedLead.notes}</p>
                )}
                <div className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium w-fit",
                  PRIORITY_COLORS[selectedLead.priority]
                )}>
                  {selectedLead.priority} Priority
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Assignment">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Business Vertical</Label>
                  <Select
                    value={assignVertical}
                    onValueChange={(v) => {
                      setAssignVertical(v);
                      setAssignRep("");
                    }}
                  >
                    <SelectTrigger data-testid="select-assign-vertical">
                      <SelectValue placeholder="Select vertical..." />
                    </SelectTrigger>
                    <SelectContent>
                      {VERTICAL_OPTIONS.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assign to Rep</Label>
                  <Select
                    value={assignRep}
                    onValueChange={setAssignRep}
                    disabled={!assignVertical}
                  >
                    <SelectTrigger data-testid="select-assign-rep">
                      <SelectValue
                        placeholder={assignVertical ? "Select rep..." : "Choose vertical first"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReps.map((rep) => (
                        <SelectItem key={rep} value={rep}>
                          <PersonCell name={rep} size="sm" />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Follow-up & Notes">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Follow-up Date
                  </Label>
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    data-testid="input-followup-date"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes for Rep</Label>
                  <Textarea
                    placeholder="Briefing notes for the assigned rep..."
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    rows={3}
                    data-testid="textarea-assign-notes"
                  />
                </div>
              </div>
            </DetailSection>
          </>
        )}
      </DetailModal>
    </PageShell>
  );
}
