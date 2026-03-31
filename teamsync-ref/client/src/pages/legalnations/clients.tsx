import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Mail, Phone, Globe, IndianRupee } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { FormDialog } from "@/components/ds/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";
import { PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const LEGALNATIONS_COLOR = "#225AEA";

const LLC_STATUSES = [
  "LLC Booked", "Onboarded", "LLC Under Formation", "Under EIN",
  "Under Website Formation", "EIN received", "Received EIN Letter",
  "Under BOI", "Under Banking", "Under Payment Gateway",
  "Ready to Deliver", "Delivered", "Refunded",
];

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "LLC Booked": "neutral",
  "Onboarded": "info",
  "LLC Under Formation": "info",
  "Under EIN": "warning",
  "Under Website Formation": "warning",
  "EIN received": "info",
  "Received EIN Letter": "info",
  "Under BOI": "warning",
  "Under Banking": "warning",
  "Under Payment Gateway": "warning",
  "Ready to Deliver": "info",
  "Delivered": "success",
  "Refunded": "error",
};

const healthVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "Healthy": "success",
  "Neutral": "neutral",
  "At Risk": "warning",
  "Critical": "error",
};

interface LNClient {
  id: string;
  client_code: string;
  client_name: string;
  email: string | null;
  contact_number: string | null;
  country: string | null;
  plan: string;
  website_included: boolean;
  client_health: string | null;
  llc_name: string | null;
  llc_status: string;
  bank_name: string | null;
  amount_received: number;
  remaining_payment: number;
  date_of_payment: string | null;
  date_of_onboarding: string | null;
  notes: string | null;
  created_at: string;
}

