import { useState, useMemo } from "react";
import {
  Users,
  Download,
  Plus,
  MessageSquare,
  Copy,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { PageShell } from "@/components/layout";
import { PageTransition } from "@/components/ui/animated";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { DataTable, type Column, type RowAction } from "@/components/ds/data-table";
import { StatusBadge } from "@/components/ds/status-badge";
import { PersonCell } from "@/components/ui/avatar-cells";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { SALES_COLOR } from "@/lib/sales-config";
import { cn } from "@/lib/utils";
import {
  clients as allClients,
  batches as allBatches,
  type Client,
  type Batch,
  type ClientStatus,
  type LLCStatus,
} from "@/lib/mock-data-sales";

const LLC_STATUS_LABELS: Record<LLCStatus, string> = {
  pending: "Pending",
  filed: "Filed",
  ein_applied: "EIN Applied",
  boi_filed: "BOI Filed",
  bank_setup: "Bank Setup",
  stripe_setup: "Stripe Setup",
  complete: "Complete",
};

const CLIENT_STATUS_VARIANT: Record<ClientStatus, "success" | "error" | "warning" | "neutral" | "info"> = {
  active: "success",
  stalled: "warning",
  graduated: "info",
  paused: "neutral",
};

function isStalled(lastActive: string): boolean {
  const last = new Date(lastActive);
  const now = new Date("2025-02-28");
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 7;
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date("2025-02-28");
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

const clientColumns: Column<Client>[] = [
  {
    key: "name",
    header: "Client",
    sortable: true,
    render: (item) => (
      <PersonCell name={item.name} subtitle={item.email} size="sm" />
    ),
  },
  {
    key: "batchName",
    header: "Batch",
    sortable: true,
    render: (item) => (
      <span className="text-sm">
        {item.batchName}
        <span className="ml-1 text-xs text-muted-foreground">W{item.weekNumber}</span>
      </span>
    ),
  },
  {
    key: "progress",
    header: "Progress",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <Progress value={item.progress} className="w-16 h-1.5" />
        <span className="text-xs text-muted-foreground w-8">{item.progress}%</span>
      </div>
    ),
  },
  {
    key: "llcStatus",
    header: "LLC Status",
    render: (item) => (
      <StatusBadge status={LLC_STATUS_LABELS[item.llcStatus]} />
    ),
  },
  {
    key: "lastActive",
    header: "Last Active",
    sortable: true,
    render: (item) => {
      const stalled = isStalled(item.lastActive);
      const daysInactive = daysSince(item.lastActive);
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{item.lastActive}</span>
          {stalled && (
            <StatusBadge status={`${daysInactive}d`} variant="warning" />
          )}
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (item) => (
      <StatusBadge
        status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        variant={CLIENT_STATUS_VARIANT[item.status]}
      />
    ),
  },
];

const clientRowActions: RowAction<Client>[] = [
  { label: "View Profile", onClick: () => {} },
  { label: "Send Payment Link", onClick: () => {} },
  { label: "Create Ticket", onClick: () => {} },
  { label: "Change Batch", onClick: () => {}, separator: true },
  { label: "Mark Graduated", onClick: () => {} },
];

function AllClientsTab() {
  const { toast } = useToast();

  const handleExportCSV = () => {
    toast({ title: "Export Started", description: `Exporting clients to CSV...` });
  };

  return (
    <DataTable
      data={allClients}
      columns={clientColumns}
      searchPlaceholder="Search clients..."
      filters={[
        {
          label: "Batch",
          key: "batchId",
          options: allBatches.map((b) => ({ value: b.id, label: `${b.name} ${b.week}` })),
        },
        {
          label: "Status",
          key: "status",
          options: ["active", "stalled", "graduated", "paused"],
        },
      ]}
      rowActions={clientRowActions}
      emptyTitle="No clients found"
      emptyDescription="No clients found matching your filters."
      headerActions={
        <Button variant="outline" onClick={handleExportCSV} data-testid="button-export-csv">
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      }
    />
  );
}

function BatchManagerTab() {
  const [batchList, setBatchList] = useState<Batch[]>(allBatches);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchDate, setNewBatchDate] = useState("");
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    "Hi {name}, welcome to your new batch! We're excited to have you on board. Your journey to building a successful dropshipping business starts now."
  );
  const { toast } = useToast();

  const selectedBatch = batchList.find((b) => b.id === selectedBatchId);
  const batchMembers = useMemo(() => {
    if (!selectedBatchId) return [];
    return allClients.filter((c) => c.batchId === selectedBatchId);
  }, [selectedBatchId]);

  const handleCreateBatch = () => {
    if (!newBatchName.trim() || !newBatchDate) return;
    const newBatch: Batch = {
      id: `BAT-${String(batchList.length + 1).padStart(3, "0")}`,
      name: newBatchName,
      startDate: newBatchDate,
      memberCount: 0,
      status: "active",
    };
    setBatchList([...batchList, newBatch]);
    setNewBatchName("");
    setNewBatchDate("");
    setCreateOpen(false);
    toast({ title: "Batch Created", description: `${newBatchName} has been created.` });
  };

  const handleCopyWhatsApp = (clientName: string) => {
    const msg = whatsappTemplate.replace(/\{name\}/g, clientName);
    navigator.clipboard.writeText(msg);
    toast({ title: "Copied", description: "WhatsApp message copied to clipboard." });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold" data-testid="text-batch-title">Batch Manager</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setWhatsappOpen(true)} data-testid="button-whatsapp-template">
            <MessageSquare className="mr-2 size-4" />
            WhatsApp Template
          </Button>
          <Button onClick={() => setCreateOpen(true)} style={{ backgroundColor: SALES_COLOR, color: "#fff" }} data-testid="button-create-batch">
            <Plus className="mr-2 size-4" />
            New Batch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2 lg:col-span-1">
          {batchList.map((batch) => {
            const memberCount = allClients.filter((c) => c.batchId === batch.id).length;
            return (
              <Card
                key={batch.id}
                className={cn(
                  "p-4 cursor-pointer transition-colors",
                  selectedBatchId === batch.id && "ring-2",
                )}
                style={selectedBatchId === batch.id ? { borderColor: SALES_COLOR } : {}}
                onClick={() => setSelectedBatchId(batch.id)}
                data-testid={`card-batch-${batch.id}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm" data-testid={`text-batch-name-${batch.id}`}>{batch.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Started {batch.startDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="mr-1 size-3" />
                      {memberCount}
                    </Badge>
                    <StatusBadge
                      status={batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                      variant={batch.status === "active" ? "success" : "neutral"}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          {selectedBatch ? (
            <Card className="p-0 overflow-hidden">
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm" data-testid="text-selected-batch">{selectedBatch.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {batchMembers.length} members | Started {selectedBatch.startDate}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="batch-members-table">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Member</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Week</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Progress</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No members in this batch.
                        </td>
                      </tr>
                    ) : (
                      batchMembers.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                          data-testid={`row-batch-member-${member.id}`}
                        >
                          <td className="px-4 py-3">
                            <PersonCell name={member.name} subtitle={member.email} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium">W{member.weekNumber}</span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge
                              status={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                              variant={CLIENT_STATUS_VARIANT[member.status]}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 justify-center">
                              <Progress value={member.progress} className="w-16 h-1.5" />
                              <span className="text-xs text-muted-foreground">{member.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyWhatsApp(member.name)}
                              data-testid={`button-whatsapp-${member.id}`}
                            >
                              <Copy className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="flex items-center justify-center p-12">
              <div className="text-center">
                <Users className="mx-auto size-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground" data-testid="text-select-batch-hint">
                  Select a batch to view its members
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent data-testid="dialog-create-batch">
          <DialogHeader>
            <DialogTitle>Create New Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="batch-name">Batch Name</Label>
              <Input
                id="batch-name"
                placeholder="e.g., Zeta Cohort"
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                data-testid="input-batch-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-date">Start Date</Label>
              <Input
                id="batch-date"
                type="date"
                value={newBatchDate}
                onChange={(e) => setNewBatchDate(e.target.value)}
                data-testid="input-batch-date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel-batch">
              Cancel
            </Button>
            <Button
              onClick={handleCreateBatch}
              disabled={!newBatchName.trim() || !newBatchDate}
              style={{ backgroundColor: SALES_COLOR, color: "#fff" }}
              data-testid="button-submit-batch"
            >
              Create Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={whatsappOpen} onOpenChange={setWhatsappOpen}>
        <DialogContent data-testid="dialog-whatsapp-template">
          <DialogHeader>
            <DialogTitle>WhatsApp Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Use <code className="bg-muted px-1 py-0.5 rounded text-xs">{"{name}"}</code> as a placeholder for the client name.
            </p>
            <Textarea
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              rows={4}
              data-testid="input-whatsapp-template"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsappOpen(false)} data-testid="button-close-template">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ClientsPage() {
  const loading = useSimulatedLoading();
  const stalledCount = allClients.filter((c) => isStalled(c.lastActive) && c.status !== "graduated").length;
  const activeCount = allClients.filter((c) => c.status === "active").length;
  const graduatedCount = allClients.filter((c) => c.status === "graduated").length;

  return (
    <PageShell>
      <PageTransition>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">Client Management</h1>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-page-subtitle">
              Track and manage all enrolled clients and batches
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Active: <span className="font-semibold text-foreground">{activeCount}</span>
              </span>
              <span className="text-muted-foreground">
                Graduated: <span className="font-semibold text-foreground">{graduatedCount}</span>
              </span>
              {stalledCount > 0 && (
                <span style={{ color: "hsl(var(--warning))" }}>
                  <AlertTriangle className="inline mr-1 size-3.5" />
                  Stalled: <span className="font-semibold">{stalledCount}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <Tabs defaultValue="clients" className="space-y-4">
            <TabsList data-testid="tabs-client-management">
              <TabsTrigger value="clients" data-testid="tab-all-clients">
                <Users className="mr-2 size-4" />
                All Clients
              </TabsTrigger>
              <TabsTrigger value="batches" data-testid="tab-batch-manager">
                <Calendar className="mr-2 size-4" />
                Batch Manager
              </TabsTrigger>
            </TabsList>
            <TabsContent value="clients">
              <AllClientsTab />
            </TabsContent>
            <TabsContent value="batches">
              <BatchManagerTab />
            </TabsContent>
          </Tabs>
        )}
      </PageTransition>
    </PageShell>
  );
}
