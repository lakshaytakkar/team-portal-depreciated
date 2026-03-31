import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, CreditCard, Calendar, Users } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ds/status-badge";
import { bookings, tourPackages, type Booking } from "@/lib/mock-data-goyo";
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

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const paymentConfig: Record<string, { variant: "success" | "warning" | "error" | "neutral" }> = {
  full: { variant: "success" },
  partial: { variant: "warning" },
  pending: { variant: "error" },
  refunded: { variant: "neutral" },
};

const visaConfig: Record<string, { variant: "success" | "warning" | "error" | "neutral" | "info" }> = {
  pending: { variant: "warning" },
  applied: { variant: "info" },
  approved: { variant: "success" },
  rejected: { variant: "error" },
};

export default function EventsBookings() {
  const [, navigate] = useLocation();
  const loading = useSimulatedLoading(650);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.booking_status !== statusFilter) return false;
    if (paymentFilter !== "all" && b.payment_status !== paymentFilter) return false;
    if (search && !b.client_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCollected = bookings.reduce((s, b) => s + b.advance_paid, 0);
  const balanceDue = bookings.reduce((s, b) => s + b.balance_due, 0);
  const thisMonth = bookings.filter((b) => b.booking_date.startsWith("2026-02")).length;
  const totalPax = bookings.reduce((s, b) => s + b.passengers, 0);

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
          title="Bookings"
          subtitle={`${bookings.length} total tour bookings`}
          actions={
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 text-white"
              style={{ backgroundColor: EVENTS_COLOR }}
              data-testid="button-new-booking"
            >
              <Plus className="size-4" />
              New Booking
            </Button>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          <StatCard
            label="Total Collected"
            value={formatCurrency(totalCollected)}
            icon={CreditCard}
            iconBg="rgba(76, 175, 80, 0.1)"
            iconColor="#4CAF50"
          />
          <StatCard
            label="Balance Pending"
            value={formatCurrency(balanceDue)}
            icon={CreditCard}
            iconBg="rgba(255, 152, 0, 0.1)"
            iconColor="#FF9800"
          />
          <StatCard
            label="This Month"
            value={thisMonth}
            icon={Calendar}
            iconBg="rgba(233, 30, 99, 0.1)"
            iconColor={EVENTS_COLOR}
          />
          <StatCard
            label="Total Passengers"
            value={totalPax}
            icon={Users}
            iconBg="rgba(33, 150, 243, 0.1)"
            iconColor="#2196F3"
          />
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search by client name..."
          color={EVENTS_COLOR}
          filters={[
            { value: "all", label: "All Status" },
            { value: "confirmed", label: "Confirmed" },
            { value: "pending", label: "Pending" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          activeFilter={statusFilter}
          onFilter={setStatusFilter}
          extra={
            <div className="flex gap-1 ml-4">
              {["all", "full", "partial", "pending"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPaymentFilter(p)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${paymentFilter === p ? "text-white" : "bg-muted text-muted-foreground"}`}
                  style={paymentFilter === p ? { backgroundColor: EVENTS_COLOR } : {}}
                  data-testid={`filter-payment-${p}`}
                >
                  {p}
                </button>
              ))}
            </div>
          }
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Booking ID</DataTH>
                <DataTH>Client</DataTH>
                <DataTH>Package</DataTH>
                <DataTH align="center">Pax</DataTH>
                <DataTH>Total</DataTH>
                <DataTH>Advance</DataTH>
                <DataTH>Balance</DataTH>
                <DataTH>Payment</DataTH>
                <DataTH>Visa</DataTH>
                <DataTH>Travel Date</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => (
                <DataTR key={item.id} onClick={() => navigate(`/events/bookings/${item.id}`)}>
                  <DataTD className="text-[10px]">{item.id}</DataTD>
                  <DataTD>
                    <PersonCell name={item.client_name} subtitle={item.client_phone} size="sm" />
                  </DataTD>
                  <DataTD className="text-xs max-w-[180px] line-clamp-1">{item.package_name}</DataTD>
                  <DataTD align="center" className="font-medium">{item.passengers}</DataTD>
                  <DataTD className="font-medium">{formatCurrency(item.total_amount)}</DataTD>
                  <DataTD className="text-green-600 font-medium">{formatCurrency(item.advance_paid)}</DataTD>
                  <DataTD className={item.balance_due > 0 ? "text-amber-600 font-medium" : "text-green-600"}>
                    {formatCurrency(item.balance_due)}
                  </DataTD>
                  <DataTD>
                    <StatusBadge status={item.payment_status} variant={paymentConfig[item.payment_status].variant} />
                  </DataTD>
                  <DataTD>
                    <StatusBadge status={item.visa_status} variant={visaConfig[item.visa_status]?.variant || "neutral"} />
                  </DataTD>
                  <DataTD className="text-muted-foreground">
                    {new Date(item.travel_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </DataTD>
                </DataTR>
              ))}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="New Booking"
        subtitle="Create a new tour booking for a client"
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              style={{ backgroundColor: EVENTS_COLOR }} 
              className="text-white hover:opacity-90"
              onClick={() => {
                setDialogOpen(false);
                toast({ title: "Booking created", description: "New booking added successfully." });
              }}
            >
              Create Booking
            </Button>
          </>
        }
      >
        <DetailSection title="Package & Client Information">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Tour Package</Label>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Client Name</Label>
                <Input placeholder="Full name" />
              </div>
              <div className="grid gap-1.5">
                <Label>Phone</Label>
                <Input placeholder="+91 98xxx xxxxx" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="client@email.com" />
              </div>
              <div className="grid gap-1.5">
                <Label>City</Label>
                <Input placeholder="Client city" />
              </div>
            </div>
          </div>
        </DetailSection>
        <DetailSection title="Booking Details">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>No. of Passengers</Label>
              <Input type="number" min="1" placeholder="1" />
            </div>
            <div className="grid gap-1.5">
              <Label>Payment Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advance">Advance (₹30,000)</SelectItem>
                  <SelectItem value="full">Full Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5 mt-4">
            <Label>Special Requests</Label>
            <Input placeholder="Dietary needs, room preferences, etc." />
          </div>
        </DetailSection>
      </DetailModal>

      <DetailModal
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        title="Record Payment"
        subtitle="Record a payment received for this booking"
        footer={
          <>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button 
              style={{ backgroundColor: EVENTS_COLOR }} 
              className="text-white hover:opacity-90"
              onClick={() => {
                setPaymentDialogOpen(false);
                toast({ title: "Payment recorded", description: "Payment has been added to the booking." });
              }}
            >
              Record Payment
            </Button>
          </>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Amount (₹)</Label>
              <Input type="number" placeholder="e.g. 30000" />
            </div>
            <div className="grid gap-1.5">
              <Label>Payment Mode</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="NEFT">NEFT</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Reference / UTR Number</Label>
            <Input placeholder="Transaction reference" />
          </div>
        </div>
      </DetailModal>
    </PageShell>
  );
}