export default function ClientsPage() {
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    client_code: "",
    client_name: "",
    llc_name: "",
    email: "",
    contact_number: "",
    country: "India",
    plan: "Elite",
    website_included: true,
  });
  const { toast } = useToast();

  const { data: clientsData, isLoading } = useQuery<{ clients: LNClient[]; total: number }>({
    queryKey: ["/api/legalnations/clients"],
    queryFn: async () => {
      const res = await fetch("/api/legalnations/clients?limit=500");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/legalnations/clients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legalnations/clients"] });
      setDialogOpen(false);
      toast({ title: "Client created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error creating client", description: err.message, variant: "destructive" });
    },
  });

  const clients = clientsData?.clients || [];

  const formatCurrency = (val: number) => {
    if (!val) return "—";
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const columns: Column<LNClient>[] = [
    {
      key: "client_code",
      header: "Client ID",
      sortable: true,
      render: (item) => (
        <span className="text-xs font-mono text-muted-foreground" data-testid={`text-client-code-${item.id}`}>
          {item.client_code}
        </span>
      ),
    },
    {
      key: "client_name",
      header: "Client",
      sortable: true,
      render: (item) => item.llc_name ? (
        <CompanyCell
          name={item.llc_name}
          subtitle={item.client_name}
        />
      ) : (
        <PersonCell
          name={item.client_name}
          subtitle="No LLC assigned"
        />
      ),
    },
    {
      key: "llc_status",
      header: "Status",
      sortable: true,
      render: (item) => (
        <StatusBadge
          status={item.llc_status}
          variant={statusVariantMap[item.llc_status] || "neutral"}
        />
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (item) => (
        <StatusBadge
          status={item.plan}
          variant={item.plan === "Elite" ? "info" : "neutral"}
        />
      ),
    },
    {
      key: "country",
      header: "Country",
      sortable: true,
      render: (item) => (
        <span className="text-sm flex items-center gap-1">
          <Globe className="size-3 text-muted-foreground" />
          {item.country || "—"}
        </span>
      ),
    },
    {
      key: "amount_received",
      header: "Amount",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium flex items-center gap-0.5" data-testid={`text-amount-${item.id}`}>
          {formatCurrency(item.amount_received)}
        </span>
      ),
    },
    {
      key: "bank_name",
      header: "Bank",
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.bank_name || "—"}</span>
      ),
    },
    {
      key: "client_health",
      header: "Health",
      render: (item) => item.client_health ? (
        <StatusBadge
          status={item.client_health}
          variant={healthVariantMap[item.client_health] || "neutral"}
        />
      ) : <span className="text-sm text-muted-foreground">—</span>,
    },
    {
      key: "_contact",
      header: "",
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.contact_number && (
            <a
              href={`https://wa.me/${item.contact_number.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              data-testid={`btn-whatsapp-${item.id}`}
            >
              <Button variant="ghost" size="icon" className="text-green-600">
                <SiWhatsapp className="size-4" />
              </Button>
            </a>
          )}
          {item.email && (
            <a href={`mailto:${item.email}`} data-testid={`btn-email-${item.id}`}>
              <Button variant="ghost" size="icon">
                <Mail className="size-4" />
              </Button>
            </a>
          )}
        </div>
      ),
    },
  ];

  const handleCreateClient = () => {
    if (!newClient.client_name) return;
    const code = newClient.client_code || `SUPLLC${Date.now().toString().slice(-4)}`;
    createMutation.mutate({ ...newClient, client_code: code });
  };

  return (
    <PageShell>
      <PageTransition>
        {isLoading ? (
          <TableSkeleton rows={10} columns={8} />
        ) : (
          <DataTable
            data={clients}
            columns={columns}
            searchPlaceholder="Search by name, LLC, code, or email..."
            onRowClick={(item) => navigate(`/legalnations/clients/${item.id}`)}
            filters={[
              { label: "Status", key: "llc_status", options: LLC_STATUSES },
              { label: "Plan", key: "plan", options: ["Elite", "Basic", "Community Access"] },
              { label: "Health", key: "client_health", options: ["Healthy", "Neutral", "At Risk", "Critical"] },
            ]}
            headerActions={
              <>
                <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
                <Button size="sm" onClick={() => setDialogOpen(true)} data-testid="button-add-client">
                  <Plus className="mr-1.5 size-3.5" />
                  Add Client
                </Button>
              </>
            }
          />
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add New Client"
          onSubmit={handleCreateClient}
          submitLabel="Create Client"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clientCode">Client ID</Label>
              <Input
                id="clientCode"
                placeholder="SUPLLC1300"
                value={newClient.client_code}
                onChange={(e) => setNewClient({ ...newClient, client_code: e.target.value })}
                data-testid="input-client-code"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="Full Name"
                value={newClient.client_name}
                onChange={(e) => setNewClient({ ...newClient, client_name: e.target.value })}
                data-testid="input-client-name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="llcName">LLC Name</Label>
              <Input
                id="llcName"
                placeholder="Company LLC"
                value={newClient.llc_name}
                onChange={(e) => setNewClient({ ...newClient, llc_name: e.target.value })}
                data-testid="input-llc-name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@email.com"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                data-testid="input-email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Contact Number</Label>
              <Input
                id="phone"
                placeholder="+91XXXXXXXXXX"
                value={newClient.contact_number}
                onChange={(e) => setNewClient({ ...newClient, contact_number: e.target.value })}
                data-testid="input-phone"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="India"
                value={newClient.country}
                onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                data-testid="input-country"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan">Plan</Label>
              <Select value={newClient.plan} onValueChange={(v) => setNewClient({ ...newClient, plan: v })}>
                <SelectTrigger data-testid="select-plan">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Elite">Elite</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Community Access">Community Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="website">Website Included</Label>
              <Select
                value={newClient.website_included ? "yes" : "no"}
                onValueChange={(v) => setNewClient({ ...newClient, website_included: v === "yes" })}
              >
                <SelectTrigger data-testid="select-website">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormDialog>
      </PageTransition>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["legalnations-clients"].sop} color={LEGALNATIONS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["legalnations-clients"].tutorial} color={LEGALNATIONS_COLOR} />
    </PageShell>
  );
}
